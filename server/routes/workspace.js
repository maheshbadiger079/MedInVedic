/**
 * server/routes/workspace.js — MedInVedic Patient Workspace API
 * ═══════════════════════════════════════════════════════════════════
 * Real backend routes connecting the Patient Workspace feature to SQLite:
 * - Real live health stats
 * - Real dual medicine catalog search (Modern + Ayurveda)
 * - Real doctor discovery & appointment booking with cancellation
 * - Real medication reminders planner & tracker
 * - Real prescription document uploads via Multer & Health Vault
 * - Real clinical & Ayurvedic AI Assistant with grounded RAG + emergency triage
 * - Real comprehensive Ayurveda botanical & clinical monograph explorer
 */

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../database');

// Ensure prescriptions upload directory exists
const rxUploadDir = path.join(__dirname, '../../public/uploads/prescriptions');
if (!fs.existsSync(rxUploadDir)) {
  fs.mkdirSync(rxUploadDir, { recursive: true });
}

// Multer storage for prescription uploads
const rxStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, rxUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `rx_${Date.now()}_${cleanBase}${ext}`);
  }
});

const rxUpload = multer({
  storage: rxStorage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF documents are supported.'));
    }
  }
});

// Emergency detection keywords for clinical safety triage
const EMERGENCY_REGEXES = [
  /chest\s*(?:pain|pressure|tightness|heaviness)/i,
  /heart\s*attack/i,
  /difficulty\s*breathing|cannot\s*breathe|can't\s*breathe|severe\s*breathlessness|suffocating/i,
  /stroke|facial\s*droop|slurred\s*speech|sudden\s*weakness|sudden\s*paralysis/i,
  /anaphylaxis|throat\s*closing|severe\s*allergic\s*reaction/i,
  /coughing\s*up\s*blood|vomiting\s*blood|severe\s*head\s*injury/i
];

// Helper to sanitize text
function clean(str) {
  return typeof str === 'string' ? str.trim() : '';
}

// ── 1. GET /api/workspace/stats ───────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const appts = db.get("SELECT COUNT(*) as c FROM appointments WHERE status != 'Cancelled'")?.c || 0;
    const reminders = db.get("SELECT COUNT(*) as c FROM medication_reminders WHERE status = 'Active'")?.c || 0;
    const rxs = db.get("SELECT COUNT(*) as c FROM prescriptions")?.c || 0;
    const meds = db.get("SELECT COUNT(*) as c FROM medicines_catalog")?.c || 0;
    const herbs = db.get("SELECT COUNT(*) as c FROM ayurveda_herbs")?.c || 0;

    res.json({
      success: true,
      stats: {
        appointments: appts,
        reminders: reminders,
        prescriptions: rxs,
        medicines: meds,
        herbs: herbs
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve workspace statistics.' });
  }
});

// ── 2. GET /api/workspace/medicines ───────────────────────────────
router.get('/medicines', (req, res) => {
  try {
    const q = clean(req.query.q).toLowerCase();
    const category = clean(req.query.category);

    let sql = 'SELECT * FROM medicines_catalog WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }

    if (q) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(indication) LIKE ? OR LOWER(tag) LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += ' ORDER BY rating DESC, name ASC';
    const medicines = db.all(sql, params);
    res.json({ success: true, count: medicines.length, medicines });
  } catch (err) {
    console.error('Medicines query error:', err);
    res.status(500).json({ error: 'Failed to search medicines catalog.' });
  }
});

// ── 3. GET /api/workspace/doctors ─────────────────────────────────
router.get('/doctors', (req, res) => {
  try {
    const doctors = db.all('SELECT id, name, spec, emoji, rating, reviews, fee, exp, address FROM doctors WHERE available = 1 ORDER BY rating DESC');
    res.json({ success: true, doctors });
  } catch (err) {
    console.error('Doctors query error:', err);
    res.status(500).json({ error: 'Failed to fetch doctor directory.' });
  }
});

