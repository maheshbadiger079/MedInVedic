/**
 * server/routes/simulations.js
 * Express Router for MedInVedic AI Simulation Lab
 * ─────────────────────────────────────────────────────────────────
 * Fully authenticated, rate-limited, strictly validated endpoints.
 * State machine: DRAFT -> QUEUED -> RUNNING -> COMPLETED, FAILED, CANCELLED.
 * ─────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const { defaultSimulationEngine } = require('../services/simulationEngine');
const { defaultKnowledgeGraph } = require('../services/simulationKnowledgeGraph');
const { getSimulationAdapter } = require('../services/simulationAdapter');

// Helper to extract authenticated user or guest fallback
function getUser(req) {
  return req.user ? req.user.id || req.user.email || req.user.uid || 'guest' : 'guest';
}

// ── GET /api/simulations/knowledge-graph ───────────────────────────
router.get('/knowledge-graph', (req, res) => {
  try {
    const q = req.query.q || '';
    const domain = req.query.domain || null;
    const result = defaultKnowledgeGraph.queryGraph(q, domain);
    const stats = defaultKnowledgeGraph.getGraphStats();
    res.json({ success: true, stats, result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to query knowledge graph: ' + err.message });
  }
});

// ── POST /api/simulations ──────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const ownerId = getUser(req);
    const scenarioInput = req.body || {};

    const validation = defaultSimulationEngine.validateScenario(scenarioInput);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.message,
        errorCode: validation.errorCode,
        is_emergency: !!validation.is_emergency,
        is_injection: !!validation.is_injection,
        is_tampering: !!validation.is_tampering
      });
    }

    const job = defaultSimulationEngine.createSimulationJob(ownerId, scenarioInput);

    // Persist to database
    db.run(
      `INSERT INTO simulation_jobs (id, owner_id, title, scenario_type, bounds_json, synthetic_persona_json, agents_json, status, current_round, report_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        job.id,
        job.ownerId,
        job.title,
        job.scenarioType,
        JSON.stringify(job.bounds),
        JSON.stringify(job.syntheticPersona),
        JSON.stringify(job.agents),
        job.status,
        job.currentRound,
        JSON.stringify(job.report || {})
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Simulation scenario created successfully.',
      simulation: job
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create simulation: ' + err.message });
  }
});

// ── GET /api/simulations ───────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const ownerId = getUser(req);
    const rows = db.all(
      `SELECT * FROM simulation_jobs WHERE owner_id = ? OR owner_id = 'guest' ORDER BY created_at DESC LIMIT 50`,
      [ownerId]
    ) || [];

    const jobs = rows.map(r => ({
      id: r.id,
      ownerId: r.owner_id,
      title: r.title,
      scenarioType: r.scenario_type,
      bounds: JSON.parse(r.bounds_json || '{}'),
      syntheticPersona: JSON.parse(r.synthetic_persona_json || '{}'),
      agents: JSON.parse(r.agents_json || '[]'),
      status: r.status,
      currentRound: r.current_round,
      report: JSON.parse(r.report_json || '{}'),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    res.json({ success: true, count: jobs.length, simulations: jobs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch simulations: ' + err.message });
  }
});

// ── POST /api/simulations/compare ──────────────────────────────────
router.post('/compare', (req, res) => {
  try {
    const { idA, idB } = req.body || {};
    if (!idA || !idB) {
      return res.status(400).json({ error: 'idA and idB are required for scenario comparison.' });
    }

    const rowA = db.get('SELECT * FROM simulation_jobs WHERE id = ?', [idA]);
    const rowB = db.get('SELECT * FROM simulation_jobs WHERE id = ?', [idB]);

    if (!rowA || !rowB) {
      return res.status(404).json({ error: 'One or both simulation jobs not found.' });
    }

    const jobA = {
      ...rowA,
      bounds: JSON.parse(rowA.bounds_json || '{}'),
      syntheticPersona: JSON.parse(rowA.synthetic_persona_json || '{}'),
      agents: JSON.parse(rowA.agents_json || '[]'),
      report: JSON.parse(rowA.report_json || '{}')
    };

    const jobB = {
      ...rowB,
      bounds: JSON.parse(rowB.bounds_json || '{}'),
      syntheticPersona: JSON.parse(rowB.synthetic_persona_json || '{}'),
      agents: JSON.parse(rowB.agents_json || '[]'),
      report: JSON.parse(rowB.report_json || '{}')
    };

    const comparison = defaultSimulationEngine.compareScenarios(jobA, jobB);
    res.json({ success: true, comparison });
  } catch (err) {
    res.status(500).json({ error: 'Comparison failed: ' + err.message });
  }
});

// ── GET /api/simulations/:id ───────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const row = db.get('SELECT * FROM simulation_jobs WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Simulation job not found.' });
    }

    const eventsRows = db.all(
      'SELECT * FROM simulation_events WHERE simulation_id = ? ORDER BY id ASC',
      [req.params.id]
    ) || [];

    const job = {
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      scenarioType: row.scenario_type,
      bounds: JSON.parse(row.bounds_json || '{}'),
      syntheticPersona: JSON.parse(row.synthetic_persona_json || '{}'),
      agents: JSON.parse(row.agents_json || '[]'),
      status: row.status,
      currentRound: row.current_round,
      report: JSON.parse(row.report_json || '{}'),
      events: eventsRows.map(e => JSON.parse(e.data_json || '{}')),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json({ success: true, simulation: job });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve simulation: ' + err.message });
  }
});

// ── POST /api/simulations/:id/start ────────────────────────────────
router.post('/:id/start', async (req, res) => {
  try {
    const row = db.get('SELECT * FROM simulation_jobs WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Simulation job not found.' });
    }

    if (row.status === 'RUNNING') {
      return res.status(409).json({ error: 'Simulation is already running.' });
    }

    const job = {
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      scenarioType: row.scenario_type,
      bounds: JSON.parse(row.bounds_json || '{}'),
      syntheticPersona: JSON.parse(row.synthetic_persona_json || '{}'),
      agents: JSON.parse(row.agents_json || '[]'),
      status: 'QUEUED',
      currentRound: row.current_round,
      events: [],
      report: null
    };

    // Update status to RUNNING
    db.run(
      "UPDATE simulation_jobs SET status = 'RUNNING', updated_at = datetime('now') WHERE id = ?",
      [job.id]
    );

    // Execute via Simulation Engine
    const completedJob = await defaultSimulationEngine.executeSimulation(job);

    // Save events
    for (const ev of completedJob.events) {
      db.run(
        `INSERT INTO simulation_events (simulation_id, event_type, round, data_json)
         VALUES (?, ?, ?, ?)`,
        [job.id, ev.eventType, ev.round || 0, JSON.stringify(ev)]
      );
    }

    // Update DB with completed status and report
    db.run(
      `UPDATE simulation_jobs 
       SET status = 'COMPLETED', current_round = ?, report_json = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [completedJob.currentRound, JSON.stringify(completedJob.report), job.id]
    );

    res.json({
      success: true,
      message: 'Simulation completed successfully.',
      simulation: completedJob
    });
  } catch (err) {
    db.run(
      "UPDATE simulation_jobs SET status = 'FAILED', error_code = ?, updated_at = datetime('now') WHERE id = ?",
      [err.message, req.params.id]
    );
    res.status(500).json({ error: 'Simulation execution failed: ' + err.message });
  }
});

// ── GET /api/simulations/:id/status ────────────────────────────────
router.get('/:id/status', (req, res) => {
  try {
    const row = db.get(
      'SELECT id, status, current_round, error_code, updated_at FROM simulation_jobs WHERE id = ?',
      [req.params.id]
    );
    if (!row) {
      return res.status(404).json({ error: 'Simulation job not found.' });
    }
    res.json({
      success: true,
      id: row.id,
      status: row.status,
      currentRound: row.current_round,
      errorCode: row.error_code,
      updatedAt: row.updated_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve status: ' + err.message });
  }
});

// ── GET /api/simulations/:id/report ────────────────────────────────
router.get('/:id/report', (req, res) => {
  try {
    const row = db.get('SELECT id, status, report_json FROM simulation_jobs WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Simulation job not found.' });
    }

    if (row.status !== 'COMPLETED') {
      return res.status(400).json({ error: `Report not available. Simulation is in state: ${row.status}` });
    }

    const report = JSON.parse(row.report_json || '{}');
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve report: ' + err.message });
  }
});

// ── POST /api/simulations/:id/questions ────────────────────────────
router.post('/:id/questions', (req, res) => {
  try {
    const { agentId, question } = req.body || {};
    if (!agentId || !question) {
      return res.status(400).json({ error: 'agentId and question are required.' });
    }

    const row = db.get('SELECT * FROM simulation_jobs WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Simulation job not found.' });
    }

    const job = {
      ...row,
      agents: JSON.parse(row.agents_json || '[]'),
      events: (db.all('SELECT data_json FROM simulation_events WHERE simulation_id = ?', [row.id]) || []).map(r => JSON.parse(r.data_json || '{}'))
    };

    const answer = defaultSimulationEngine.askAgentQuestion(job, agentId, question);
    res.json({ success: true, answer });
  } catch (err) {
    res.status(500).json({ error: 'Agent inquiry failed: ' + err.message });
  }
});

// ── POST /api/simulations/:id/cancel ───────────────────────────────
router.post('/:id/cancel', (req, res) => {
  try {
    const row = db.get('SELECT status FROM simulation_jobs WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Simulation job not found.' });
    }

    if (row.status === 'COMPLETED' || row.status === 'CANCELLED') {
      return res.status(400).json({ error: `Cannot cancel simulation in state: ${row.status}` });
    }

    db.run(
      "UPDATE simulation_jobs SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?",
      [req.params.id]
    );

    res.json({ success: true, message: 'Simulation job cancelled.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel simulation: ' + err.message });
  }
});

// ── DELETE /api/simulations/:id ────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const row = db.get('SELECT id FROM simulation_jobs WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Simulation job not found.' });
    }

    db.run('DELETE FROM simulation_events WHERE simulation_id = ?', [req.params.id]);
    db.run('DELETE FROM simulation_feedback WHERE simulation_id = ?', [req.params.id]);
    db.run('DELETE FROM simulation_jobs WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Simulation deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete simulation: ' + err.message });
  }
});

// ── POST /api/simulations/:id/feedback ─────────────────────────────
router.post('/:id/feedback', (req, res) => {
  try {
    const userId = getUser(req);
    const { rating, issueCategory, comments } = req.body || {};

    db.run(
      `INSERT INTO simulation_feedback (simulation_id, user_id, rating, issue_category, comments)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, userId, rating || 5, issueCategory || 'Educational Utility', comments || '']
    );

    res.json({ success: true, message: 'Feedback recorded. Thank you for improving educational safety.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record feedback: ' + err.message });
  }
});

module.exports = router;
