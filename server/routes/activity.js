/**
 * routes/activity.js — Real-Time Login & Application Activity Monitoring
 * Safe, isolated, non-blocking module.
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { requireAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── SSE Active Admin Connections Pool ────────────────────────────
const sseClients = new Set();

/**
 * Broadcast event to all connected admin SSE streams
 */
function broadcastAdmin(eventType, payload) {
  if (!sseClients.size) return;
  const msg = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(msg);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Keepalive heartbeat for SSE connections every 20 seconds
const ssePingTimer = setInterval(() => {
  for (const client of sseClients) {
    try {
      client.res.write(': keepalive\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  }
}, 20000);
if (ssePingTimer.unref) ssePingTimer.unref();

// Background cleanup of stale sessions every 45 seconds
const cleanupTimer = setInterval(() => {
  try {
    if (db.cleanupExpiredActivity) {
      db.cleanupExpiredActivity(30);
    }
  } catch (e) {}
}, 45000);
if (cleanupTimer.unref) cleanupTimer.unref();

// ── Helpers ───────────────────────────────────────────────────────
function sanitizeText(str, maxLen = 100) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

function sanitizeSessionId(id) {
  if (typeof id !== 'string') return '';
  return id.replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 64);
}

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
}

function getSessionGuestLabel(sessionId) {
  const shortCode = (sessionId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || 'GUEST';
  return `Guest #${shortCode}`;
}

// ── 1. POST /api/activity/open ────────────────────────────────────
// Lightweight application-open event
router.post('/open', (req, res) => {
  try {
    const rawSid = req.body.session_id;
    const sessionId = sanitizeSessionId(rawSid);
    if (!sessionId) {
      return res.status(400).json({ error: 'Valid session_id required' });
    }

    const userId = sanitizeText(req.body.user_id || '', 64);
    const displayName = sanitizeText(req.body.display_name || '', 100) || (userId ? 'User' : getSessionGuestLabel(sessionId));
    const role = sanitizeText(req.body.role || (userId ? 'USER' : 'GUEST'), 30);
    const deviceType = sanitizeText(req.body.device_type || 'Desktop', 50);
    const browser = sanitizeText(req.body.browser || 'Unknown Browser', 50);
    const os = sanitizeText(req.body.os || 'Unknown OS', 50);
    const activeTabs = Math.max(1, Math.min(20, parseInt(req.body.active_tabs, 10) || 1));

    // Upsert session
    const existing = db.get('SELECT id FROM activity_sessions WHERE session_id = ?', [sessionId]);
    if (existing) {
      db.run(
        `UPDATE activity_sessions 
         SET user_id = ?, display_name = ?, role = ?, status = 'ONLINE', last_seen_at = datetime('now'),
             device_type = ?, browser = ?, os = ?, active_tabs = ?, updated_at = datetime('now')
         WHERE session_id = ?`,
        [userId, displayName, role, deviceType, browser, os, activeTabs, sessionId]
      );
    } else {
      db.run(
        `INSERT INTO activity_sessions 
         (session_id, user_id, display_name, role, status, started_at, last_seen_at, device_type, browser, os, active_tabs)
         VALUES (?, ?, ?, ?, 'ONLINE', datetime('now'), datetime('now'), ?, ?, ?, ?)`,
        [sessionId, userId, displayName, role, deviceType, browser, os, activeTabs]
      );
    }

    // Record APP_OPEN event
    const metadata = JSON.stringify({
      device: deviceType,
      browser,
      os,
      tabs: activeTabs
    });

    const eventId = db.insert(
      `INSERT INTO activity_events (session_id, user_id, display_name, event_type, metadata, timestamp)
       VALUES (?, ?, ?, 'APP_OPEN', ?, datetime('now'))`,
      [sessionId, userId, displayName, metadata]
    );

    const eventPayload = {
      id: eventId,
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      event_type: 'APP_OPEN',
      metadata,
      timestamp: new Date().toISOString()
    };

    // Broadcast to real-time admin clients
    broadcastAdmin('activity', eventPayload);
    broadcastAdmin('session_update', {
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      role,
      status: 'ONLINE',
      device_type: deviceType,
      browser,
      os,
      active_tabs: activeTabs,
      last_seen_at: new Date().toISOString()
    });

    res.json({ success: true, session_id: sessionId, status: 'ONLINE' });
  } catch (err) {
    console.error('[ActivityAPI] Error in /open:', err.message);
    res.status(500).json({ error: 'Non-critical activity error' });
  }
});

// ── 2. POST /api/activity/login ───────────────────────────────────
// Successful login event
router.post('/login', (req, res) => {
  try {
    const sessionId = sanitizeSessionId(req.body.session_id);
    if (!sessionId) {
      return res.status(400).json({ error: 'Valid session_id required' });
    }

    const userId = sanitizeText(String(req.body.user_id || ''), 64);
    const displayName = sanitizeText(req.body.display_name || req.body.email || 'Authenticated User', 100);
    const role = sanitizeText(req.body.role || 'USER', 30);
    const deviceType = sanitizeText(req.body.device_type || 'Desktop', 50);
    const browser = sanitizeText(req.body.browser || 'Unknown Browser', 50);
    const os = sanitizeText(req.body.os || 'Unknown OS', 50);

    // Update session with authenticated profile
    const existing = db.get('SELECT id FROM activity_sessions WHERE session_id = ?', [sessionId]);
    if (existing) {
      db.run(
        `UPDATE activity_sessions 
         SET user_id = ?, display_name = ?, role = ?, status = 'ONLINE', last_seen_at = datetime('now'),
             device_type = ?, browser = ?, os = ?, updated_at = datetime('now')
         WHERE session_id = ?`,
        [userId, displayName, role, deviceType, browser, os, sessionId]
      );
    } else {
      db.run(
        `INSERT INTO activity_sessions 
         (session_id, user_id, display_name, role, status, started_at, last_seen_at, device_type, browser, os, active_tabs)
         VALUES (?, ?, ?, ?, 'ONLINE', datetime('now'), datetime('now'), ?, ?, ?, 1)`,
        [sessionId, userId, displayName, role, deviceType, browser, os]
      );
    }

    // Record LOGIN_SUCCESS event
    const metadata = JSON.stringify({
      device: deviceType,
      browser,
      os,
      role
    });

    const eventId = db.insert(
      `INSERT INTO activity_events (session_id, user_id, display_name, event_type, metadata, timestamp)
       VALUES (?, ?, ?, 'LOGIN_SUCCESS', ?, datetime('now'))`,
      [sessionId, userId, displayName, metadata]
    );

    const eventPayload = {
      id: eventId,
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      event_type: 'LOGIN_SUCCESS',
      metadata,
      timestamp: new Date().toISOString()
    };

    broadcastAdmin('activity', eventPayload);
    broadcastAdmin('session_update', {
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      role,
      status: 'ONLINE',
      device_type: deviceType,
      browser,
      os,
      last_seen_at: new Date().toISOString()
    });

    res.json({ success: true, session_id: sessionId });
  } catch (err) {
    console.error('[ActivityAPI] Error in /login:', err.message);
    res.status(500).json({ error: 'Non-critical activity error' });
  }
});

// ── 3. POST /api/activity/heartbeat ───────────────────────────────
// Keepalive heartbeat sent every 20-30 seconds
router.post('/heartbeat', (req, res) => {
  try {
    const sessionId = sanitizeSessionId(req.body.session_id);
    if (!sessionId) {
      return res.status(400).json({ error: 'Valid session_id required' });
    }

    const clientStatus = (req.body.status === 'IDLE' ? 'IDLE' : 'ONLINE');
    const activeTabs = Math.max(1, Math.min(20, parseInt(req.body.active_tabs, 10) || 1));

    const existing = db.get('SELECT * FROM activity_sessions WHERE session_id = ?', [sessionId]);
    if (existing) {
      db.run(
        `UPDATE activity_sessions 
         SET status = ?, last_seen_at = datetime('now'), active_tabs = ?, updated_at = datetime('now')
         WHERE session_id = ?`,
        [clientStatus, activeTabs, sessionId]
      );
    } else {
      const displayName = getSessionGuestLabel(sessionId);
      db.run(
        `INSERT INTO activity_sessions 
         (session_id, user_id, display_name, role, status, started_at, last_seen_at, active_tabs)
         VALUES (?, '', ?, 'GUEST', ?, datetime('now'), datetime('now'), ?)`,
        [sessionId, displayName, clientStatus, activeTabs]
      );
    }

    // Broadcast session update to real-time admin clients
    broadcastAdmin('session_update', {
      session_id: sessionId,
      status: clientStatus,
      active_tabs: activeTabs,
      last_seen_at: new Date().toISOString()
    });

    res.json({ success: true, status: clientStatus });
  } catch (err) {
    console.error('[ActivityAPI] Error in /heartbeat:', err.message);
    res.status(500).json({ error: 'Non-critical activity error' });
  }
});

// ── 4. POST /api/activity/state ───────────────────────────────────
// Explicit idle or active state transition
router.post('/state', (req, res) => {
  try {
    const sessionId = sanitizeSessionId(req.body.session_id);
    if (!sessionId) {
      return res.status(400).json({ error: 'Valid session_id required' });
    }

    const state = req.body.status === 'IDLE' ? 'IDLE' : 'ONLINE';
    const eventType = state === 'IDLE' ? 'IDLE' : 'ACTIVE';

    const session = db.get('SELECT * FROM activity_sessions WHERE session_id = ?', [sessionId]);
    const userId = session ? session.user_id : '';
    const displayName = session ? session.display_name : getSessionGuestLabel(sessionId);

    if (session) {
      db.run(
        `UPDATE activity_sessions SET status = ?, last_seen_at = datetime('now'), updated_at = datetime('now') WHERE session_id = ?`,
        [state, sessionId]
      );
    }

    const eventId = db.insert(
      `INSERT INTO activity_events (session_id, user_id, display_name, event_type, metadata, timestamp)
       VALUES (?, ?, ?, ?, '{}', datetime('now'))`,
      [sessionId, userId, displayName, eventType]
    );

    const eventPayload = {
      id: eventId,
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      event_type: eventType,
      timestamp: new Date().toISOString()
    };

    broadcastAdmin('activity', eventPayload);
    broadcastAdmin('session_update', {
      session_id: sessionId,
      status: state,
      last_seen_at: new Date().toISOString()
    });

    res.json({ success: true, status: state });
  } catch (err) {
    console.error('[ActivityAPI] Error in /state:', err.message);
    res.status(500).json({ error: 'Non-critical activity error' });
  }
});

// ── 5. POST /api/activity/logout ──────────────────────────────────
// User logout or explicit tab/session departure
router.post('/logout', (req, res) => {
  try {
    const sessionId = sanitizeSessionId(req.body.session_id);
    if (!sessionId) {
      return res.status(400).json({ error: 'Valid session_id required' });
    }

    const session = db.get('SELECT * FROM activity_sessions WHERE session_id = ?', [sessionId]);
    const userId = session ? session.user_id : sanitizeText(req.body.user_id || '', 64);
    const displayName = session ? session.display_name : 'User';

    db.run(
      `UPDATE activity_sessions 
       SET status = 'OFFLINE', ended_at = datetime('now'), last_seen_at = datetime('now'), updated_at = datetime('now')
       WHERE session_id = ?`,
      [sessionId]
    );

    const eventId = db.insert(
      `INSERT INTO activity_events (session_id, user_id, display_name, event_type, metadata, timestamp)
       VALUES (?, ?, ?, 'LOGOUT', '{}', datetime('now'))`,
      [sessionId, userId, displayName]
    );

    const eventPayload = {
      id: eventId,
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      event_type: 'LOGOUT',
      timestamp: new Date().toISOString()
    };

    broadcastAdmin('activity', eventPayload);
    broadcastAdmin('session_update', {
      session_id: sessionId,
      status: 'OFFLINE',
      ended_at: new Date().toISOString()
    });

    res.json({ success: true, status: 'OFFLINE' });
  } catch (err) {
    console.error('[ActivityAPI] Error in /logout:', err.message);
    res.status(500).json({ error: 'Non-critical activity error' });
  }
});

// ── 6. ADMIN-ONLY: GET /api/admin/activity/live ───────────────────
router.get(['/live', '/admin/live'], requireAdmin, (req, res) => {
  try {
    if (db.cleanupExpiredActivity) {
      db.cleanupExpiredActivity(30);
    }

    const allSessions = db.all(
      `SELECT id, session_id, user_id, display_name, role, status, started_at, last_seen_at, ended_at,
              device_type, browser, os, active_tabs, updated_at
       FROM activity_sessions 
       WHERE datetime(updated_at) >= datetime('now', '-24 hours')
       ORDER BY last_seen_at DESC LIMIT 150`
    );

    // Compute active statuses dynamically against 75-second heartbeat threshold
    const nowMs = Date.now();
    let onlineCount = 0;
    let idleCount = 0;
    let offlineCount = 0;

    const evaluatedSessions = allSessions.map(s => {
      const lastSeenMs = new Date(s.last_seen_at + (s.last_seen_at.includes('Z') ? '' : 'Z')).getTime();
      const diffSec = Math.max(0, Math.floor((nowMs - lastSeenMs) / 1000));
      
      let computedStatus = s.status;
      if (s.status === 'OFFLINE' || s.ended_at) {
        computedStatus = 'OFFLINE';
      } else if (diffSec > 75) {
        computedStatus = 'OFFLINE';
      } else if (s.status === 'IDLE') {
        computedStatus = 'IDLE';
      } else {
        computedStatus = 'ONLINE';
      }

      if (computedStatus === 'ONLINE') onlineCount++;
      else if (computedStatus === 'IDLE') idleCount++;
      else offlineCount++;

      return {
        ...s,
        status: computedStatus,
        seconds_ago: diffSec
      };
    });

    res.json({
      success: true,
      stats: {
        totalLive: onlineCount + idleCount,
        onlineCount,
        idleCount,
        offlineCount,
        totalTracked: evaluatedSessions.length
      },
      sessions: evaluatedSessions
    });
  } catch (err) {
    console.error('[ActivityAPI] Error in /admin/live:', err.message);
    res.status(500).json({ error: 'Failed to retrieve live user activity' });
  }
});

// ── 7. ADMIN-ONLY: GET /api/admin/activity/recent ─────────────────
router.get(['/recent', '/admin/recent'], requireAdmin, (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const eventType = sanitizeText(req.query.type || '', 30);

    let query = 'SELECT id, session_id, user_id, display_name, event_type, metadata, timestamp FROM activity_events ';
    const params = [];

    if (eventType) {
      query += 'WHERE event_type = ? ';
      params.push(eventType);
    }

    query += 'ORDER BY id DESC LIMIT ?';
    params.push(limit);

    const events = db.all(query, params);

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    console.error('[ActivityAPI] Error in /admin/recent:', err.message);
    res.status(500).json({ error: 'Failed to retrieve recent activity events' });
  }
});

// ── 8. ADMIN-ONLY: GET /api/admin/activity/stream (SSE) ───────────
// Server-Sent Events real-time event push for MedInVedic Admin Dashboard
router.get(['/stream', '/admin/stream'], (req, res) => {
  // Support Bearer header or query token for EventSource compatibility
  const token = (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer '))
    ? req.headers['authorization'].split(' ')[1]
    : req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required for activity stream' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const role = (payload.role || '').toLowerCase();
    const email = (payload.email || '').toLowerCase().trim();
    const isOwner = email === 'maheshbadiger079@gmail.com';
    const isAdmin = ['admin', 'super_admin'].includes(role) || isOwner;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Administrator access required' });
    }

    // Set SSE HTTP response headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': req.headers.origin || '*'
    });

    res.write('retry: 5000\n\n');
    res.write(`event: connected\ndata: ${JSON.stringify({ connected: true, admin: email, time: new Date().toISOString() })}\n\n`);

    const clientRef = { res, email };
    sseClients.add(clientRef);

    // Initial state push
    try {
      const liveSessions = db.all(
        `SELECT id, session_id, user_id, display_name, role, status, started_at, last_seen_at,
                device_type, browser, os, active_tabs
         FROM activity_sessions 
         WHERE datetime(updated_at) >= datetime('now', '-24 hours')
         ORDER BY last_seen_at DESC LIMIT 50`
      );
      const recentEvents = db.all(
        `SELECT id, session_id, user_id, display_name, event_type, metadata, timestamp 
         FROM activity_events ORDER BY id DESC LIMIT 25`
      );

      res.write(`event: init_data\ndata: ${JSON.stringify({ liveSessions, recentEvents })}\n\n`);
    } catch (e) {}

    req.on('close', () => {
      sseClients.delete(clientRef);
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
});

module.exports = router;