// ── 4. GET /api/workspace/appointments ────────────────────────────
router.get('/appointments', (req, res) => {
  try {
    const appointments = db.all('SELECT * FROM appointments ORDER BY appointment_date ASC, appointment_time ASC');
    res.json({ success: true, appointments });
  } catch (err) {
    console.error('Appointments list error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

// ── 5. POST /api/workspace/appointments ───────────────────────────
router.post('/appointments', (req, res) => {
  try {
    const { doctor_name, consultation_type, appointment_date, appointment_time, notes, patient_name, patient_phone, user_id } = req.body;

    if (!doctor_name || !consultation_type || !appointment_date) {
      return res.status(400).json({ error: 'Doctor name, consultation type, and appointment date are required.' });
    }

    const docName = clean(doctor_name);
    const consultType = clean(consultation_type);
    const apptDate = clean(appointment_date);
    const apptTime = clean(appointment_time) || '10:00 AM';
    const patNotes = clean(notes);
    const pName = clean(patient_name) || 'Valued Patient';
    const pPhone = clean(patient_phone) || '';
    const uid = clean(user_id) || 'guest';

    const insertId = db.insert(
      `INSERT INTO appointments (user_id, patient_name, patient_phone, doctor_name, consultation_type, appointment_date, appointment_time, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')`,
      [uid, pName, pPhone, docName, consultType, apptDate, apptTime, patNotes]
    );

    const created = db.get('SELECT * FROM appointments WHERE id = ?', [insertId]);
    res.json({ success: true, message: 'Appointment booked successfully.', appointment: created });
  } catch (err) {
    console.error('Appointment booking error:', err);
    res.status(500).json({ error: 'Failed to schedule appointment.' });
  }
});

// ── 6. DELETE /api/workspace/appointments/:id ─────────────────────
router.delete('/appointments/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.get('SELECT id FROM appointments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    db.run('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Appointment cancelled and removed.' });
  } catch (err) {
    console.error('Appointment delete error:', err);
    res.status(500).json({ error: 'Failed to cancel appointment.' });
  }
});

// ── 7. GET /api/workspace/reminders ───────────────────────────────
router.get('/reminders', (req, res) => {
  try {
    const reminders = db.all('SELECT * FROM medication_reminders ORDER BY reminder_time ASC, id DESC');
    res.json({ success: true, reminders });
  } catch (err) {
    console.error('Reminders query error:', err);
    res.status(500).json({ error: 'Failed to fetch medication reminders.' });
  }
});

// ── 8. POST /api/workspace/reminders ──────────────────────────────
router.post('/reminders', (req, res) => {
  try {
    const { med_name, dosage, reminder_time, frequency, user_id } = req.body;

    if (!med_name || !reminder_time) {
      return res.status(400).json({ error: 'Medicine name and reminder time are required.' });
    }

    const medName = clean(med_name);
    const medDose = clean(dosage) || '1 dose';
    const remTime = clean(reminder_time);
    const freq = clean(frequency) || 'Daily';
    const uid = clean(user_id) || 'guest';

    const insertId = db.insert(
      `INSERT INTO medication_reminders (user_id, med_name, dosage, reminder_time, frequency, status)
       VALUES (?, ?, ?, ?, ?, 'Active')`,
      [uid, medName, medDose, remTime, freq]
    );

    const created = db.get('SELECT * FROM medication_reminders WHERE id = ?', [insertId]);
    res.json({ success: true, message: 'Medication reminder scheduled.', reminder: created });
  } catch (err) {
    console.error('Reminder create error:', err);
    res.status(500).json({ error: 'Failed to create medication reminder.' });
  }
});

// ── 9. PATCH /api/workspace/reminders/:id/toggle ──────────────────
router.patch('/reminders/:id/toggle', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.get('SELECT id, status FROM medication_reminders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    const newStatus = existing.status === 'Completed' ? 'Active' : 'Completed';
    db.run('UPDATE medication_reminders SET status = ? WHERE id = ?', [newStatus, id]);
    res.json({ success: true, id, status: newStatus });
  } catch (err) {
    console.error('Reminder toggle error:', err);
    res.status(500).json({ error: 'Failed to update reminder status.' });
  }
});

// ── 10. DELETE /api/workspace/reminders/:id ───────────────────────
router.delete('/reminders/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.get('SELECT id FROM medication_reminders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    db.run('DELETE FROM medication_reminders WHERE id = ?', [id]);
    res.json({ success: true, message: 'Medication reminder deleted.' });
  } catch (err) {
    console.error('Reminder delete error:', err);
    res.status(500).json({ error: 'Failed to delete reminder.' });
  }
});

// ── 11. GET /api/workspace/prescriptions ──────────────────────────
router.get('/prescriptions', (req, res) => {
  try {
    const rxs = db.all('SELECT * FROM prescriptions ORDER BY uploaded_at DESC');
    res.json({ success: true, prescriptions: rxs });
  } catch (err) {
    console.error('Prescriptions query error:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions.' });
  }
});

