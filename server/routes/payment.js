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
const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TXEa2fRwyrWGop';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '1m17Se5I7p74xTAjwpZ86TQ7';

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

    // Constant-time signature comparison to prevent timing attacks
    let isSignatureValid = false;
    try {
      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8');
      if (expectedBuffer.length === receivedBuffer.length) {
        isSignatureValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
      }
    } catch (e) {
      isSignatureValid = false;
    }

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

// ─────────────────────────────────────────────────────────────
// UNIFIED MULTI-PROVIDER PAYMENT SYSTEM (YOUPI-PG + RAZORPAY + COD)
// ─────────────────────────────────────────────────────────────
const { RazorpayAdapter } = require('../../functions/payment/razorpay-adapter');
const { YouPiPgAdapter } = require('../../functions/payment/youpi-adapter');
const { CodAdapter } = require('../../functions/payment/cod-adapter');
const { PAYMENT_STATUS, PAYMENT_PROVIDER, PAYMENT_METHOD, VERIFICATION_SOURCE } = require('../../functions/payment/payment-provider');

const serverRazorpayAdapter = new RazorpayAdapter();
const serverYouPiAdapter = new YouPiPgAdapter();
const serverCodAdapter = new CodAdapter();

// In-memory payment store for local development server
const localPaymentSessions = new Map();

