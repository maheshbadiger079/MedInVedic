/**
 * Razorpay Standard Web Checkout API Routes
 * Endpoints:
 *   POST /api/create-order
 *   POST /api/verify-payment
 */

const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();

// Initialize Razorpay Instance
const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TWfQ3jmPx1jYvE';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '4abCQQ5ouc19p7JPdNNt4j5i';

let razorpay = null;
try {
  razorpay = new Razorpay({
    key_id: key_id,
    key_secret: key_secret
  });
} catch (e) {
  console.warn('Razorpay init notice:', e.message);
}

/**
 * STEP 1: BACKEND - Create Order
 * POST /api/create-order
 * Request body: { amount (in paise or rupees), currency, receipt, notes }
 * Minimum amount: 100 paise (₹1.00)
 */
router.post('/create-order', async (req, res) => {
  try {
    let { amount, currency, receipt, notes } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Valid amount is required.' });
    }

    // Normalize amount in paise
    let amountInPaise = Math.round(Number(amount));
    if (req.body.isRupees || (amountInPaise < 100 && !req.body.isPaise)) {
      amountInPaise = Math.round(Number(amount) * 100);
    }

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1.00 INR).'
      });
    }

    currency = currency || 'INR';
    receipt = receipt || ('rcpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6));

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt.substring(0, 40),
      notes: notes || {}
    };

    if (razorpay) {
      const order = await razorpay.orders.create(options);
      return res.status(200).json({
        success: true,
        order_id: order.id,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        key_id: key_id
      });
    } else {
      // Fallback mock order if SDK not configured
      const mockId = 'order_' + Date.now() + '_test';
      return res.status(200).json({
        success: true,
        order_id: mockId,
        id: mockId,
        amount: amountInPaise,
        currency: currency,
        receipt: receipt,
        key_id: key_id
      });
    }
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create Razorpay order: ' + (err.error?.description || err.message || 'Internal error')
    });
  }
});

/**
 * STEP 3: BACKEND - Verify Signature
 * POST /api/verify-payment
 * Request body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
router.post('/verify-payment', (req, res) => {
  try {
    const razorpay_order_id = req.body.razorpay_order_id || req.body.order_id;
    const razorpay_payment_id = req.body.razorpay_payment_id || req.body.payment_id;
    const razorpay_signature = req.body.razorpay_signature || req.body.signature;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: razorpay_order_id and razorpay_payment_id are required.'
      });
    }

    if (!razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: razorpay_signature is required.'
      });
    }

    // Generate expected HMAC SHA256 signature
    const hmacBody = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(hmacBody.toString())
      .digest('hex');

    // Compare generated signature with razorpay_signature
    const isSignatureValid = (expectedSignature === razorpay_signature);

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed: Invalid signature.'
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified successfully.',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (err) {
    console.error('Razorpay verify-payment error:', err);
    return res.status(500).json({
      success: false,
      error: 'Payment verification failed: ' + (err.message || 'Internal error')
    });
  }
});

// Backward-compatible alias routes
router.post('/payments/create-order', (req, res) => {
  req.url = '/create-order';
  router.handle(req, res);
});
router.post('/payments/verify', (req, res) => {
  req.url = '/verify-payment';
  router.handle(req, res);
});

module.exports = router;
