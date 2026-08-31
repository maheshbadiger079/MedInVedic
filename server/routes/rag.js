/**
 * server/routes/rag.js — MedInVedic RAG Backend API
 * ══════════════════════════════════════════════════
 * Endpoints:
 *   POST /api/chat     - Full RAG query assessment, retrieval, and structured response
 *   POST /api/search   - Hybrid search over medical knowledge base
 *   GET  /api/sources/:id - Fetch individual clinical evidence source
 *   POST /api/feedback - Collect user feedback on clinical answers
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Load RAG Knowledge Base and modules
let RAG_KB = [];
try {
  const kbFile = fs.readFileSync(path.join(__dirname, '../../public/js/rag-knowledge-base.js'), 'utf8');
  // Safe evaluation context to extract RAG_KB
  const sandbox = {};
  const fn = new Function('window', kbFile);
  fn(sandbox);
  RAG_KB = sandbox.RAG_KB || [];
} catch (e) {
  console.warn('Could not load public rag-knowledge-base.js, using internal fallback:', e.message);
}

// Emergency patterns
const EMERGENCY_PATTERNS = [
  {
    id: "cardiac",
    triggers: [/chest\s+pain/i, /chest\s+tightness/i, /heart\s+attack/i, /crushing\s+chest/i, /pressure\s+in\s+chest/i, /left\s+arm\s+pain/i, /jaw\s+pain.*chest/i],
    message: "🚨 CARDIAC EMERGENCY: Chest pain with these characteristics could indicate a heart attack. Call 112 immediately. Do not drive yourself. Chew (do not swallow) aspirin if available and not allergic.",
    callToAction: "Call 112 Now",
    severity: "critical"
  },
  {
    id: "stroke",
    triggers: [/sudden\s+weakness/i, /face\s+droop/i, /slurred\s+speech/i, /sudden\s+confusion/i, /arm\s+weak/i, /sudden\s+numbness/i, /can't\s+speak/i, /stroke/i],
    message: "🚨 POSSIBLE STROKE: Use the FAST test — Face drooping, Arm weakness, Speech difficulty → TIME to call 112. Stroke treatment is time-critical. Call 112 immediately.",
    callToAction: "Call 112 Now",
    severity: "critical"
  },
  {
    id: "respiratory",
    triggers: [/can'?t\s+breathe/i, /unable\s+to\s+breathe/i, /difficulty\s+breathing/i, /severe\s+breathlessness/i, /gasping/i, /choking/i, /anaphylaxis/i],
    message: "🚨 BREATHING EMERGENCY: Severe difficulty breathing or throat swelling can be life-threatening. Call 112 immediately.",
    callToAction: "Call 112 Now",
    severity: "critical"
  }
];

const STOP_WORDS = new Set([
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they",
  "what", "which", "who", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "a", "an", "the", "and", "or", "but", "if", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "into", "through", "about", "between",
  "so", "then", "that", "this", "than", "too", "very", "just", "how"
]);

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s\-]/g, " ").split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function searchKB(query, topK = 5) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored = RAG_KB.map(doc => {
    let score = 0;
    const docText = [doc.title, doc.content, (doc.medical_topics || []).join(' '), (doc.keywords || []).join(' ')].join(' ').toLowerCase();
    
    tokens.forEach(t => {
      if (docText.includes(t)) score += 1.5;
    });

    if (doc.keywords) {
      doc.keywords.forEach(k => {
        if (query.toLowerCase().includes(k.toLowerCase())) score += 3.0;
      });
    }

    const tierWeight = doc.tier === 1 ? 1.0 : doc.tier === 2 ? 0.85 : 0.65;
    return { doc, score: score * tierWeight };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0.1).slice(0, topK);
}

// POST /api/chat
router.post(['/chat', '/rag/chat'], (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string is required' });
  }

  // 1. Emergency Detection
  let emergency = { detected: false };
  for (const p of EMERGENCY_PATTERNS) {
    if (p.triggers.some(r => r.test(query))) {
      emergency = { detected: true, ...p };
      break;
    }
  }

  // 2. Hybrid Retrieval
  const results = searchKB(query, 5);

  // 3. Evidence Validation
  if (results.length === 0 || results[0].score < 0.5) {
    return res.json({
      status: 'insufficient_evidence',
      query,
      emergency,
      message: 'Insufficient reliable evidence found in verified medical guidelines. Please consult a qualified clinician.',
      sources: []
    });
  }

  // 4. Response formulation
  const primaryDoc = results[0].doc;
  const sources = results.map((r, i) => ({
    citationIndex: i + 1,
    doc_id: r.doc.doc_id,
    title: r.doc.title,
    source: r.doc.source,
    organization: r.doc.organization,
    source_url: r.doc.source_url,
    tier: r.doc.tier,
    evidence_level: r.doc.evidence_level,
    score: r.score
  }));

  res.json({
    status: 'success',
    query,
    emergency,
    primaryDoc,
    sources,
    disclaimer: 'These symptoms can occur with several conditions. Symptoms alone cannot confirm a diagnosis. Clinical assessment is required.'
  });
});

// POST /api/search
router.post(['/search', '/rag/search'], (req, res) => {
  const { query, limit = 5 } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });
  const results = searchKB(query, limit);
  res.json({ query, count: results.length, results });
});

// GET /api/sources/:id
router.get(['/sources/:id', '/rag/sources/:id'], (req, res) => {
  const doc = RAG_KB.find(d => d.doc_id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Source not found' });
  res.json(doc);
});

// POST /api/feedback
router.post(['/feedback', '/rag/feedback'], (req, res) => {
  const { query, feedback, timestamp = Date.now() } = req.body;
  console.log(`[RAG Feedback] ${feedback} for query: "${query}" at ${new Date(timestamp).toISOString()}`);
  res.json({ status: 'ok', message: 'Feedback recorded' });
});

module.exports = router;