// ── 12. POST /api/workspace/prescriptions/upload ──────────────────
router.post('/prescriptions/upload', rxUpload.single('prescription'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No prescription file provided. Please choose an image or PDF.' });
    }

    const notes = clean(req.body.notes) || 'Uploaded via Patient Workspace';
    const filePath = `/uploads/prescriptions/${req.file.filename}`;
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';
    const originalName = req.file.originalname;

    const insertId = db.insert(
      `INSERT INTO prescriptions (user_id, file_path, file_name, file_type, status, notes)
       VALUES (1, ?, ?, ?, 'Pending Review', ?)`,
      [filePath, originalName, fileType, notes]
    );

    const record = db.get('SELECT * FROM prescriptions WHERE id = ?', [insertId]);
    res.json({
      success: true,
      message: 'Prescription uploaded securely to health vault.',
      prescription: record
    });
  } catch (err) {
    console.error('Prescription upload error:', err);
    res.status(500).json({ error: err.message || 'Prescription upload failed.' });
  }
});

// ── 13. DELETE /api/workspace/prescriptions/:id ───────────────────
router.delete('/prescriptions/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.get('SELECT * FROM prescriptions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Prescription record not found.' });
    }

    // Try deleting file from disk if present
    if (existing.file_path) {
      const diskPath = path.join(__dirname, '../../public', existing.file_path);
      if (fs.existsSync(diskPath)) {
        try { fs.unlinkSync(diskPath); } catch (e) {}
      }
    }

    db.run('DELETE FROM prescriptions WHERE id = ?', [id]);
    res.json({ success: true, message: 'Prescription deleted successfully.' });
  } catch (err) {
    console.error('Prescription delete error:', err);
    res.status(500).json({ error: 'Failed to delete prescription.' });
  }
});

