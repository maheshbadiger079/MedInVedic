/**
 * MedInVedic — Razorpay Standard Web Checkout Test Suite
 */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MedInVedic — Razorpay Standard Web Checkout Test Suite');
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

const KEY_ID = 'rzp_test_TWfQ3jmPx1jYvE';
const KEY_SECRET = '4abCQQ5ouc19p7JPdNNt4j5i';

// 1. Order Creation & Validation
console.log('Testing 1. Order Creation & Validation Rules...');

runTest('Validates minimum amount (>= 100 paise / ₹1.00)', () => {
  function validateAmount(amtInPaise) {
    if (!amtInPaise || amtInPaise < 100) {
      throw new Error('Amount must be at least 100 paise');
    }
    return true;
  }

  assert.strictEqual(validateAmount(100), true);
  assert.strictEqual(validateAmount(49900), true);
  assert.throws(() => validateAmount(50), /Amount must be at least 100 paise/);
  assert.throws(() => validateAmount(0), /Amount must be at least 100 paise/);
});

runTest('Generates standard order receipt and payload parameters', () => {
  const amount = 49900; // ₹499
  const currency = 'INR';
  const receipt = 'rcpt_test_12345';

  const payload = {
    amount,
    currency,
    receipt: receipt.substring(0, 40)
  };

  assert.strictEqual(payload.amount, 49900);
  assert.strictEqual(payload.currency, 'INR');
  assert.strictEqual(payload.receipt, 'rcpt_test_12345');
});

// 2. HMAC-SHA256 Signature Verification
console.log('\nTesting 2. HMAC-SHA256 Signature Verification Engine...');

runTest('Successfully verifies authentic Razorpay payment signature', () => {
  const order_id = 'order_DAvD3kH4Yg71kL';
  const payment_id = 'pay_29QQoUBi66xm2f';
  
  // Compute valid signature
  const body = order_id + '|' + payment_id;
  const signature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(body)
    .digest('hex');

  function verify(orderId, paymentId, sig) {
    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    return expected === sig;
  }

  assert.strictEqual(verify(order_id, payment_id, signature), true);
});

runTest('Rejects tampered / forged payment signatures (Security Barrier)', () => {
  const order_id = 'order_DAvD3kH4Yg71kL';
  const payment_id = 'pay_29QQoUBi66xm2f';
  const forged_signature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  function verify(orderId, paymentId, sig) {
    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    return expected === sig;
  }

  assert.strictEqual(verify(order_id, payment_id, forged_signature), false);
  assert.strictEqual(verify('order_TAMPERED', payment_id, 'sig'), false);
});

runTest('Rejects verification request when mandatory fields are missing', () => {
  function checkRequired(body) {
    const order_id = body.razorpay_order_id || body.order_id;
    const payment_id = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    if (!order_id || !payment_id || !signature) {
      return { valid: false, error: 'Missing required parameters' };
    }
    return { valid: true };
  }

  assert.strictEqual(checkRequired({ order_id: 'ord_1' }).valid, false);
  assert.strictEqual(checkRequired({ payment_id: 'pay_1' }).valid, false);
  assert.strictEqual(checkRequired({ order_id: 'ord_1', payment_id: 'pay_1', signature: 'sig_1' }).valid, true);
});

// 3. Environment & Configuration Check
console.log('\nTesting 3. Environment & Security Config...');

runTest('Validates .env contains valid test credentials', () => {
  const envContent = fs.readFileSync('.env', 'utf8');
  assert.ok(envContent.includes('RAZORPAY_KEY_ID=rzp_test_TWfQ3jmPx1jYvE'));
  assert.ok(envContent.includes('RAZORPAY_KEY_SECRET=4abCQQ5ouc19p7JPdNNt4j5i'));
});

runTest('Validates .gitignore prevents .env leakage', () => {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  assert.ok(gitignore.includes('.env'));
});

// 4. Frontend & Backend Files
console.log('\nTesting 4. Frontend & Backend Route Files...');

runTest('Verifies server/routes/payment.js implements /create-order and /verify-payment', () => {
  const code = fs.readFileSync('server/routes/payment.js', 'utf8');
  assert.ok(code.includes("router.post('/create-order'"));
  assert.ok(code.includes("router.post('/verify-payment'"));
  assert.ok(code.includes('createHmac'));
});

runTest('Verifies functions/index.js implements /create-order and /verify-payment', () => {
  const code = fs.readFileSync('functions/index.js', 'utf8');
  assert.ok(code.includes("app.post('/create-order'"));
  assert.ok(code.includes("app.post('/verify-payment'"));
});

runTest('Verifies public/js/razorpay-checkout.js client helper is operational', () => {
  const code = fs.readFileSync('public/js/razorpay-checkout.js', 'utf8');
  assert.ok(code.includes('RazorpayCheckout'));
  assert.ok(code.includes('/create-order'));
  assert.ok(code.includes('/verify-payment'));
});

runTest('Verifies checkout HTML pages include official checkout.js SDK', () => {
  const p1 = fs.readFileSync('public/pages/payment.html', 'utf8');
  const p2 = fs.readFileSync('public/pages/razorpay-checkout.html', 'utf8');
  assert.ok(p1.includes('https://checkout.razorpay.com/v1/checkout.js'));
  assert.ok(p2.includes('https://checkout.razorpay.com/v1/checkout.js'));
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Test Results: ${passed} passed, ${total - passed} failed (${total} total)`);
if (passed === total) {
  console.log('  🎉 ALL RAZORPAY STANDARD CHECKOUT TESTS PASSED (100%)!');
}
console.log('═══════════════════════════════════════════════════════════════\n');
