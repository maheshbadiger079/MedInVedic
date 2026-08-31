const express = require('express');
const multer  = require('multer');
const path    = require('path');
const db      = require('../database');
const { requireAuth, requirePharmacist } = require('../middleware/auth');
const router  = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../../public/uploads/prescriptions')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `rx_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype);
    cb(null, ok);
  }
});

// POST /api/prescriptions/upload
router.post('/upload', requireAuth, upload.single('prescription'), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: 'No file or invalid type (JPEG/PNG/PDF only).' });
  const filePath = `/uploads/prescriptions/${req.file.filename}`;
  const id = db.insert(
    'INSERT INTO prescriptions (user_id,file_path,file_name,file_type) VALUES (?,?,?,?)',
    [req.user.id, filePath, req.file.originalname, req.file.mimetype.includes('pdf') ? 'pdf' : 'image']
  );
  db.run('INSERT INTO notifications (user_id,title,body,type) VALUES (0,?,?,?)',
    ['📄 New Prescription Uploaded', `User ${req.user.name} uploaded a prescription.`, 'prescription']);
  res.json({ success: true, prescriptionId: id, filePath });
});

// GET /api/prescriptions/my
router.get('/my', requireAuth, (req, res) => {
  res.json(db.all('SELECT * FROM prescriptions WHERE user_id=? ORDER BY uploaded_at DESC', [req.user.id]));
});

// GET /api/prescriptions (pharmacist)
router.get('/', requirePharmacist, (req, res) => {
  const status = req.query.status || 'pending';
  res.json(db.all(`
    SELECT p.*, u.name as patient_name, u.email as patient_email
    FROM prescriptions p JOIN users u ON u.id = p.user_id
    WHERE p.status = ? ORDER BY p.uploaded_at ASC
  `, [status]));
});

// PUT /api/prescriptions/:id/verify
router.put('/:id/verify', requirePharmacist, (req, res) => {
  const { action, notes } = req.body;
  const map = { verify:'verified', approve:'approved', reject:'rejected' };
  const newStatus = map[action];
  if (!newStatus) return res.status(400).json({ error: 'Invalid action.' });
  const rx = db.get('SELECT * FROM prescriptions WHERE id=?', [req.params.id]);
  if (!rx) return res.status(404).json({ error: 'Prescription not found.' });
  db.run("UPDATE prescriptions SET status=?,notes=?,verified_by=?,verified_at=datetime('now') WHERE id=?",
    [newStatus, notes || '', req.user.id, req.params.id]);
  if (newStatus === 'approved') db.run('UPDATE users SET rx_approved=1 WHERE id=?', [rx.user_id]);
  const emoji = { verified:'🔵', approved:'✅', rejected:'❌' }[newStatus];
  db.run('INSERT INTO notifications (user_id,title,body,type) VALUES (?,?,?,?)',
    [rx.user_id, `${emoji} Prescription ${newStatus}`,
     `Your prescription has been ${newStatus}.${notes ? ' Note: ' + notes : ''}`, 'prescription_update']);
  res.json({ success: true, status: newStatus });
});

module.exports = router;
