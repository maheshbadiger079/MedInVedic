/**
 * tests/sos_rag_test.js — Automated tests for SOS RAG Emergency Engine
 * Run: node tests/sos_rag_test.js
 */

const SOS_RAG = require('../public/js/sos-rag-engine.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${name}\n     → ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

console.log('\n══════════════════════════════════════════════');
console.log('  SOS RAG Engine — Automated Test Suite');
console.log('══════════════════════════════════════════════\n');

// ── MODULE LOAD ──
console.log('📦 Module Loading');
test('SOS_RAG module loads correctly', () => {
  assert(SOS_RAG !== null && SOS_RAG !== undefined, 'SOS_RAG module is null/undefined');
  assert(typeof SOS_RAG === 'object', 'SOS_RAG should be an object');
});

test('SOS_RAG has required public API', () => {
  assert(typeof SOS_RAG.getAllTopics === 'function', 'Missing getAllTopics');
  assert(typeof SOS_RAG.getProtocol === 'function', 'Missing getProtocol');
  assert(typeof SOS_RAG.classifyEmergency === 'function', 'Missing classifyEmergency');
  assert(typeof SOS_RAG.retrieveProtocol === 'function', 'Missing retrieveProtocol');
  assert(typeof SOS_RAG.generateAnswer === 'function', 'Missing generateAnswer');
});

test('Knowledge base version is set', () => {
  assert(SOS_RAG.version, 'Missing version');
  assert(typeof SOS_RAG.version === 'string', 'Version should be string');
  console.log(`     Version: ${SOS_RAG.version}`);
});

// ── KNOWLEDGE BASE ──
console.log('\n📚 Knowledge Base');
test('Returns all 14 topics', () => {
  const topics = SOS_RAG.getAllTopics();
  assert(Array.isArray(topics), 'getAllTopics should return array');
  assert(topics.length === 14, `Expected 14 topics, got ${topics.length}`);
});

test('Every topic has required fields', () => {
  const topics = SOS_RAG.getAllTopics();
  for (const t of topics) {
    assert(t.id, `Missing id in topic: ${JSON.stringify(t)}`);
    assert(t.title, `Missing title in topic ${t.id}`);
    assert(t.icon, `Missing icon in topic ${t.id}`);
    assert(['CRITICAL','HIGH','MODERATE','LOW'].includes(t.level), `Invalid level in topic ${t.id}: ${t.level}`);
  }
});

test('getProtocol(cpr) returns valid CPR protocol', () => {
  const p = SOS_RAG.getProtocol('cpr');
  assert(p, 'CPR protocol should exist');
  assert(p.id === 'cpr', 'ID should be cpr');
  assert(p.emergencyLevel === 'CRITICAL', 'CPR should be CRITICAL level');
  assert(Array.isArray(p.steps) && p.steps.length >= 4, 'CPR should have at least 4 steps');
  assert(p.source && p.source.org, 'CPR should have source organization');
  assert(p.immediateAction, 'CPR should have immediateAction');
  assert(p.disclaimer, 'CPR should have disclaimer');
});

test('getProtocol returns null for unknown id', () => {
  const p = SOS_RAG.getProtocol('nonexistent_abc');
  assert(p === null || p === undefined, `Should return null for unknown id, got: ${p}`);
});

test('All protocols have steps with n, title, detail', () => {
  const topics = SOS_RAG.getAllTopics();
  for (const t of topics) {
    const p = SOS_RAG.getProtocol(t.id);
    assert(Array.isArray(p.steps), `${t.id} steps should be array`);
    assert(p.steps.length >= 4, `${t.id} should have at least 4 steps`);
    for (const s of p.steps) {
      assert(typeof s.n === 'number', `Step n should be number in ${t.id}`);
      assert(s.title, `Step title missing in ${t.id}`);
      assert(s.detail, `Step detail missing in ${t.id}`);
    }
  }
});

test('All protocols have doNot arrays', () => {
  const topics = SOS_RAG.getAllTopics();
  for (const t of topics) {
    const p = SOS_RAG.getProtocol(t.id);
    assert(Array.isArray(p.doNot), `${t.id} should have doNot array`);
    assert(p.doNot.length >= 2, `${t.id} should have at least 2 doNot items`);
  }
});

// ── EMERGENCY TRIAGE ──
console.log('\n🚦 Emergency Triage Classification');
test('classifyEmergency detects CRITICAL — cardiac arrest', () => {
  const r = SOS_RAG.classifyEmergency('the patient is not breathing and has no pulse');
  assert(r.level === 'CRITICAL', `Expected CRITICAL, got ${r.level}`);
  assert(r.isEmergency === true, 'isEmergency should be true for CRITICAL');
});

test('classifyEmergency detects HIGH — chest pain', () => {
  const r = SOS_RAG.classifyEmergency('severe chest pain on left side');
  assert(r.level === 'HIGH', `Expected HIGH, got ${r.level}`);
  assert(r.isEmergency === true, 'isEmergency should be true for HIGH');
});

test('classifyEmergency returns LOW for trivial queries', () => {
  const r = SOS_RAG.classifyEmergency('I have a mild cough and runny nose');
  assert(['LOW','MODERATE'].includes(r.level), `Expected LOW or MODERATE, got ${r.level}`);
  assert(r.isEmergency === false, 'isEmergency should be false for minor queries');
});

test('classifyEmergency returns object with level and isEmergency', () => {
  const r = SOS_RAG.classifyEmergency('someone is choking cannot breathe');
  assert(typeof r.level === 'string', 'level should be string');
  assert(typeof r.isEmergency === 'boolean', 'isEmergency should be boolean');
});

// ── RAG RETRIEVER ──
console.log('\n🔍 RAG Protocol Retrieval');
test('retrieveProtocol finds CPR for cardiac arrest query', () => {
  const r = SOS_RAG.retrieveProtocol('CPR steps for cardiac arrest not breathing');
  assert(r.found === true, `Should find CPR protocol, got found=${r.found}`);
  assert(r.protocol && r.protocol.id === 'cpr', `Should retrieve cpr, got ${r.protocol && r.protocol.id}`);
  assert(typeof r.score === 'number' && r.score > 0, 'Score should be positive');
});

test('retrieveProtocol finds bleeding protocol', () => {
  const r = SOS_RAG.retrieveProtocol('severe bleeding from a wound, how to stop blood');
  assert(r.found === true, 'Should find bleeding protocol');
  assert(r.protocol.id === 'bleeding', `Expected bleeding, got ${r.protocol && r.protocol.id}`);
});

test('retrieveProtocol finds stroke protocol', () => {
  const r = SOS_RAG.retrieveProtocol('signs of stroke face drooping arm weakness slurred speech');
  assert(r.found === true, 'Should find stroke protocol');
  assert(r.protocol.id === 'stroke', `Expected stroke, got ${r.protocol && r.protocol.id}`);
});

test('retrieveProtocol returns found=false for unrelated query', () => {
  const r = SOS_RAG.retrieveProtocol('what is the weather like today in bangalore xyz abc');
  assert(r.found === false, `Should not find protocol for unrelated query, found=${r.found}`);
});

// ── ANSWER GENERATOR ──
console.log('\n🤖 RAG Answer Generator');
test('generateAnswer returns RAG_RESPONSE for CPR query', () => {
  const r = SOS_RAG.generateAnswer('what are CPR steps for someone in cardiac arrest');
  assert(r.type === 'RAG_RESPONSE', `Expected RAG_RESPONSE, got ${r.type}`);
  assert(r.protocol, 'Should have protocol in response');
  assert(r.steps, 'Should have steps');
  assert(r.immediateAction, 'Should have immediateAction');
  assert(r.source, 'Should have source');
  assert(r.disclaimer, 'Should have disclaimer');
  assert(r.evidenceStatus, 'Should have evidenceStatus');
});

test('generateAnswer returns INSUFFICIENT_EVIDENCE for vague query', () => {
  const r = SOS_RAG.generateAnswer('zxqwerty random noise 12345 gibberish query abc');
  assert(r.type === 'INSUFFICIENT_EVIDENCE', `Expected INSUFFICIENT_EVIDENCE, got ${r.type}`);
  assert(r.recommendation, 'Should have recommendation text');
});

test('generateAnswer includes triage result', () => {
  const r = SOS_RAG.generateAnswer('someone is choking and cannot breathe');
  assert(r.triage, 'Should include triage result');
  assert(r.triage.level, 'Triage should have level');
});

test('generateAnswer notDiagnosis flag is set', () => {
  const r = SOS_RAG.generateAnswer('CPR steps for cardiac arrest');
  if (r.type === 'RAG_RESPONSE') {
    assert(r.notDiagnosis === true, 'notDiagnosis flag must be true — system must not claim to diagnose');
  }
});

// ── SUMMARY ──
console.log('\n══════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('  🎉 All tests PASSED — SOS RAG Engine is verified!');
} else {
  console.log('  ⚠️  Some tests failed. Review output above.');
  process.exit(1);
}
console.log('══════════════════════════════════════════════\n');
