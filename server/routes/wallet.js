const express = require('express');
const db      = require('../database');
const crypto  = require('crypto');
const Razorpay = require('razorpay');
const { requireAuth } = require('../middleware/auth');
const router  = express.Router();

// Initialize Razorpay only if keys are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay Live Mode Enabled');
} else {
  console.log('⚠️ Razorpay Mock Mode Active (Shared Keys Missing)');
}

// GET /api/wallet
router.get('/wallet', requireAuth, (req, res) => {
  let wallet = db.get('SELECT * FROM wallets WHERE user_id = ?', [req.user.id]);
  if (!wallet) {
    db.run('INSERT INTO wallets (user_id, balance) VALUES (?, ?)', [req.user.id, 0]);
    wallet = { balance: 0 };
  }
  res.json(wallet);
});

// GET /api/transactions
router.get('/transactions', requireAuth, (req, res) => {
  const txs = db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(txs);
});

// POST /api/wallet/add-money
router.post('/wallet/add-money', requireAuth, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: `wallet_${req.user.id}_${Date.now()}`
      });
      return res.json({ success: true, order });
    } catch (err) {
      return res.status(500).json({ error: 'Razorpay order creation failed: ' + err.message });
    }
  }

  // Fallback to Mock Mode
  const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
  res.json({ success: true, order: { id: orderId, amount: amount * 100 } });
});

// POST /api/payment/donation
router.post('/payment/donation', requireAuth, async (req, res) => {
  const { amount, purpose } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: `pay_${req.user.id}_${Date.now()}`
      });
      return res.json({ success: true, order });
    } catch (err) {
      return res.status(500).json({ error: 'Razorpay order creation failed: ' + err.message });
    }
  }

  // Fallback to Mock Mode
  const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
  res.json({ success: true, order: { id: orderId, amount: amount * 100 } });
});

// POST /api/payment/verify
router.post('/payment/verify', requireAuth, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isWalletAdd, amount, purpose } = req.body;
  
  // Real Verification if Live Mode
  if (razorpay && razorpay_signature) {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
  }

  // Record outcome in DB
  if (isWalletAdd) {
    let wallet = db.get('SELECT * FROM wallets WHERE user_id = ?', [req.user.id]);
    if (!wallet) {
      db.run('INSERT INTO wallets (user_id, balance) VALUES (?, ?)', [req.user.id, amount]);
    } else {
      db.run('UPDATE wallets SET balance = balance + ?, updated_at = datetime("now") WHERE user_id = ?', [amount, req.user.id]);
    }
    db.run('INSERT INTO transactions (user_id, amount, type, purpose, payment_id) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, amount, 'credit', 'Wallet Topup', razorpay_payment_id || 'simulated']);
      
    res.json({ success: true, message: 'Wallet topped up' });
  } else {
    const finalAmount = amount || 500;
    db.run('INSERT INTO transactions (user_id, amount, type, purpose, payment_id) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, finalAmount, 'debit', purpose || 'Service Payment', razorpay_payment_id || 'simulated']);
      
    res.json({ success: true, message: 'Payment verified and recorded' });
  }
});

// POST /api/payment/wallet — Pay using wallet balance
router.post('/payment/wallet', requireAuth, (req, res) => {
  const { amount, purpose } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const wallet = db.get('SELECT * FROM wallets WHERE user_id = ?', [req.user.id]);
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ error: 'Insufficient wallet balance' });
  }

  db.run('UPDATE wallets SET balance = balance - ?, updated_at = datetime("now") WHERE user_id = ?', [amount, req.user.id]);
  db.run('INSERT INTO transactions (user_id, amount, type, purpose, payment_id) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, amount, 'debit', purpose || 'Order Payment', 'WALLET_' + Date.now()]);

  res.json({ success: true, message: 'Payment successful using wallet' });
});

module.exports = router;
