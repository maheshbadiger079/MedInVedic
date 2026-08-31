const express = require('express');
const db      = require('../database');
const { requireAuth } = require('../middleware/auth');
const router  = express.Router();

// GET /api/doctors
router.get('/doctors', (req, res) => {
  res.json(db.all('SELECT * FROM doctors WHERE available=1 ORDER BY rating DESC', []));
});

// POST /api/reviews
router.post('/reviews', requireAuth, (req, res) => {
  const { product_id, rating, comment } = req.body;
  if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating required.' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5.' });

  // Check duplicate
  const exists = db.get('SELECT id FROM reviews WHERE user_id=? AND product_id=?', [req.user.id, product_id]);
  if (exists) return res.status(409).json({ error: 'You already reviewed this product.' });

  const id = db.insert('INSERT INTO reviews (user_id,product_id,rating,comment) VALUES (?,?,?,?)',
    [req.user.id, product_id, rating, comment || '']);

  // Update product average
  const stats = db.get('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id=?', [product_id]);
  db.run('UPDATE products SET rating=?, reviews=? WHERE id=?',
    [Math.round((stats.avg || 0) * 10) / 10, stats.cnt || 0, product_id]);

  res.json({ success: true, id });
});

// GET /api/notifications
router.get('/notifications', requireAuth, (req, res) => {
  res.json(db.all('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 20', [req.user.id]));
});

// PUT /api/notifications/read
router.put('/notifications/read', requireAuth, (req, res) => {
  db.run('UPDATE notifications SET read=1 WHERE user_id=?', [req.user.id]);
  res.json({ success: true });
});

// POST /api/consultations
router.post('/consultations', requireAuth, (req, res) => {
  const { doctor_id, type, symptoms, fee } = req.body;
  if (!doctor_id || !type) return res.status(400).json({ error: 'doctor_id and type required.' });
  const doctor = db.get('SELECT * FROM doctors WHERE id=?', [doctor_id]);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
  const id = db.insert('INSERT INTO consultations (user_id,doctor_id,type,symptoms,fee) VALUES (?,?,?,?,?)',
    [req.user.id, doctor_id, type, symptoms || '', fee || doctor.fee]);
  db.run('INSERT INTO notifications (user_id,title,body,type) VALUES (?,?,?,?)',
    [req.user.id, '👨‍⚕️ Consultation Confirmed',
     `Your ${type} consultation with ${doctor.name} is booked.`, 'consultation']);
  res.json({ success: true, id });
});

// GET /api/consultations/my
router.get('/consultations/my', requireAuth, (req, res) => {
  res.json(db.all(`
    SELECT c.*, d.name as doctor_name, d.spec as doctor_spec, d.emoji as doctor_emoji
    FROM consultations c JOIN doctors d ON d.id = c.doctor_id
    WHERE c.user_id=? ORDER BY c.created_at DESC
  `, [req.user.id]));
});

// GET /api/medical-stores
router.get('/medical-stores', (req, res) => {
  res.json(db.all('SELECT * FROM medical_stores ORDER BY rating DESC', []));
});

// GET /api/pharmacists
router.get('/pharmacists', (req, res) => {
  res.json(db.all('SELECT * FROM pharmacists WHERE available=1 ORDER BY rating DESC', []));
});

module.exports = router;
