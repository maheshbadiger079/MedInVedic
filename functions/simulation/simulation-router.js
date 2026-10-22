/**
 * functions/simulation/simulation-router.js
 * Firebase Cloud Functions Router for MedInVedic AI Simulation Lab
 * ─────────────────────────────────────────────────────────────────
 * Handles authenticated scenario creation, execution, and reporting
 * backed by Firestore collections (simulationJobs, simulationEvents, simulationReports).
 * ─────────────────────────────────────────────────────────────────
 */

const express = require('express');

function createSimulationRouter(db, admin, COLLECTIONS, requireAuth) {
  const router = express.Router();
  const { defaultSimulationEngine } = require('./simulationEngine');
  const { defaultKnowledgeGraph } = require('./simulationKnowledgeGraph');

  // Helper to extract UID
  function getUid(req) {
    return req.user && req.user.uid ? req.user.uid : (req.user && req.user.id ? req.user.id : 'guest_user');
  }

  // ── GET /knowledge-graph ─────────────────────────────────────────
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

  // ── POST / (Create Scenario) ─────────────────────────────────────
  router.post('/', async (req, res) => {
    try {
      const uid = getUid(req);
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

      const job = defaultSimulationEngine.createSimulationJob(uid, scenarioInput);

      await db.collection('simulationJobs').doc(job.id).set({
        id: job.id,
        ownerId: uid,
        title: job.title,
        scenarioType: job.scenarioType,
        bounds: job.bounds,
        syntheticPersona: job.syntheticPersona,
        agents: job.agents,
        status: job.status,
        currentRound: job.currentRound,
        report: null,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(201).json({
        success: true,
        message: 'Simulation scenario created in Firestore.',
        simulation: job
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create simulation: ' + err.message });
    }
  });

  // ── GET / (List User Simulations) ────────────────────────────────
  router.get('/', async (req, res) => {
    try {
      const uid = getUid(req);
      const snapshot = await db.collection('simulationJobs')
        .where('ownerId', '==', uid)
        .limit(50)
        .get();

      const jobs = [];
      snapshot.forEach(doc => jobs.push(doc.data()));
      res.json({ success: true, count: jobs.length, simulations: jobs });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch simulations: ' + err.message });
    }
  });

  // ── GET /:id ─────────────────────────────────────────────────────
  router.get('/:id', async (req, res) => {
    try {
      const doc = await db.collection('simulationJobs').doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Simulation job not found.' });
      }

      const eventsSnapshot = await db.collection('simulationEvents')
        .where('simulationId', '==', req.params.id)
        .get();

      const events = [];
      eventsSnapshot.forEach(d => events.push(d.data()));

      const job = doc.data();
      job.events = events;

      res.json({ success: true, simulation: job });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve simulation: ' + err.message });
    }
  });

  // ── POST /:id/start ──────────────────────────────────────────────
  router.post('/:id/start', async (req, res) => {
    try {
      const docRef = db.collection('simulationJobs').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Simulation job not found.' });
      }

      const jobData = doc.data();
      if (jobData.status === 'RUNNING') {
        return res.status(409).json({ error: 'Simulation is already running.' });
      }

      jobData.events = [];
      jobData.status = 'RUNNING';
      await docRef.update({
        status: 'RUNNING',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Execute simulation
      const completedJob = await defaultSimulationEngine.executeSimulation(jobData);

      // Persist events batch
      const batch = db.batch();
      for (const ev of completedJob.events) {
        const evRef = db.collection('simulationEvents').doc();
        batch.set(evRef, {
          simulationId: completedJob.id,
          eventType: ev.eventType,
          round: ev.round || 0,
          data: ev,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Persist report
      const repRef = db.collection('simulationReports').doc(`REP-${completedJob.id}`);
      batch.set(repRef, {
        simulationId: completedJob.id,
        ownerId: completedJob.ownerId,
        report: completedJob.report,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update job
      batch.update(docRef, {
        status: 'COMPLETED',
        currentRound: completedJob.currentRound,
        report: completedJob.report,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();

      res.json({
        success: true,
        message: 'Simulation completed.',
        simulation: completedJob
      });
    } catch (err) {
      await db.collection('simulationJobs').doc(req.params.id).update({
        status: 'FAILED',
        errorCode: err.message,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }).catch(() => {});

      res.status(500).json({ error: 'Simulation failed: ' + err.message });
    }
  });

  // ── GET /:id/report ──────────────────────────────────────────────
  router.get('/:id/report', async (req, res) => {
    try {
      const repDoc = await db.collection('simulationReports').doc(`REP-${req.params.id}`).get();
      if (!repDoc.exists) {
        return res.status(404).json({ error: 'Report not found.' });
      }
      res.json({ success: true, report: repDoc.data().report });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve report: ' + err.message });
    }
  });

  // ── POST /:id/questions ──────────────────────────────────────────
  router.post('/:id/questions', async (req, res) => {
    try {
      const { agentId, question } = req.body || {};
      const doc = await db.collection('simulationJobs').doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Simulation job not found.' });
      }

      const jobData = doc.data();
      const answer = defaultSimulationEngine.askAgentQuestion(jobData, agentId, question);
      res.json({ success: true, answer });
    } catch (err) {
      res.status(500).json({ error: 'Inquiry failed: ' + err.message });
    }
  });

  // ── POST /:id/cancel ─────────────────────────────────────────────
  router.post('/:id/cancel', async (req, res) => {
    try {
      await db.collection('simulationJobs').doc(req.params.id).update({
        status: 'CANCELLED',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true, message: 'Simulation cancelled.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to cancel: ' + err.message });
    }
  });

  // ── DELETE /:id ──────────────────────────────────────────────────
  router.delete('/:id', async (req, res) => {
    try {
      await db.collection('simulationJobs').doc(req.params.id).delete();
      res.json({ success: true, message: 'Simulation deleted.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete: ' + err.message });
    }
  });

  // ── POST /:id/feedback ───────────────────────────────────────────
  router.post('/:id/feedback', async (req, res) => {
    try {
      const uid = getUid(req);
      const { rating, issueCategory, comments } = req.body || {};
      await db.collection('simulationFeedback').add({
        simulationId: req.params.id,
        userId: uid,
        rating: rating || 5,
        issueCategory: issueCategory || 'Educational Utility',
        comments: comments || '',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true, message: 'Feedback recorded.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to record feedback: ' + err.message });
    }
  });

  return router;
}

module.exports = { createSimulationRouter };