// ── 14. POST /api/workspace/ai-chat ───────────────────────────────
router.post('/ai-chat', (req, res) => {
  try {
    const message = clean(req.body.message);
    const userId = clean(req.body.user_id) || 'guest';

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // A. Check Emergency Triage
    const isEmergency = EMERGENCY_REGEXES.some(rgx => rgx.test(message));
    if (isEmergency) {
      const emergencyReply = `🚨 MEDICAL EMERGENCY DETECTED:\n\nBased on your mention of potential acute symptoms (such as acute chest pain, stroke warning signs, or severe respiratory distress), immediate professional intervention is required.\n\n• Please dial 112 (National Emergency Helpline) or call an ambulance immediately.\n• If experiencing chest pain, sit resting calmly and avoid exertion.\n• Do not rely on an online chat tool for acute life-threatening situations.\n\nEmergency contacts: 112 (India Emergency) | 108 (Ambulance).`;

      // Log in chat history
      db.run("INSERT INTO workspace_chat (user_id, role, message, is_emergency) VALUES (?, 'user', ?, 1)", [userId, message]);
      db.run("INSERT INTO workspace_chat (user_id, role, message, is_emergency) VALUES (?, 'assistant', ?, 1)", [userId, emergencyReply]);

      return res.json({
        success: true,
        emergency: true,
        reply: emergencyReply,
        sources: ['Emergency Clinical Triage Protocol (WHO / MoHFW)']
      });
    }

    // B. Search Knowledge Bases
    const lower = message.toLowerCase();
    const matchedHerbs = db.all(
      `SELECT name, sanskrit_name, botanical_name, dosha_balance, indications, clinical_evidence, contraindications, preparation
       FROM ayurveda_herbs
       WHERE LOWER(name) LIKE ? OR LOWER(indications) LIKE ? OR LOWER(description) LIKE ? LIMIT 3`,
      [`%${lower}%`, `%${lower}%`, `%${lower}%`]
    );

    const matchedMeds = db.all(
      `SELECT name, category, indication, dosage_instructions, contraindications, description
       FROM medicines_catalog
       WHERE LOWER(name) LIKE ? OR LOWER(indication) LIKE ? OR LOWER(description) LIKE ? LIMIT 3`,
      [`%${lower}%`, `%${lower}%`, `%${lower}%`]
    );

    const matchedRAG = db.all(
      `SELECT title, source, content, organization
       FROM rag_documents
       WHERE LOWER(title) LIKE ? OR LOWER(keywords) LIKE ? OR LOWER(content) LIKE ? LIMIT 2`,
      [`%${lower}%`, `%${lower}%`, `%${lower}%`]
    );

    // C. Synthesize Grounded Clinical Dual-Care Response
    let reply = '';
    const sources = [];

    if (matchedMeds.length > 0 || matchedHerbs.length > 0 || matchedRAG.length > 0) {
      reply += `Thank you for your question. Here is an evidence-grounded synthesis combining modern medicine and Ayurvedic science:\n\n`;

      if (matchedMeds.length > 0) {
        reply += `💊 **Modern Pharmacological Considerations:**\n`;
        matchedMeds.forEach(m => {
          reply += `• **${m.name}** (${m.category}): ${m.description}\n`;
          if (m.dosage_instructions) reply += `  - *Standard Guidance:* ${m.dosage_instructions}\n`;
          if (m.contraindications) reply += `  - *Precautions:* ${m.contraindications}\n`;
          sources.push(`${m.name} Monograph (MedInVedic Clinical DB)`);
        });
        reply += `\n`;
      }

      if (matchedHerbs.length > 0) {
        reply += `🌿 **Ayurvedic & Rasayana Insights:**\n`;
        matchedHerbs.forEach(h => {
          reply += `• **${h.name}** (*${h.botanical_name}* / Sanskrit: *${h.sanskrit_name}*):\n`;
          reply += `  - *Dosha Balance:* ${h.dosha_balance}\n`;
          reply += `  - *Classical & Modern Evidence:* ${h.clinical_evidence}\n`;
          if (h.contraindications) reply += `  - *Contraindications:* ${h.contraindications}\n`;
          sources.push(`${h.name} Ayurvedic Pharmacopoeia (API/CCRAS)`);
        });
        reply += `\n`;
      }

      if (matchedRAG.length > 0) {
        matchedRAG.forEach(r => {
          reply += `📖 **Clinical Evidence Source (${r.organization}):** ${r.content.slice(0, 280)}...\n\n`;
          sources.push(`${r.title} — ${r.source}`);
        });
      }

      reply += `⚕️ **Clinical Note:** Natural therapies and modern medicines can interact. Always inform your treating physician before initiating or modifying any medication regimen.`;
    } else {
      // General grounded health response
      reply = `Thank you for consulting the MedInVedic Health Assistant.\n\n` +
        `Regarding "${message}":\n` +
        `• In modern integrative healthcare, individual symptoms must be assessed alongside physiological markers and personal medical history.\n` +
        `• In Ayurveda, health is cultivated by maintaining equilibrium among Vata, Pitta, and Kapha, while supporting strong digestive fire (Agni) and preventing toxin accumulation (Ama).\n` +
        `• To receive personalized recommendations, explore our dual medicine catalog, browse evidence-based herbs, or book a consultation with our verified Ayurvedic and modern practitioners.\n\n` +
        `*Disclaimer: This information is for educational purposes and should not replace direct clinical consultation with a licensed healthcare practitioner.*`;
      sources.push('MedInVedic Dual Healthcare Reference');
    }

    // D. Persist conversation history to DB
    db.run("INSERT INTO workspace_chat (user_id, role, message, is_emergency) VALUES (?, 'user', ?, 0)", [userId, message]);
    db.run("INSERT INTO workspace_chat (user_id, role, message, is_emergency) VALUES (?, 'assistant', ?, 0)", [userId, reply]);

    res.json({
      success: true,
      emergency: false,
      reply,
      sources
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to process healthcare query.' });
  }
});

// ── 15. GET /api/workspace/ai-chat/history ────────────────────────
router.get('/ai-chat/history', (req, res) => {
  try {
    const messages = db.all('SELECT * FROM workspace_chat ORDER BY id ASC LIMIT 50');
    res.json({ success: true, messages });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ error: 'Failed to retrieve chat history.' });
  }
});

// ── 16. DELETE /api/workspace/ai-chat/history ─────────────────────
router.delete('/ai-chat/history', (req, res) => {
  try {
    db.run('DELETE FROM workspace_chat');
    res.json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (err) {
    console.error('Chat clear error:', err);
    res.status(500).json({ error: 'Failed to clear chat history.' });
  }
});

// ── 17. GET /api/workspace/ayurveda ───────────────────────────────
router.get('/ayurveda', (req, res) => {
  try {
    const q = clean(req.query.q).toLowerCase();
    const dosha = clean(req.query.dosha);

    let sql = 'SELECT * FROM ayurveda_herbs WHERE 1=1';
    const params = [];

    if (dosha && dosha !== 'All') {
      sql += ' AND LOWER(dosha_balance) LIKE ?';
      params.push(`%${dosha.toLowerCase()}%`);
    }

    if (q) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(sanskrit_name) LIKE ? OR LOWER(botanical_name) LIKE ? OR LOWER(indications) LIKE ? OR LOWER(description) LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += ' ORDER BY name ASC';
    const herbs = db.all(sql, params);
    res.json({ success: true, count: herbs.length, herbs });
  } catch (err) {
    console.error('Ayurveda query error:', err);
    res.status(500).json({ error: 'Failed to fetch Ayurveda herbs.' });
  }
});

module.exports = router;