// POST /api/payments/session
router.post('/payments/session', async (req, res) => {
  try {
    const {
      provider = PAYMENT_PROVIDER.YOUPI_PG,
      type = 'GENERAL',
      amount,
      customAmount,
      items,
      purpose,
      deliveryAddress,
      phone
    } = req.body;

    const finalAmt = Math.round(Number(amount || customAmount || 199));
    const amountPaise = finalAmt * 100;
    const paymentId = 'pay_sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    // COD eligibility check
    if (provider === PAYMENT_PROVIDER.COD) {
      const eligibility = CodAdapter.evaluateEligibility({ type, items });
      if (!eligibility.eligible) {
        return res.status(400).json({ success: false, error: `COD Ineligible: ${eligibility.reason}` });
      }
    }

    const orderContext = {
      amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString(36)}`,
      type,
      purpose: purpose || type,
      userId: req.user?.id || 'guest_user',
      deliveryAddress,
      phone,
      items
    };

    let sessionResult;
    if (provider === PAYMENT_PROVIDER.YOUPI_PG) {
      sessionResult = await serverYouPiAdapter.createSession(orderContext);
    } else if (provider === PAYMENT_PROVIDER.COD) {
      sessionResult = await serverCodAdapter.createSession(orderContext);
    } else {
      sessionResult = await serverRazorpayAdapter.createSession(orderContext);
    }

    const record = {
      paymentId,
      provider,
      paymentMethod: sessionResult.paymentMethod || PAYMENT_METHOD.RAZORPAY_GATEWAY,
      amount: finalAmt,
      amountPaise,
      currency: 'INR',
      purpose: purpose || type,
      type,
      status: sessionResult.status || PAYMENT_STATUS.PENDING,
      receipt: orderContext.receipt,
      providerReference: sessionResult.orderId || sessionResult.transactionReference || sessionResult.receipt,
      razorpayOrderId: sessionResult.orderId || null,
      upiUri: sessionResult.upiUri || null,
      qrSvg: sessionResult.qrSvg || null,
      appLinks: sessionResult.appLinks || null,
      expiresAt: sessionResult.expiresAt || null,
      verificationSource: null,
      reconciliationStatus: 'UNRECONCILED',
      mode: 'LIVE',
      isLive: true,
      created_at: new Date().toISOString()
    };

    localPaymentSessions.set(paymentId, record);
    if (record.providerReference) {
      localPaymentSessions.set(record.providerReference, record);
    }

    res.status(200).json({
      success: true,
      paymentId,
      provider,
      paymentMethod: record.paymentMethod,
      amount: finalAmt,
      amountPaise,
      currency: 'INR',
      mode: 'LIVE',
      isLive: true,
      status: record.status,
      sessionData: sessionResult
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/payments/status/:paymentId
router.get('/payments/status/:paymentId', (req, res) => {
  const record = localPaymentSessions.get(req.params.paymentId);
  if (!record) {
    return res.status(404).json({ success: false, error: 'Payment session not found' });
  }

  // Check expiry
  if (record.status === PAYMENT_STATUS.PENDING && record.expiresAt) {
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      record.status = PAYMENT_STATUS.EXPIRED;
    }
  }

  const remainingSeconds = record.expiresAt
    ? Math.max(0, Math.floor((new Date(record.expiresAt).getTime() - Date.now()) / 1000))
    : null;

  res.status(200).json({
    success: true,
    paymentId: record.paymentId,
    provider: record.provider,
    paymentMethod: record.paymentMethod,
    amount: record.amount,
    status: record.status,
    expiresAt: record.expiresAt,
    remainingSeconds,
    reconciliationStatus: record.reconciliationStatus,
    verificationSource: record.verificationSource,
    upiUri: record.upiUri,
    qrSvg: record.qrSvg,
    appLinks: record.appLinks
  });
});

// POST /api/payments/cancel
router.post('/payments/cancel', (req, res) => {
  const { paymentId, reason } = req.body;
  const record = localPaymentSessions.get(paymentId);
  if (!record) {
    return res.status(404).json({ success: false, error: 'Payment session not found' });
  }

  record.status = PAYMENT_STATUS.CANCELLED;
  record.cancellationReason = reason || 'User cancelled';

  res.status(200).json({ success: true, paymentId, status: PAYMENT_STATUS.CANCELLED });
});

// POST /api/payments/youpi-observer (Ingest observer telemetry -> OBSERVED_UNVERIFIED)
router.post('/payments/youpi-observer', async (req, res) => {
  try {
    const { transactionReference, amountPaise } = req.body;
    let record = transactionReference ? localPaymentSessions.get(transactionReference) : null;

    if (!record && amountPaise) {
      for (const [_, sess] of localPaymentSessions.entries()) {
        if (sess.provider === PAYMENT_PROVIDER.YOUPI_PG && sess.amountPaise === amountPaise && sess.status === PAYMENT_STATUS.PENDING) {
          record = sess;
          break;
        }
      }
    }

    if (!record) {
      return res.status(404).json({ success: false, error: 'No matching pending payment session found' });
    }

    const result = await serverYouPiAdapter.ingestObserverTelemetry(req.body, record);
    if (!result.success) {
      return res.status(400).json(result);
    }

    record.status = result.newStatus;
    record.verificationSource = result.verificationSource;
    record.reconciliationStatus = result.reconciliationStatus;
    record.observedDetails = result.observedDetails;

    res.status(200).json({
      success: true,
      status: PAYMENT_STATUS.OBSERVED_UNVERIFIED,
      paymentId: record.paymentId,
      notice: result.securityNotice
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/payments/reconcile
router.post('/admin/payments/reconcile', async (req, res) => {
  try {
    const { paymentId, decision, notes } = req.body;
    const record = localPaymentSessions.get(paymentId);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Payment session not found' });
    }

    const adminUser = req.user || { email: 'admin@medinvedic.com' };
    const result = await serverYouPiAdapter.reconcilePayment(record, adminUser, decision, notes);

    record.status = result.newStatus;
    record.reconciliationStatus = result.reconciliationStatus;
    record.reconciledBy = result.reconciledBy;
    record.reconciledAt = result.reconciledAt;

    res.status(200).json({
      success: true,
      paymentId,
      decision,
      status: result.newStatus
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/admin/payments/refund
router.post('/admin/payments/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    const record = localPaymentSessions.get(paymentId);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Payment session not found' });
    }

    record.status = PAYMENT_STATUS.REFUNDED;
    record.refundReason = reason || 'Admin refund';
    record.refundedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      paymentId,
      refundId: `rfnd_${Date.now()}`,
      status: PAYMENT_STATUS.REFUNDED
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/admin/payments/transactions
router.get('/admin/payments/transactions', (req, res) => {
  const list = Array.from(new Set(Array.from(localPaymentSessions.values())));
  let totalVolume = 0;
  let verifiedRevenue = 0;
  let unverifiedVolume = 0;
  let pendingCount = 0;
  let unverifiedCount = 0;
  let failedCount = 0;
  let refundCount = 0;

  list.forEach(p => {
    const amt = Number(p.amount) || 0;
    totalVolume += amt;
    if (p.status === PAYMENT_STATUS.VERIFIED_PAID) verifiedRevenue += amt;
    else if (p.status === PAYMENT_STATUS.OBSERVED_UNVERIFIED) {
      unverifiedVolume += amt;
      unverifiedCount++;
    } else if (p.status === PAYMENT_STATUS.PENDING || p.status === PAYMENT_STATUS.PENDING_COD_CONFIRMATION) {
      pendingCount++;
    } else if (p.status === PAYMENT_STATUS.REFUNDED) {
      refundCount++;
    } else {
      failedCount++;
    }
  });

  res.status(200).json({
    success: true,
    summary: {
      totalTransactions: list.length,
      totalVolume: Math.round(totalVolume),
      verifiedRevenue: Math.round(verifiedRevenue),
      unverifiedVolume: Math.round(unverifiedVolume),
      pendingCount,
      unverifiedCount,
      failedCount,
      refundCount,
      providerBreakdown: {
        razorpay: list.filter(p => p.provider === PAYMENT_PROVIDER.RAZORPAY).length,
        youpiPg: list.filter(p => p.provider === PAYMENT_PROVIDER.YOUPI_PG).length,
        cod: list.filter(p => p.provider === PAYMENT_PROVIDER.COD).length
      }
    },
    payments: list
  });
});

module.exports = router;
