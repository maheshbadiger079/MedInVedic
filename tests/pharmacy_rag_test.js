/**
 * Automated Verification Test Suite for Modern Medicine Hub & Digital Pharmacy RAG Platform
 * Run with: node tests/pharmacy_rag_test.js
 */

const assert = require('assert');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Modern Medicine Hub & Digital Pharmacy RAG — Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

// Load Module
const PHARMACY_RAG = require('../public/js/pharmacy-rag-engine.js');

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

// ── MODULE API TESTS ──
test('1. PHARMACY_RAG loads correctly with public API', () => {
  assert.ok(PHARMACY_RAG);
  assert.strictEqual(typeof PHARMACY_RAG.getAllMedicines, 'function');
  assert.strictEqual(typeof PHARMACY_RAG.searchMedicines, 'function');
  assert.strictEqual(typeof PHARMACY_RAG.checkDrugInteractions, 'function');
  assert.strictEqual(typeof PHARMACY_RAG.parsePrescriptionOCR, 'function');
  assert.strictEqual(typeof PHARMACY_RAG.askMedicineRAG, 'function');
});

// ── CATALOG & EVIDENCE TESTS ──
test('2. Medicine catalog contains verified allopathic medications with official citations', () => {
  const meds = PHARMACY_RAG.getAllMedicines();
  assert.ok(meds.length >= 8, 'Must have at least 8 medicines');
  
  meds.forEach(m => {
    assert.ok(m.id);
    assert.ok(m.name);
    assert.ok(m.genericName);
    assert.ok(m.activeIngredient);
    assert.ok(m.price > 0);
    assert.ok(Array.isArray(m.sources));
    assert.ok(m.sources.length >= 1, 'Must have verifiable citations');
  });
});

test('3. Medicine search maps brand name "Dolo" to Paracetamol', () => {
  const results = PHARMACY_RAG.searchMedicines('Dolo');
  assert.ok(results.length >= 1);
  assert.ok(results[0].name.includes('Paracetamol'));
});

test('4. Medicine search filters by category "Diabetes"', () => {
  const results = PHARMACY_RAG.searchMedicines('Diabetes');
  assert.ok(results.some(m => m.name.includes('Metformin')));
});

// ── DRUG INTERACTION & DUPLICATE TESTS ──
test('5. Drug interaction checker detects MAJOR risk for Paracetamol + Alcohol', () => {
  const result = PHARMACY_RAG.checkDrugInteractions(['Paracetamol 500mg', 'Alcohol']);
  assert.strictEqual(result.hasInteractions, true);
  assert.ok(result.interactions.some(i => i.risk === 'MAJOR' && i.effect.includes('liver')));
});

test('6. Drug interaction checker detects MODERATE risk for Omeprazole + Clopidogrel', () => {
  const result = PHARMACY_RAG.checkDrugInteractions(['Omeprazole 20mg', 'Clopidogrel']);
  assert.strictEqual(result.hasInteractions, true);
  assert.ok(result.interactions.some(i => i.risk === 'MODERATE'));
});

test('7. Duplicate active ingredient detector flags double Paracetamol intake', () => {
  const result = PHARMACY_RAG.checkDrugInteractions(['Paracetamol 500mg', 'Paracetamol 500mg']);
  assert.strictEqual(result.hasDuplicates, true);
  assert.ok(result.duplicates[0].ingredient.includes('Paracetamol'));
});

// ── PRESCRIPTION OCR TESTS ──
test('8. Prescription OCR parses medicine names and enforces Pharmacist Review for Rx items', () => {
  const sampleRxText = 'Dr. Sharma Rx: Tab. Metformin 500mg BD after food, Tab. Paracetamol 500mg SOS';
  const parsed = PHARMACY_RAG.parsePrescriptionOCR(sampleRxText);
  
  assert.strictEqual(parsed.success, true);
  assert.ok(parsed.detectedMedicines.length >= 2);
  assert.strictEqual(parsed.requiresPharmacistReview, true, 'Must require pharmacist review because Metformin is Rx');
  assert.strictEqual(parsed.pharmacistStatus, 'PENDING_VERIFICATION');
});

// ── RAG QUESTION GENERATOR TESTS ──
test('9. RAG medicine inquiry for Azithromycin retrieves indication, antibiotic warnings, and citations', () => {
  const res = PHARMACY_RAG.askMedicineRAG('What is Azithromycin 500mg used for?');
  assert.strictEqual(res.type, 'RAG_MEDICINE_EXPLANATION');
  assert.ok(res.shortAnswer.includes('antibiotic') || res.shortAnswer.includes('respiratory') || res.shortAnswer.includes('infections'));
  assert.ok(res.warnings.includes('prescription only') || res.warnings.includes('resistance'));
  assert.strictEqual(res.notDiagnosis, true);
  assert.ok(res.sources.length >= 1);
});

test('10. RAG medicine inquiry for unknown chemical returns Insufficient Evidence', () => {
  const res = PHARMACY_RAG.askMedicineRAG('Tell me about Xylophantozine-999');
  assert.strictEqual(res.type, 'INSUFFICIENT_EVIDENCE');
  assert.strictEqual(res.notDiagnosis, true);
});

// ── SUMMARY REPORT ──
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Test Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
if (failed === 0) {
  console.log('  🎉 ALL MODERN MEDICINE HUB RAG BENCHMARKS PASSED!');
} else {
  console.error('  ⚠️ SOME TESTS FAILED. Please review the errors above.');
  process.exit(1);
}
console.log('═══════════════════════════════════════════════════════════════\n');
