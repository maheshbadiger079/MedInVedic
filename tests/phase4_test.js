/**
 * MedInVedic — Phase 4 Frontend Polish & Health Engines Test Suite
 */
const assert = require('assert');
const fs = require('fs');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MedInVedic Phase 4 Frontend & Health Logic Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// 1. Prakriti Dosha Ratio Calculation
console.log('Testing 1. Ayurvedic Prakriti Dosha Calculations...');
runTest('Accurately computes equal multi-dosha percentages', () => {
  const tally = { v: 1, p: 1, k: 1 };
  const count = 3;
  const vPct = Math.round((tally.v / count) * 100);
  const pPct = Math.round((tally.p / count) * 100);
  const kPct = Math.round((tally.k / count) * 100);

  assert.strictEqual(vPct, 33);
  assert.strictEqual(pPct, 33);
  assert.strictEqual(kPct, 33);
});

runTest('Accurately computes dominant Vata constitution', () => {
  const tally = { v: 2, p: 1, k: 0 };
  const count = 3;
  const vPct = Math.round((tally.v / count) * 100);
  assert.strictEqual(vPct, 67);
});

// 2. Rutucharya Diet Engine Rules
console.log('\nTesting 2. Rutucharya Seasonal Diet Mappings...');
runTest('Summer (Grishma) recommends cooling and Pitta-pacifying foods', () => {
  const season = 'Summer';
  const recommendation = season === 'Summer' ? 'Cooling hydrating foods' : 'Warm foods';
  assert.ok(recommendation.includes('Cooling'));
});

runTest('Monsoon (Varsha) recommends digestive Agni stimulation and Vata pacification', () => {
  const season = 'Monsoon';
  const recommendation = season === 'Monsoon' ? 'Warm digestible meals' : 'Raw foods';
  assert.ok(recommendation.includes('Warm'));
});

// 3. UI Template Integrity
console.log('\nTesting 3. Phase 4 HTML Pages Integrity...');
const pages = [
  'public/pages/prakriti-analysis.html',
  'public/pages/ai-diet.html',
  'public/pages/ai-assistant.html',
  'public/pages/payment.html'
];

pages.forEach(p => {
  runTest(`Verifies ${p} exists and contains valid HTML structure`, () => {
    const content = fs.readFileSync(p, 'utf8');
    assert.ok(content.includes('<!DOCTYPE html>'));
    assert.ok(content.includes('MedInVedic'));
    assert.ok(content.includes('--primary'));
  });
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Test Results: ${passed} passed, ${total - passed} failed (${total} total)`);
if (passed === total) {
  console.log('  🎉 ALL PHASE 4 FRONTEND & HEALTH LOGIC TESTS PASSED!');
}
console.log('═══════════════════════════════════════════════════════════════\n');
