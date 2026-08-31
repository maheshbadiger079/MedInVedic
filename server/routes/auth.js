/**
 * routes/auth.js — Register, Login, Profile
 */
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../database');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });

  const exists = db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (exists) return res.status(409).json({ error: 'An account with this email already exists.' });

  const hash   = bcrypt.hashSync(password, 10);
  const userId = db.insert('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
    [name, email, hash, phone || '']);

  db.run(`INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)`,
    [userId, '🎉 Welcome to MedInVedic!',
     'Explore modern medicines & Ayurvedic products. Upload prescriptions & consult doctors!', 'welcome']);

  const token = jwt.sign({ id: userId, name, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: userId, name, email, role: 'user' } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ error: 'No account found with this email address.' });

  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/social-login
router.post('/social-login', (req, res) => {
  const { name, email, provider } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  let user = db.get('SELECT * FROM users WHERE email = ?', [email]);
  
  if (!user) {
    // Create new user for social login
    const placeholderPass = bcrypt.hashSync(Math.random().toString(36), 10);
    const userId = db.insert('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name || 'User', email, placeholderPass, 'user']);
    
    db.run(`INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)`,
      [userId, '🎉 Welcome!', 'Thanks for joining with ' + provider, 'welcome']);
      
    user = { id: userId, name: name || 'User', email, role: 'user' };
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.get(
    'SELECT id, name, email, role, phone, blood_group, membership, orders_count, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req, res) => {
  const { name, phone, blood_group } = req.body;
  db.run('UPDATE users SET name=?, phone=?, blood_group=? WHERE id=?',
    [name || req.user.name, phone || '', blood_group || '', req.user.id]);
  res.json({ success: true });
});

// PUT /api/auth/password
router.put('/password', requireAuth, (req, res) => {
  const { current_password, new_password } = req.body;
  const user = db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!bcrypt.compareSync(current_password, user.password))
    return res.status(401).json({ error: 'Current password is incorrect.' });
  db.run('UPDATE users SET password = ? WHERE id = ?', [bcrypt.hashSync(new_password, 10), req.user.id]);
  res.json({ success: true });
});

module.exports = router;
