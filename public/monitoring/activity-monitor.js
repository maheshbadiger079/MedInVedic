/**
 * MedInVedic — Real-Time Application Activity & Presence Monitor
 * SAFE, ISOLATED, NON-BLOCKING CLIENT MODULE
 * 
 * Guarantees:
 * - Minimal coupling; failure will NEVER interrupt core application functionality.
 * - Strict Privacy: Zero capture of credentials, passwords, tokens, payments, or medical data.
 * - Accurate session management across page refreshes and multi-tab coordination.
 */
(function (global) {
  'use strict';

  if (global.__miv_activity_monitor_initialized) {
    return;
  }
  global.__miv_activity_monitor_initialized = true;

  // ── Configuration Constants ─────────────────────────────────────
  const HEARTBEAT_INTERVAL_MS = 25000;   // 25 seconds heartbeat
  const IDLE_THRESHOLD_MS     = 120000;  // 2 minutes inactivity = IDLE
  const TAB_STALE_MS          = 35000;   // Tabs older than 35s pruned
  const STORAGE_SESSION_KEY   = 'miv_monitor_session_id';
  const STORAGE_TAB_KEY       = 'miv_monitor_tab_id';
  const STORAGE_TABS_PREFIX   = 'miv_monitor_tabs_';
  const SESSION_OPEN_REPORTED = 'miv_monitor_open_reported';

  // ── Environment Detection ───────────────────────────────────────
  function getApiBase() {
    try {
      const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
      return isLocal
        ? `${window.location.protocol}//${window.location.hostname}:3001/api`
        : '/api';
    } catch (e) {
      return '/api';
    }
  }

  // ── Client Device, OS & Browser Category Detection ──────────────
  function detectClientEnvironment() {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    
    // Operating System Category
    let os = 'Unknown OS';
    if (/windows phone/i.test(ua)) os = 'Windows Phone';
    else if (/win/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/mac/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    // Browser Category
    let browser = 'Unknown Browser';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opr|opera/i.test(ua)) browser = 'Opera';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

    // Device Category
    let deviceType = 'Desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      deviceType = 'Tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      deviceType = 'Mobile';
    }

    return { os, browser, deviceType };
  }

  // ── Secure Random Session Identifier ────────────────────────────
  function getOrCreateSessionId() {
    try {
      let sid = sessionStorage.getItem(STORAGE_SESSION_KEY);
      if (!sid) {
        sid = 's_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        sessionStorage.setItem(STORAGE_SESSION_KEY, sid);
      }
      return sid;
    } catch (e) {
      return 's_tmp_' + Math.random().toString(36).substring(2, 9);
    }
  }

  // ── Multi-Tab Coordination ──────────────────────────────────────
  function getOrCreateTabId() {
    try {
      let tid = sessionStorage.getItem(STORAGE_TAB_KEY);
      if (!tid) {
        tid = 't_' + Math.random().toString(36).substring(2, 8);
        sessionStorage.setItem(STORAGE_TAB_KEY, tid);
      }
      return tid;
    } catch (e) {
      return 't_' + Math.random().toString(36).substring(2, 8);
    }
  }

  function getActiveTabCount(sessionId, currentTabId) {
    try {
      const storageKey = STORAGE_TABS_PREFIX + sessionId;
      const raw = localStorage.getItem(storageKey);
      const registry = raw ? JSON.parse(raw) : {};
      const now = Date.now();

      // Prune dead tabs and update current tab timestamp
      const updated = {};
      updated[currentTabId] = now;
      for (const tid in registry) {
        if (tid !== currentTabId && (now - registry[tid]) < TAB_STALE_MS) {
          updated[tid] = registry[tid];
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(updated));
      return Object.keys(updated).length;
    } catch (e) {
      return 1;
    }
  }

  function unregisterTab(sessionId, tabId) {
    try {
      const storageKey = STORAGE_TABS_PREFIX + sessionId;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const registry = JSON.parse(raw);
        delete registry[tabId];
        localStorage.setItem(storageKey, JSON.stringify(registry));
      }
    } catch (e) {}
  }

  // ── User Identity Helper (Legitimate & Sanitized) ───────────────
  function getCurrentUserIdentity() {
    try {
      // Check AuthGuard if available
      if (global.AuthGuard && typeof global.AuthGuard.getAuthUser === 'function') {
        const u = global.AuthGuard.getAuthUser();
        if (u) {
          return {
            userId: String(u.uid || u.id || ''),
            displayName: u.displayName || u.name || (u.email ? u.email.split('@')[0] : 'User'),
            email: u.email || '',
            role: (u.role || 'USER').toUpperCase()
          };
        }
      }

      // Check localStorage mv_auth_user
      const raw = localStorage.getItem('mv_auth_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.uid || parsed.id || parsed.email)) {
          return {
            userId: String(parsed.uid || parsed.id || ''),
            displayName: parsed.displayName || parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'User'),
            email: parsed.email || '',
            role: (parsed.role || 'USER').toUpperCase()
          };
        }
      }
    } catch (e) {}

    return {
      userId: '',
      displayName: '',
      email: '',
      role: 'GUEST'
    };
  }

  // ── Safe Non-blocking Dispatcher ────────────────────────────────
  async function postActivity(endpoint, payload) {
    try {
      const url = `${getApiBase()}/activity/${endpoint}`;
      const body = JSON.stringify(payload);

      // Prefer standard fetch with keepalive
      if (typeof fetch === 'function') {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true
        }).catch(function () {
          // Non-blocking fail-safe: monitoring errors never bubble to UI
        });
      } else if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    } catch (e) {
      // Non-blocking fail-safe
    }
  }

  // ── ActivityMonitor Singleton Instance ──────────────────────────
  const ActivityMonitor = {
    sessionId: null,
    tabId: null,
    status: 'ONLINE', // 'ONLINE', 'IDLE', 'OFFLINE'
    heartbeatTimer: null,
    idleTimer: null,
    lastActivityTime: Date.now(),
    destroyed: false,

    initialize: function () {
      if (this.destroyed) return;
      try {
        this.sessionId = getOrCreateSessionId();
        this.tabId = getOrCreateTabId();
        this.lastActivityTime = Date.now();

        // 1. Report Application Open
        this.appOpened();

        // 2. Start Presence Heartbeat Loop
        this.startHeartbeat();

        // 3. Setup Activity & Inactivity Detection
        this.setupInactivityListeners();

        // 4. Handle Window Unload / Page Hide
        this.setupUnloadListeners();
      } catch (e) {
        console.warn('[ActivityMonitor] Init handled safely:', e.message);
      }
    },

    appOpened: function () {
      try {
        const env = detectClientEnvironment();
        const user = getCurrentUserIdentity();
        const activeTabs = getActiveTabCount(this.sessionId, this.tabId);

        // Only report full APP_OPEN event once per session to avoid duplicate counts on page refresh
        const alreadyReported = sessionStorage.getItem(SESSION_OPEN_REPORTED);
        if (!alreadyReported) {
          sessionStorage.setItem(SESSION_OPEN_REPORTED, 'true');
          postActivity('open', {
            session_id: this.sessionId,
            user_id: user.userId,
            display_name: user.displayName,
            role: user.role,
            device_type: env.deviceType,
            browser: env.browser,
            os: env.os,
            active_tabs: activeTabs
          });
        } else {
          // On refresh, send heartbeat to confirm continued presence
          this.heartbeat();
        }
      } catch (e) {}
    },

    reportLogin: function (customUserData) {
      try {
        const env = detectClientEnvironment();
        const user = customUserData || getCurrentUserIdentity();
        this.status = 'ONLINE';
        this.lastActivityTime = Date.now();

        postActivity('login', {
          session_id: this.sessionId,
          user_id: user.uid || user.userId || user.id || '',
          display_name: user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'User'),
          email: user.email || '',
          role: (user.role || 'USER').toUpperCase(),
          device_type: env.deviceType,
          browser: env.browser,
          os: env.os
        });
      } catch (e) {}
    },

    heartbeat: function () {
      if (this.destroyed || this.status === 'OFFLINE') return;
      try {
        const activeTabs = getActiveTabCount(this.sessionId, this.tabId);
        postActivity('heartbeat', {
          session_id: this.sessionId,
          status: this.status,
          active_tabs: activeTabs
        });
      } catch (e) {}
    },

    startHeartbeat: function () {
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      const self = this;
      this.heartbeatTimer = setInterval(function () {
        self.heartbeat();
      }, HEARTBEAT_INTERVAL_MS);
    },

    setIdle: function () {
      if (this.status === 'IDLE' || this.status === 'OFFLINE') return;
      this.status = 'IDLE';
      try {
        postActivity('state', {
          session_id: this.sessionId,
          status: 'IDLE'
        });
      } catch (e) {}
    },

    setActive: function () {
      this.lastActivityTime = Date.now();
      if (this.status === 'IDLE') {
        this.status = 'ONLINE';
        try {
          postActivity('state', {
            session_id: this.sessionId,
            status: 'ONLINE'
          });
        } catch (e) {}
      }
    },

    reportLogout: function () {
      try {
        this.status = 'OFFLINE';
        const user = getCurrentUserIdentity();
        postActivity('logout', {
          session_id: this.sessionId,
          user_id: user.userId
        });
      } catch (e) {}
    },

    setupInactivityListeners: function () {
      const self = this;
      const onUserAction = function () {
        self.setActive();
      };

      // Passive event listeners for minimal performance impact
      const opts = { passive: true };
      window.addEventListener('mousemove', onUserAction, opts);
      window.addEventListener('keydown', onUserAction, opts);
      window.addEventListener('touchstart', onUserAction, opts);
      window.addEventListener('scroll', onUserAction, opts);
      window.addEventListener('click', onUserAction, opts);

      // Periodically check for idle transition
      this.idleTimer = setInterval(function () {
        if (self.status === 'ONLINE' && (Date.now() - self.lastActivityTime) > IDLE_THRESHOLD_MS) {
          self.setIdle();
        }
      }, 15000);
    },

    setupUnloadListeners: function () {
      const self = this;
      const onUnload = function () {
        try {
          unregisterTab(self.sessionId, self.tabId);
          // If no other tabs remain, send non-blocking beacon
          const storageKey = STORAGE_TABS_PREFIX + self.sessionId;
          const raw = localStorage.getItem(storageKey);
          const registry = raw ? JSON.parse(raw) : {};
          if (Object.keys(registry).length === 0) {
            // Last tab closed: beacon session logout/offline
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
              const url = `${getApiBase()}/activity/logout`;
              const blob = new Blob([JSON.stringify({ session_id: self.sessionId })], { type: 'application/json' });
              navigator.sendBeacon(url, blob);
            }
          }
        } catch (e) {}
      };

      window.addEventListener('pagehide', onUnload);
      window.addEventListener('beforeunload', onUnload);
    },

    destroy: function () {
      this.destroyed = true;
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      if (this.idleTimer) clearInterval(this.idleTimer);
    }
  };

  // Expose globally
  global.ActivityMonitor = ActivityMonitor;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityMonitor;
  }

  // Auto-initialize safely after DOM load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        ActivityMonitor.initialize();
      });
    } else {
      setTimeout(function () {
        ActivityMonitor.initialize();
      }, 100);
    }
  }

})(typeof window !== 'undefined' ? window : global);
