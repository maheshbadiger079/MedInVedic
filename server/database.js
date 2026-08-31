/**
 * database.js — SQLite via sql.js (pure JS, no C++ compilation needed)
 * Loads DB from file on start, saves to file on every write.
 */
const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');
const bcrypt    = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'medinvedic.sqlite');

let db;   // sql.js Database instance

// ── Initialize DB async ──────────────────────────────────────────
async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  createSchema();
  seedData();
  save();  // persist initial state
  console.log(`✅ SQLite database ready: ${DB_PATH}`);
  return db;
}

// ── Save DB to disk ───────────────────────────────────────────────
function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ── Wrapped helpers (mimic better-sqlite3 sync API) ──────────────
function run(sql, params = []) {
  db.run(sql, params);
  save();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

function all(sql, params = []) {
  const results = [];
  const stmt    = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function insert(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0];
  save();
  return lastId ? lastId.values[0][0] : null;
}

// ── Schema creation ───────────────────────────────────────────────
function createSchema() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT DEFAULT 'user',
    phone       TEXT DEFAULT '',
    blood_group TEXT DEFAULT '',
    membership  TEXT DEFAULT 'Silver',
    orders_count INTEGER DEFAULT 0,
    rx_approved INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    tag         TEXT NOT NULL,
    price       INTEGER NOT NULL,
    emoji       TEXT DEFAULT '💊',
    description TEXT DEFAULT '',
    keywords    TEXT DEFAULT '',
    rating      REAL DEFAULT 4.5,
    reviews     INTEGER DEFAULT 0,
    stock       INTEGER DEFAULT 100,
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id     TEXT NOT NULL,
    user_id      INTEGER,
    items        TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    status       TEXT DEFAULT 'Processing',
    payment_id   TEXT DEFAULT '',
    address      TEXT DEFAULT '{}',
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER,
    file_path    TEXT NOT NULL,
    file_name    TEXT DEFAULT 'prescription',
    file_type    TEXT DEFAULT 'image',
    status       TEXT DEFAULT 'pending',
    notes        TEXT DEFAULT '',
    verified_by  INTEGER,
    verified_at  TEXT,
    uploaded_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS doctors (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    spec         TEXT NOT NULL,
    emoji        TEXT DEFAULT '👨‍⚕️',
    rating       REAL DEFAULT 4.5,
    reviews      INTEGER DEFAULT 0,
    exp          TEXT DEFAULT '5 years',
    fee          INTEGER DEFAULT 300,
    available    INTEGER DEFAULT 1,
    address      TEXT DEFAULT '',
    city         TEXT DEFAULT 'Mumbai',
    lat          REAL DEFAULT 19.0760,
    lng          REAL DEFAULT 72.8777,
    created_at   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medical_stores (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    address      TEXT NOT NULL,
    city         TEXT DEFAULT 'Mumbai',
    lat          REAL DEFAULT 19.0760,
    lng          REAL DEFAULT 72.8777,
    rating       REAL DEFAULT 4.5,
    reviews      INTEGER DEFAULT 0,
    phone        TEXT DEFAULT '',
    type         TEXT DEFAULT 'Modern', -- Modern, Ayurvedic, Both
    image        TEXT DEFAULT '',
    created_at   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pharmacists (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    spec         TEXT DEFAULT 'Ayurvedic Pharmacist',
    address      TEXT NOT NULL,
    city         TEXT DEFAULT 'Mumbai',
    lat          REAL DEFAULT 19.0760,
    lng          REAL DEFAULT 72.8777,
    rating       REAL DEFAULT 4.5,
    reviews      INTEGER DEFAULT 0,
    phone        TEXT DEFAULT '',
    exp          TEXT DEFAULT '3 years',
    available    INTEGER DEFAULT 1,
    created_at   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS consultations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    doctor_id   INTEGER,
    type        TEXT DEFAULT 'chat',
    symptoms    TEXT DEFAULT '',
    status      TEXT DEFAULT 'Booked',
    fee         INTEGER DEFAULT 0,
    prescription_issued INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    product_id  INTEGER,
    rating      INTEGER NOT NULL,
    comment     TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER DEFAULT 0,
    title       TEXT NOT NULL,
    body        TEXT DEFAULT '',
    type        TEXT DEFAULT 'info',
    read        INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS wallets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER UNIQUE,
    balance     INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    amount      INTEGER NOT NULL,
    type        TEXT NOT NULL, -- 'credit', 'debit'
    purpose     TEXT NOT NULL, -- e.g. 'Wallet Topup', 'Donation', 'Order Payment'
    status      TEXT DEFAULT 'completed',
    payment_id  TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  // ── Admin & RAG / LLM Management Tables ──────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id    TEXT NOT NULL,
    admin_name  TEXT NOT NULL,
    action      TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id   TEXT DEFAULT '',
    details     TEXT DEFAULT '',
    ip          TEXT DEFAULT '127.0.0.1',
    status      TEXT DEFAULT 'SUCCESS',
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS security_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type  TEXT NOT NULL,
    severity    TEXT DEFAULT 'INFO', -- 'INFO', 'WARNING', 'HIGH', 'CRITICAL'
    ip          TEXT DEFAULT '127.0.0.1',
    user_agent  TEXT DEFAULT '',
    details     TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS rag_documents (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_id         TEXT UNIQUE NOT NULL,
    title          TEXT NOT NULL,
    source         TEXT NOT NULL,
    organization   TEXT DEFAULT 'WHO / AYUSH',
    tier           INTEGER DEFAULT 1,
    evidence_level TEXT DEFAULT 'Strong',
    category       TEXT DEFAULT 'Clinical Medicine',
    language       TEXT DEFAULT 'English',
    content        TEXT NOT NULL,
    keywords       TEXT DEFAULT '',
    status         TEXT DEFAULT 'Verified', -- 'Pending Review', 'Verified', 'Rejected', 'Archived'
    created_at     TEXT DEFAULT (datetime('now')),
    updated_at     TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS llm_config (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    provider     TEXT DEFAULT 'Google Gemini',
    model_name   TEXT DEFAULT 'gemini-1.5-flash',
    routing_mode TEXT DEFAULT 'hybrid_rag', -- 'standard', 'hybrid_rag', 'reasoning_clinical'
    temperature  REAL DEFAULT 0.2,
    max_tokens   INTEGER DEFAULT 1024,
    safety_level TEXT DEFAULT 'Strict Medical Guardrails',
    updated_at   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS prompt_templates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_key  TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    version     TEXT DEFAULT '1.0.0',
    content     TEXT NOT NULL,
    updated_by  TEXT DEFAULT 'Super Admin',
    updated_at  TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ai_query_logs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text     TEXT NOT NULL,
    language       TEXT DEFAULT 'en',
    category       TEXT DEFAULT 'General Inquiry',
    retrieved_docs TEXT DEFAULT '[]',
    model_used     TEXT DEFAULT 'gemini-1.5-flash',
    latency_ms     INTEGER DEFAULT 250,
    status         TEXT DEFAULT 'Grounded', -- 'Grounded', 'Emergency Triggered', 'Fallback'
    quality_score  REAL DEFAULT 0.95,
    created_at     TEXT DEFAULT (datetime('now'))
  )`);
}

// ── Seed data ─────────────────────────────────────────────────────
function seedData() {
  // Admin user
  const adminExists = get('SELECT id FROM users WHERE email = ?', ['admin@medinvedic.com']);
  const hash = bcrypt.hashSync('admin123', 10);
  if (!adminExists) {
    db.run('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      ['Super Admin', 'admin@medinvedic.com', hash, 'super_admin']);
    console.log('✅ Default super admin seeded: admin@medinvedic.com / admin123');
  } else {
    db.run("UPDATE users SET password = ?, role = 'super_admin' WHERE email = ?", [hash, 'admin@medinvedic.com']);
  }

  // Mahesh Super Admin
  const maheshExists = get('SELECT id FROM users WHERE email = ?', ['maheshbadiger079@gmail.com']);
  if (!maheshExists) {
    db.run('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      ['Mahesh M Badiger', 'maheshbadiger079@gmail.com', hash, 'super_admin']);
  } else {
    db.run("UPDATE users SET role = 'super_admin' WHERE email = ?", ['maheshbadiger079@gmail.com']);
  }

  // Seed LLM config if empty
  const llmCount = (get('SELECT COUNT(*) as c FROM llm_config') || {}).c || 0;
  if (llmCount === 0) {
    db.run('INSERT INTO llm_config (provider, model_name, routing_mode, temperature, max_tokens, safety_level) VALUES (?,?,?,?,?,?)',
      ['Google Gemini', 'gemini-1.5-flash', 'hybrid_rag', 0.2, 1024, 'Strict Medical Guardrails']);
  }

  // Seed Prompt Templates if empty
  const promptCount = (get('SELECT COUNT(*) as c FROM prompt_templates') || {}).c || 0;
  if (promptCount === 0) {
    [
      ['system_medical_rag', 'System Prompt: RAG Medical Assistant', '1.2.0', 'You are MedInVedic AI, an expert dual-healthcare assistant combining evidence-based modern medicine and authentic Ayurveda. Always ground claims in retrieved sources. If evidence is insufficient, explicitly state limitations and advise consulting a qualified physician.'],
      ['safety_triage', 'Medical Safety & Triage Filter', '1.0.0', 'Detect emergency symptoms (chest pain, stroke, severe breathlessness, anaphylaxis) immediately and output emergency 112 protocol. Never prescribe prescription-only medications or alter clinician dosages.'],
      ['ayurveda_grounding', 'Ayurvedic Herb & Formulation Grounding', '1.1.0', 'Distinguish traditional Ayurvedic historical use from clinically evaluated modern evidence. Present dosha indications, classical preparation methods, and contraindications accurately.'],
      ['fallback_safe', 'Low-Confidence Fallback Handler', '1.0.0', 'Reliable clinical documentation for this query was not established in the verified knowledge base. Please consult Dr. Priya Sharma or Dr. Shailesh Phalle on the MedInVedic doctor portal for customized clinical advice.']
    ].forEach(p => db.run('INSERT INTO prompt_templates (prompt_key, title, version, content) VALUES (?,?,?,?)', p));
  }

  // Seed RAG Documents if empty
  const ragCount = (get('SELECT COUNT(*) as c FROM rag_documents') || {}).c || 0;
  if (ragCount === 0) {
    [
      ['fever_who_001', 'Fever in Adults: Management Guidelines', 'World Health Organization (WHO) / NHS', 'WHO / NHS', 1, 'Strong', 'Infectious Disease', 'English', 'Fever (pyrexia) is body temperature > 38°C (100.4°F). First line management includes rest, oral hydration, and Paracetamol 500–1000mg every 4–6 hours (max 4g/day). Warning signs include fever > 39.5°C, stiff neck, shortness of breath, or duration > 3 days.', 'fever, temperature, pyrexia, chills, paracetamol', 'Verified'],
      ['ashwa_ayur_002', 'Ashwagandha (Withania somnifera) Monograph', 'Ayurvedic Pharmacopoeia of India (API) / AYUSH', 'AYUSH Ministry', 3, 'Traditional & Clinical', 'Ayurvedic Wellness', 'English', 'Ashwagandha is a premier Rasayana adaptogen known to balance Vata and Kapha doshas. Clinically evaluated for stress reduction, cortisol normalization (KSM-66 extract 300mg twice daily), and sleep quality improvement. Contraindicated in pregnancy.', 'ashwagandha, stress, adaptogen, vata, sleep, immunity', 'Verified'],
      ['diabetes_icmr_003', 'Type 2 Diabetes Clinical Management', 'ICMR Guidelines for Management of Type 2 Diabetes', 'ICMR', 1, 'Strong', 'Endocrinology', 'English', 'First-line pharmacological management is Metformin 500mg once or twice daily with meals alongside lifestyle modifications. HbA1c target is generally < 7.0%. Combined Ayurvedic adjuncts include Karela, Jamun, and Methi under doctor supervision.', 'diabetes, sugar, metformin, hba1c, insulin, glucose', 'Verified'],
      ['triphala_ayur_004', 'Triphala Formulation & Digestive Health', 'Ayurvedic Formulary of India (AFI)', 'AFI / CCRAS', 3, 'Traditional Evidence', 'Gastroenterology', 'English', 'Triphala is an equal-part formulation of Amalaki, Haritaki, and Vibhitaki. Acts as a gentle bowel regulator, antioxidant, and mild detoxifier (Ama pachana). Recommended dose: 3–5g with warm water before bedtime.', 'triphala, digestion, constipation, amalaki, haritaki', 'Verified'],
      ['hypertension_aha_005', 'Hypertension Diagnosis & Treatment Protocol', 'American Heart Association (AHA) / Cardiological Society of India', 'AHA / CSI', 1, 'Strong', 'Cardiology', 'English', 'Blood pressure >= 130/80 mmHg indicates Stage 1 hypertension. Non-pharmacological management includes sodium restriction (< 2g/day), aerobic exercise, and stress management. Arjuna bark extract is a traditional cardiac supportive tonic.', 'hypertension, blood pressure, bp, cardiac, arjuna, sodium', 'Verified'],
      ['brahmi_ccras_006', 'Bacopa monnieri (Brahmi) Medhya Rasayana & Neuroprotection', 'Central Council for Research in Ayurvedic Sciences (CCRAS)', 'CCRAS / AYUSH', 3, 'Traditional & Clinical', 'Neurology & Cognition', 'English', 'Brahmi (Bacopa monnieri) contains active bacosides A and B that modulate cholinergic neurotransmission, enhancing synaptic connectivity and memory recall.', 'brahmi, bacopa, memory, brain, focus, cognition, neuroprotection', 'Verified'],
      ['tulsi_giloy_007', 'Guduchi (Giloy) & Tulsi Immunomodulatory & Antipyretic Profile', 'National Institute of Ayurveda & Ministry of AYUSH Protocols', 'AYUSH / MoHFW', 2, 'Clinical & Traditional', 'Infectious Disease', 'English', 'Tinospora cordifolia (Guduchi/Giloy) combined with Ocimum sanctum (Tulsi) stimulates macrophage activity, enhances humoral antibody response, and possesses antipyretic properties.', 'giloy, guduchi, tulsi, immunity, viral fever, platelets, antipyretic', 'Verified'],
      ['omeprazole_fda_008', 'Proton Pump Inhibitors (Omeprazole) in Acid Peptic Disorders & GERD', 'FDA Clinical Pharmacology & British National Formulary (BNF)', 'FDA / BNF', 1, 'Strong', 'Gastroenterology', 'English', 'Omeprazole (20mg once daily in the morning before breakfast) inhibits gastric H+/K+-ATPase pumps, suppressing acid secretion for GERD and peptic ulcer healing.', 'omeprazole, acidity, gerd, heartburn, stomach, ppi, gastric ulcer', 'Verified']
    ].forEach(d => db.run('INSERT INTO rag_documents (doc_id, title, source, organization, tier, evidence_level, category, language, content, keywords, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)', d));
  }

  // Seed initial Audit Log
  const auditCount = (get('SELECT COUNT(*) as c FROM audit_logs') || {}).c || 0;
  if (auditCount === 0) {
    db.run('INSERT INTO audit_logs (admin_id, admin_name, action, target_type, target_id, details) VALUES (?,?,?,?,?,?)',
      ['admin_system', 'System Init', 'SYSTEM_INITIALIZE', 'CONFIG', 'sys_001', 'MedInVedic RAG Admin Control Center initialized with enterprise RBAC.']);
  }

  // Doctors
  const docCount = get('SELECT COUNT(*) as c FROM doctors').c;
  if (!docCount || docCount === 0) {
    [
      ['Dr. Shailesh Phalle',  'MD - Ayurvedic & Panchakarma',      '👨‍⚕️', 4.9, 3240, '18 years', 400, 'Ayusanjivani Clinic, Erandwane, Pune', 18.5089, 73.8340],
      ['Dr. Manoj Deshpande', 'BAMS - Ayurvedic Specialist',       '🩺', 4.8, 2150, '25 years', 500, 'Kalpataru Ayurved, Sahakar Nagar, Pune', 18.4912, 73.8505],
      ['Dr. Dhananjay Kelkar', 'MS - Senior Surgeon & Consultant',  '👩‍⚕️', 4.9, 4500, '30 years', 800, 'Deenanath Mangeshkar Hospital, Pune', 18.5065, 73.8341],
      ['Dr. Amit Kashid',     'BAMS - Ayurvedic Consultant',       '🌿', 4.7, 1220, '14 years', 300, 'Ashtang Ayurved Hospital, Pune', 18.5300, 73.8400],
      ['Dr. Narendra Shekade', 'Ayurvedic Specialist',              '👨‍⚕️', 4.6, 920,  '15 years', 250, 'Ayush Ayurved Clinic, Kharadi, Pune', 18.5516, 73.9351],
    ].forEach(d => db.run(
      'INSERT INTO doctors (name,spec,emoji,rating,reviews,exp,fee,address,lat,lng) VALUES (?,?,?,?,?,?,?,?,?,?)', d
    ));
  }

  // Medical Stores
  const storeCount = get('SELECT COUNT(*) as c FROM medical_stores').c;
  if (!storeCount || storeCount === 0) {
    [
      ['Wellness Forever', 'Erandwane, Near Mhatre Bridge, Pune', 'Pune', 18.5070, 73.8345, 4.7, 1500, '+91 20 2541 0000', 'Modern'],
      ['Apollo Pharmacy', 'Camp Area, MG Road, Pune', 'Pune', 18.5200, 73.8750, 4.8, 1100, '+1800 102 0333', 'Modern'],
      ['Patanjali Chikitsalaya', 'Kothrud Depot Road, Pune', 'Pune', 18.5020, 73.8050, 4.9, 850, '+91 20 2528 1111', 'Ayurvedic'],
      ['Kottakkal Arya Vaidya Sala', 'Deccan Gymkhana, Pune', 'Pune', 18.5180, 73.8390, 4.9, 620, '+91 20 2553 4444', 'Ayurvedic'],
      ['MedInVedic Pune Hub', 'Senapati Bapat Road, Pune', 'Pune', 18.5360, 73.8290, 5.0, 300, '+91 97664 41863', 'Both']
    ].forEach(s => db.run(
      'INSERT INTO medical_stores (name,address,city,lat,lng,rating,reviews,phone,type) VALUES (?,?,?,?,?,?,?,?,?)', s
    ));
  }

  // Pharmacists
  const pharCount = get('SELECT COUNT(*) as c FROM pharmacists').c;
  if (!pharCount || pharCount === 0) {
    [
      ['Mahesh Deshpande', 'Senior Ayurvedic Pharmacist', 'Erandwane, Pune', 18.5089, 73.8340, 4.9, 125, '+91 97664 41863', '15 years'],
      ['Sanjay Kulkarni', 'Modern Pharmacist', 'Kothrud, Pune', 18.5020, 73.8050, 4.7, 89, '+91 98811 00000', '20 years'],
      ['Anjali More', 'Professional Pharmacist', 'Shivajinagar, Pune', 18.5300, 73.8500, 4.8, 56, '+91 99220 00000', '5 years']
    ].forEach(p => db.run(
      'INSERT INTO pharmacists (name,spec,address,lat,lng,rating,reviews,phone,exp) VALUES (?,?,?,?,?,?,?,?,?)', p
    ));
  }

  // Products
  const prodCount = get('SELECT COUNT(*) as c FROM products').c;
  if (!prodCount || prodCount === 0) {
    [
      ['Paracetamol 500mg','Pain Relief','modern',45,'💊','Fast-acting pain & fever relief','fever,headache,pain,cold',4.5,1200,250],
      ['Cetirizine 10mg','Allergy','modern',89,'💊','Antihistamine for allergies','allergy,cold,sneezing',4.6,980,180],
      ['Omeprazole 20mg','Gastrology','modern',129,'💊','Proton pump inhibitor for acidity','acidity,heartburn,gerd',4.7,756,200],
      ['Metformin 500mg','Diabetes','rx',145,'💊','Type 2 diabetes management','diabetes,sugar,glucose',4.8,543,150],
      ['Vitamin D3 60K','Vitamins','modern',299,'🌞','Weekly Vitamin D3 supplement','vitamin d,bone,immunity',4.9,2100,300],
      ['Azithromycin 500mg','Antibiotics','rx',245,'💊','Antibiotic for respiratory infections','infection,pneumonia',4.6,389,100],
      ['Ashwagandha KSM-66','Immunity','ayur',699,'🌿','Premium Ashwagandha root extract','stress,energy,immunity,ashwagandha',4.8,1567,200],
      ['Triphala Churna','Digestive Health','ayur',299,'🌾','Ancient digestive tonic','digestion,constipation,triphala',4.7,1234,180],
      ['Chyawanprash Premium','Immunity','ayur',549,'🫙','Premium immunity booster with herbs','immunity,Cold,chyawanprash,amla',4.9,2890,250],
      ['Brahmi Brain Tonic','Brain & Memory','ayur',449,'🧠','Memory & concentration booster','memory,brain,focus,brahmi',4.6,876,150],
      ['Neem Karela Jamun','Diabetes','ayur',399,'🌿','Ayurvedic blood sugar management','diabetes,sugar,neem,karela',4.5,543,120],
      ['Tulsi Giloy Drops','Immunity','ayur',349,'🌿','Immunity drops with Tulsi & Giloy','immunity,fever,giloy,tulsi',4.7,1890,300],
      ['Shilajit Resin Gold','Energy','ayur',999,'⚡','Pure Himalayan Shilajit for energy','energy,vitality,shilajit,stamina',4.9,432,80],
      ['Arjuna Heart Care','Cardiology','ayur',599,'❤️','Strengthens heart muscles','heart,cardio,arjuna,cholesterol',4.8,678,100],
    ].forEach(p => db.run(
      'INSERT INTO products (name,category,tag,price,emoji,description,keywords,rating,reviews,stock) VALUES (?,?,?,?,?,?,?,?,?,?)', p
    ));
  }
}

module.exports = { initDB, run, get, all, insert, save };
