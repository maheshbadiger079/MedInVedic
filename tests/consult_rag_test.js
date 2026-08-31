/**
 * Automated Verification Test Suite for MedInVedic Healthcare & Doctor Consultation RAG Platform
 * Run with: node tests/consult_rag_test.js
 */

const assert = require('assert');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Healthcare & Doctor Consultation RAG Engine — Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

// 1. Load Module
const CONSULT_RAG = require('../public/js/consult-rag-engine.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// ── MODULE LOADING TESTS ──
test('1. CONSULT_RAG module loads and exports expected API', () => {
  assert.ok(CONSULT_RAG, 'Module should exist');
  assert.strictEqual(typeof CONSULT_RAG.getAllDoctors, 'function');
  assert.strictEqual(typeof CONSULT_RAG.searchDoctors, 'function');
  assert.strictEqual(typeof CONSULT_RAG.extractIntent, 'function');
  assert.strictEqual(typeof CONSULT_RAG.checkEmergency, 'function');
  assert.strictEqual(typeof CONSULT_RAG.generateAnswer, 'function');
  assert.strictEqual(typeof CONSULT_RAG.analyzeLabReportText, 'function');
});

// ── VERIFIED DOCTOR REGISTRY TESTS ──
test('2. Doctor Registry contains certified doctors with medical council credentials', () => {
  const doctors = CONSULT_RAG.getAllDoctors();
  assert.ok(doctors.length >= 8, 'Should have at least 8 verified doctors');
  
  doctors.forEach(d => {
    assert.ok(d.id, 'Doctor must have an ID');
    assert.ok(d.name, 'Doctor must have a name');
    assert.ok(d.degree, 'Doctor must have degree qualifications');
    assert.ok(d.regNumber, 'Doctor must have a verified registration number');
    assert.ok(d.regCouncil, 'Doctor must have a medical council specified');
    assert.strictEqual(d.verified, true, 'Doctor verification badge must be true');
    assert.ok(Array.isArray(d.languages), 'Languages must be an array');
    assert.ok(d.languages.length > 0, 'Doctor must speak at least one language');
  });
});

test('3. Doctor lookup by ID returns correct doctor object', () => {
  const doc = CONSULT_RAG.getDoctorById('doc_1');
  assert.ok(doc, 'Should find doc_1');
  assert.strictEqual(doc.name, 'Dr. Shailesh Phalle');
  assert.strictEqual(doc.specialty, 'Ayurvedic');
  assert.ok(doc.languages.includes('Marathi'));
});

// ── EMERGENCY SAFETY LAYER TESTS ──
test('4. Emergency Safety Gate intercepts acute crushing chest pain with 112 directive', () => {
  const query = 'I have severe crushing chest pain radiating to my left arm';
  const res = CONSULT_RAG.generateAnswer(query);
  
  assert.strictEqual(res.type, 'EMERGENCY_RISK');
  assert.strictEqual(res.safetyLevel, 'CRITICAL');
  assert.ok(res.shortAnswer.includes('112'), 'Must include 112 emergency directive');
  assert.strictEqual(res.notDiagnosis, true);
});

test('5. Emergency Safety Gate intercepts stroke symptoms (FAST protocol)', () => {
  const check = CONSULT_RAG.checkEmergency('Sudden face droop and arm weakness');
  assert.strictEqual(check.isEmergency, true);
  assert.strictEqual(check.level, 'CRITICAL');
  assert.ok(check.reason.includes('Stroke'));
});

test('6. Non-emergency query is not flagged as emergency', () => {
  const check = CONSULT_RAG.checkEmergency('How to manage mild eczema dry skin?');
  assert.strictEqual(check.isEmergency, false);
  assert.strictEqual(check.level, 'NORMAL');
});

// ── NATURAL LANGUAGE INTENT & SPECIALTY MAPPING ──
test('7. Intent extractor correctly maps knee pain and Kannada language query', () => {
  const query = 'I have persistent knee joint stiffness and need a Kannada speaking doctor';
  const intent = CONSULT_RAG.extractIntent(query);
  
  assert.strictEqual(intent.specialty, 'Orthopedics');
  assert.strictEqual(intent.language, 'Kannada');
  assert.strictEqual(intent.confidence, 'HIGH');
});

test('8. Intent extractor maps skin rash to Dermatology', () => {
  const intent = CONSULT_RAG.extractIntent('Severe skin itching with red rash and eczema patches');
  assert.strictEqual(intent.specialty, 'Dermatology');
});

// ── DOCTOR SEARCH & RANKING TESTS ──
test('9. Doctor search filters accurately by Specialty (Ayurvedic)', () => {
  const results = CONSULT_RAG.searchDoctors({ specialty: 'Ayurvedic' });
  assert.ok(results.length >= 2, 'Should find Ayurvedic practitioners');
  results.forEach(d => {
    assert.strictEqual(d.specialty, 'Ayurvedic');
  });
});

test('10. Doctor search filters by Language (Kannada)', () => {
  const results = CONSULT_RAG.searchDoctors({}, { language: 'Kannada' });
  assert.ok(results.length >= 2, 'Should find Kannada-speaking doctors');
  results.forEach(d => {
    assert.ok(d.languages.includes('Kannada'));
  });
});

test('11. Doctor search ranks verified doctors by Rating and Experience', () => {
  const results = CONSULT_RAG.searchDoctors({});
  for (let i = 0; i < results.length - 1; i++) {
    if (results[i].rating === results[i+1].rating) {
      assert.ok(results[i].experienceYears >= results[i+1].experienceYears, 'Higher experience ranked first on rating tie');
    } else {
      assert.ok(results[i].rating >= results[i+1].rating, 'Higher rating ranked first');
    }
  }
});

// ── RAG ANSWER GENERATION & SOURCE GROUNDING ──
test('12. RAG answer for Fever retrieves WHO / ICMR evidence and separated Ayurvedic parallels', () => {
  const query = 'What should I do for high fever and temperature?';
  const res = CONSULT_RAG.generateAnswer(query);
  
  assert.strictEqual(res.type, 'RAG_GROUNDED_ANSWER');
  assert.strictEqual(res.evidenceLevel, 'HIGH');
  assert.ok(res.shortAnswer.includes('Paracetamol') || res.shortAnswer.includes('paracetamol'), 'Must mention paracetamol');
  assert.ok(res.ayurvedicParallel, 'Must provide separated Ayurvedic perspective');
  assert.ok(res.ayurvedicParallel.herbs.some(h => h.includes('Giloy') || h.includes('Tulsi')));
  assert.ok(res.sources.length >= 1, 'Must include verifiable source citations');
  assert.strictEqual(res.notDiagnosis, true);
});

test('13. RAG answer for GERD & Acidity returns ACG guidelines and alarm symptoms', () => {
  const query = 'Stomach is burning with severe acidity and gerd';
  const res = CONSULT_RAG.generateAnswer(query);
  
  assert.strictEqual(res.type, 'RAG_GROUNDED_ANSWER');
  assert.ok(res.whatYouCanDo.length >= 2);
  assert.ok(res.whenToSeekCare.includes('difficulty swallowing') || res.whenToSeekCare.includes('Seek immediate'));
  assert.ok(res.sources.some(s => s.org.includes('Gastroenterology') || s.org.includes('MoHFW')));
});

// ── ANTI-HALLUCINATION & INSUFFICIENT EVIDENCE ──
test('14. Out-of-domain or unanswerable query triggers Insufficient Evidence refusal', () => {
  const query = 'What is the secret recipe for quantum immortality elixirs?';
  const res = CONSULT_RAG.generateAnswer(query);
  
  assert.strictEqual(res.type, 'INSUFFICIENT_EVIDENCE');
  assert.strictEqual(res.evidenceLevel, 'INSUFFICIENT');
  assert.ok(res.shortAnswer.includes("don't have enough reliable evidence"));
  assert.strictEqual(res.notDiagnosis, true);
});

// ── MEDICAL DOCUMENT & LAB REPORT RAG DECODER ──
test('15. Lab report analyzer parses test parameters, identifies out-of-range values, and suggests doctor questions', () => {
  const sampleReport = `
    PATIENT DIAGNOSTIC LABORATORY REPORT
    Hemoglobin: 10.2 g/dL
    Fasting Blood Sugar: 145 mg/dL
    HbA1c: 7.2 %
    Serum Creatinine: 0.9 mg/dL
  `;
  
  const analysis = CONSULT_RAG.analyzeLabReportText(sampleReport);
  assert.strictEqual(analysis.found, true);
  assert.strictEqual(analysis.findingsCount, 4);
  
  const hbFinding = analysis.findings.find(f => f.paramKey === 'hemoglobin');
  assert.ok(hbFinding);
  assert.strictEqual(hbFinding.status, 'LOW');
  assert.ok(hbFinding.generalMeaning.includes('Anemia'));
  
  const fbsFinding = analysis.findings.find(f => f.paramKey === 'fbs');
  assert.ok(fbsFinding);
  assert.strictEqual(fbsFinding.status, 'HIGH');
  
  assert.ok(analysis.questionsToAskDoctor.length >= 2, 'Must provide structured questions for the doctor');
  assert.strictEqual(analysis.notDiagnosis, true);
});

// ── SUMMARY REPORT ──
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Test Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
if (failed === 0) {
  console.log('  🎉 ALL HEALTHCARE & DOCTOR CONSULTATION RAG BENCHMARKS PASSED!');
} else {
  console.error('  ⚠️ SOME TESTS FAILED. Please review the errors above.');
  process.exit(1);
}
console.log('═══════════════════════════════════════════════════════════════\n');
