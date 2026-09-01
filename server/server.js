/**
 * server.js — MedInVedic Express Backend
 * Runs on port 3001  (frontend served separately on 8888)
 * API base: http://localhost:3001/api
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { initDB } = require('./database');

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ── Health check (works before DB init) ──────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'MedInVedic API', version: '1.0.0' });
});

// ── Boot: init DB first, then mount routes ───────────────────────
const PORT = process.env.PORT || 3001;

initDB().then(() => {
  // Mount routes AFTER DB is ready
  app.use('/api/auth',          require('./routes/auth'));
  app.use('/api/products',      require('./routes/products'));
  app.use('/api/orders',        require('./routes/orders'));
  app.use('/api/prescriptions', require('./routes/prescriptions'));
  app.use('/api/admin',         require('./routes/admin'));
  app.use('/api',               require('./routes/wallet'));
  app.use('/api',               require('./routes/payment'));
  app.use('/api',               require('./routes/users'));
  app.use('/api',               require('./routes/rag'));
  app.use('/api/vedicmind',     require('./routes/vedicmind'));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('API Error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`\n✅ MedInVedic API running → http://localhost:${PORT}`);
    console.log(`   Default admin: admin@medinvedic.com / admin123\n`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});

