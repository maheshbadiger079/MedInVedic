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

// ── Middleware & CORS Configuration ──────────────────────────────
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000', 'http://localhost:8888', 'http://127.0.0.1:8888', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Access from this origin is restricted.'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static upload assets
app.use('/uploads/products', express.static(path.join(__dirname, '../public/uploads/products')));
app.use('/uploads/prescriptions', express.static(path.join(__dirname, '../public/uploads/prescriptions')));

// Serve frontend public directory directly
app.use(express.static(path.join(__dirname, '../public')));

// Clean alias for patient workspace and health hub
app.get('/workspace', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/workspace.html'));
});

app.get('/health-hub', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/health-hub.html'));
});


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
  app.use('/api/activity',      require('./routes/activity'));
  app.use('/api/admin/activity',require('./routes/activity'));
  app.use('/api/healthcare',    require('./routes/healthcare'));
  app.use('/api/workspace',     require('./routes/workspace'));
  app.use('/api/health-hub',    require('./routes/healthhub'));
  app.use('/api/healthhub',     require('./routes/healthhub'));
  app.use('/api/simulations',   require('./routes/simulations'));

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

