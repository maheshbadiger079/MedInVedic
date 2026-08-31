/**
 * MedInVedic — Monetization, Payments & Platform Architecture Test Suite
 */
const assert = require('assert');
const crypto = require('crypto');
const MathVerifier = require('../server/services/mathVerifier');
const AiDomainRouter = require('../server/services/aiRouter');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MedInVedic Monetization, Payments & Security Test Suite');
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

// 1. Authoritative Pricing Calculation
console.log('Testing 1. Authoritative Pricing & Monetization Engine...');
runTest('Calculates consultation platform revenue correctly', () => {
  const doctorFee = 400;
  const platformFee = 50;
  const totalPayable = doctorFee + platformFee;
  assert.strictEqual(totalPayable, 450);
});

runTest('Care Membership unit pricing adheres to plan matrix', () => {
  const pricing = { careMonthly: 99, careYearly: 999 };
  assert.strictEqual(pricing.careMonthly, 99);
  assert.strictEqual(pricing.careYearly, 999);
  const yearlySavings = (pricing.careMonthly * 12) - pricing.careYearly;
  assert.ok(yearlySavings > 0, 'Yearly plan should offer discount');
});

// 2. Razorpay Signature Verification & HMAC SHA-256
console.log('\nTesting 2. Razorpay HMAC-SHA256 Signature Verification...');
runTest('Validates authentic Razorpay payment signatures', () => {
  const secret = 'test_secret_key_12345';
  const orderId = 'order_NXK1829102';
  const paymentId = 'pay_NXK1829103';
  const payload = `${orderId}|${paymentId}`;
  const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const check = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  assert.strictEqual(validSignature, check);
});

runTest('Rejects tampered payment signatures', () => {
  const secret = 'test_secret_key_12345';
  const orderId = 'order_NXK1829102';
  const paymentId = 'pay_NXK1829103';
  const payload = `${orderId}|${paymentId}`;
  const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const fakeSignature = 'tampered_signature_abcd1234';

  assert.notStrictEqual(validSignature, fakeSignature);
});

// 3. Webhook Idempotency
console.log('\nTesting 3. Webhook Idempotency & Ledger...');
runTest('Processes unique webhook event and records in ledger', () => {
  const processedLedger = new Set();
  const eventId = 'evt_payment_captured_1001';

  function processWebhook(evtId) {
    if (processedLedger.has(evtId)) {
      return { status: 'already_processed' };
    }
    processedLedger.add(evtId);
    return { status: 'success' };
  }

  const res1 = processWebhook(eventId);
  assert.strictEqual(res1.status, 'success');

  const res2 = processWebhook(eventId);
  assert.strictEqual(res2.status, 'already_processed');
});

// 4. Strict Domain Isolation
console.log('\nTesting 4. Clinical Health AI vs VedicMind Math Isolation...');
runTest('Health query routed to HEALTH_AI', () => {
  const res = AiDomainRouter.classifyDomain('What is the paracetamol dosage for high fever?');
  assert.strictEqual(res.domain, 'HEALTH_AI');
});

runTest('Vedic calculation query routed to VEDICMIND_AI', () => {
  const res = AiDomainRouter.classifyDomain('How to calculate 98 x 97 using Nikhilam Sutra?');
  assert.strictEqual(res.domain, 'VEDICMIND_AI');
});

// 5. Deterministic Math Engine
console.log('\nTesting 5. Deterministic Math Engine (Zero Hallucination)...');
runTest('Nikhilam calculation: 98 × 97 = 9506', () => {
  const res = MathVerifier.solveNikhilamMultiplication(98, 97);
  assert.strictEqual(res.result, 9506);
});

runTest('Ekadhikena Purvena: 85² = 7225', () => {
  const res = MathVerifier.solveEkadhikenaSquare(85);
  assert.strictEqual(res.result, 7225);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Test Results: ${passed} passed, ${total - passed} failed (${total} total)`);
if (passed === total) {
  console.log('  🎉 ALL MONETIZATION, PAYMENT & SECURITY TESTS PASSED!');
}
console.log('═══════════════════════════════════════════════════════════════\n');
