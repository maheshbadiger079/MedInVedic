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

  // ── Real-Time Activity Monitoring Tables ─────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS activity_sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id   TEXT UNIQUE NOT NULL,
    user_id      TEXT DEFAULT '',
    display_name TEXT DEFAULT 'Guest Visitor',
    role         TEXT DEFAULT 'GUEST',
    status       TEXT DEFAULT 'ONLINE', -- 'ONLINE', 'IDLE', 'OFFLINE'
    started_at   TEXT DEFAULT (datetime('now')),
    last_seen_at TEXT DEFAULT (datetime('now')),
    ended_at     TEXT DEFAULT '',
    device_type  TEXT DEFAULT 'Desktop',
    browser      TEXT DEFAULT 'Chrome',
    os           TEXT DEFAULT 'Windows',
    active_tabs  INTEGER DEFAULT 1,
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS activity_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id   TEXT NOT NULL,
    user_id      TEXT DEFAULT '',
    display_name TEXT DEFAULT 'Guest Visitor',
    event_type   TEXT NOT NULL, -- 'APP_OPEN', 'LOGIN_SUCCESS', 'LOGOUT', 'HEARTBEAT', 'IDLE', 'ACTIVE', 'SESSION_END'
    metadata     TEXT DEFAULT '{}',
    timestamp    TEXT DEFAULT (datetime('now')),
    created_at   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_activity_sessions_sid ON activity_sessions(session_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activity_sessions_status ON activity_sessions(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activity_events_sid ON activity_events(session_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activity_events_ts ON activity_events(timestamp)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activity_events_type ON activity_events(event_type)`);

  // ── Patient Workspace Tables ─────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           TEXT DEFAULT 'guest',
    patient_name      TEXT DEFAULT 'Valued Patient',
    patient_phone     TEXT DEFAULT '',
    doctor_name       TEXT NOT NULL,
    consultation_type TEXT NOT NULL,
    appointment_date  TEXT NOT NULL,
    appointment_time  TEXT DEFAULT '10:00 AM',
    notes             TEXT DEFAULT '',
    status            TEXT DEFAULT 'Confirmed',
    created_at        TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medication_reminders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       TEXT DEFAULT 'guest',
    med_name      TEXT NOT NULL,
    dosage        TEXT DEFAULT '1 dose',
    reminder_time TEXT NOT NULL,
    frequency     TEXT DEFAULT 'Daily',
    status        TEXT DEFAULT 'Active',
    created_at    TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medicines_catalog (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    name                TEXT NOT NULL,
    category            TEXT NOT NULL,
    tag                 TEXT DEFAULT 'General',
    indication          TEXT DEFAULT '',
    dosage_instructions TEXT DEFAULT '',
    contraindications   TEXT DEFAULT '',
    description         TEXT NOT NULL,
    rating              REAL DEFAULT 4.7,
    created_at          TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ayurveda_herbs (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT NOT NULL,
    sanskrit_name     TEXT DEFAULT '',
    botanical_name    TEXT DEFAULT '',
    dosha_balance     TEXT DEFAULT 'Tridoshic (V-P-K)',
    category          TEXT DEFAULT 'Rasayana / Adaptogen',
    description       TEXT NOT NULL,
    indications       TEXT DEFAULT '',
    clinical_evidence TEXT DEFAULT '',
    contraindications TEXT DEFAULT '',
    preparation       TEXT DEFAULT 'Churna / Decoction / Extract',
    created_at        TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS workspace_chat (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      TEXT DEFAULT 'guest',
    role         TEXT NOT NULL,
    message      TEXT NOT NULL,
    is_emergency INTEGER DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_appointments_uid ON appointments(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_reminders_uid ON medication_reminders(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_meds_cat ON medicines_catalog(category)`);

  // ── MedInVedic Health Hub & Clinical Cockpit Tables ─────────────
  db.run(`CREATE TABLE IF NOT EXISTS health_locker_documents (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           TEXT DEFAULT 'guest',
    profile_id        INTEGER DEFAULT 0,
    title             TEXT NOT NULL,
    category          TEXT DEFAULT 'Lab Reports', -- 'Lab Reports', 'Prescriptions', 'Discharge Summaries', 'Clinical Notes', 'Vaccinations'
    document_type     TEXT DEFAULT 'PDF',
    file_url          TEXT NOT NULL,
    file_size         INTEGER DEFAULT 102400,
    file_mime         TEXT DEFAULT 'application/pdf',
    tags              TEXT DEFAULT 'general',
    date_recorded     TEXT DEFAULT (date('now')),
    share_token       TEXT DEFAULT '',
    share_expires_at  TEXT DEFAULT '',
    is_archived       INTEGER DEFAULT 0,
    audit_trail       TEXT DEFAULT '[]',
    created_at        TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medical_report_analyses (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           TEXT DEFAULT 'guest',
    document_id       INTEGER DEFAULT 0,
    report_title      TEXT NOT NULL,
    extracted_text    TEXT DEFAULT '',
    structured_tests  TEXT DEFAULT '[]', -- JSON array of {test_name, value, unit, reference_range, flag}
    ai_explanation    TEXT DEFAULT '',
    language          TEXT DEFAULT 'en',
    evidence_citations TEXT DEFAULT '[]',
    user_verified     INTEGER DEFAULT 1,
    created_at        TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS symptom_sessions (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id               TEXT DEFAULT 'guest',
    profile_id            INTEGER DEFAULT 0,
    selected_symptoms     TEXT NOT NULL,
    duration              TEXT DEFAULT '1-3 days',
    severity              TEXT DEFAULT 'Moderate',
    age_group             TEXT DEFAULT 'Adult (18-64)',
    contextual_answers    TEXT DEFAULT '{}',
    risk_level            TEXT DEFAULT 'Low', -- 'Routine', 'Urgent', 'Emergency'
    triage_category       TEXT DEFAULT 'Primary Care Evaluation',
    urgency_guidance      TEXT DEFAULT '',
    emergency_flag        INTEGER DEFAULT 0,
    care_pathway          TEXT DEFAULT 'General Physician / Ayurvedic Consultation',
    shared_with_doctor_id TEXT DEFAULT '',
    created_at            TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS nutrition_plans (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            TEXT DEFAULT 'guest',
    profile_id         INTEGER DEFAULT 0,
    diet_type          TEXT DEFAULT 'Vegetarian', -- 'Vegetarian', 'Eggetarian', 'Non-Vegetarian', 'Vegan', 'Sattvic'
    region             TEXT DEFAULT 'South Indian', -- 'North Indian', 'South Indian', 'East Indian', 'West Indian', 'Ayurvedic Sattvic'
    calories_target    INTEGER DEFAULT 2000,
    macro_protein_g    INTEGER DEFAULT 65,
    macro_carbs_g      INTEGER DEFAULT 240,
    macro_fat_g        INTEGER DEFAULT 55,
    allergies          TEXT DEFAULT 'None',
    weekly_schedule    TEXT DEFAULT '{}',
    shopping_list      TEXT DEFAULT '[]',
    food_substitutions TEXT DEFAULT '[]',
    created_at         TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS family_profiles (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    primary_user_id    TEXT DEFAULT 'guest',
    full_name          TEXT NOT NULL,
    relationship       TEXT NOT NULL, -- 'Self', 'Spouse', 'Child', 'Father', 'Mother', 'Grandparent', 'Other'
    dob                TEXT DEFAULT '1990-01-01',
    gender             TEXT DEFAULT 'Other',
    blood_group        TEXT DEFAULT 'B+',
    allergies          TEXT DEFAULT 'None known',
    chronic_conditions TEXT DEFAULT 'None',
    emergency_contact  TEXT DEFAULT '',
    consent_granted    INTEGER DEFAULT 1,
    access_revoked     INTEGER DEFAULT 0,
    created_at         TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medicine_interactions (
    id                         INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_a                 TEXT NOT NULL,
    medicine_b                 TEXT NOT NULL,
    active_ingredient_a        TEXT NOT NULL,
    active_ingredient_b        TEXT NOT NULL,
    severity                   TEXT NOT NULL, -- 'MILD', 'MODERATE', 'SEVERE', 'CONTRAINDICATED'
    interaction_type           TEXT NOT NULL, -- 'DRUG_DRUG', 'HERB_DRUG'
    description                TEXT NOT NULL,
    clinical_evidence          TEXT NOT NULL,
    management_recommendation  TEXT NOT NULL,
    created_at                 TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS lab_tests_catalog (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    test_code          TEXT UNIQUE NOT NULL,
    test_name          TEXT NOT NULL,
    category           TEXT NOT NULL,
    fasting_required   TEXT DEFAULT 'No Fasting Required',
    turnaround_hours   INTEGER DEFAULT 24,
    sample_type        TEXT DEFAULT 'Blood',
    price_inr          INTEGER NOT NULL,
    nabl_certified     INTEGER DEFAULT 1,
    description        TEXT NOT NULL,
    created_at         TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS lab_bookings (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            TEXT DEFAULT 'guest',
    profile_id         INTEGER DEFAULT 0,
    test_codes         TEXT NOT NULL,
    test_names         TEXT NOT NULL,
    lab_name           TEXT NOT NULL,
    appointment_date   TEXT NOT NULL,
    appointment_time   TEXT DEFAULT '08:30 AM',
    collection_type    TEXT DEFAULT 'Home Sample Collection',
    patient_address    TEXT DEFAULT 'Pune, Maharashtra',
    patient_phone      TEXT DEFAULT '+91 98000 00000',
    status             TEXT DEFAULT 'Sample Scheduled', -- 'Sample Scheduled', 'Sample Collected', 'In Lab Processing', 'Report Ready'
    total_amount       INTEGER NOT NULL,
    payment_id         TEXT DEFAULT 'PAY_MOCK_101',
    report_url         TEXT DEFAULT '',
    created_at         TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS health_timeline_events (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            TEXT DEFAULT 'guest',
    profile_id         INTEGER DEFAULT 0,
    event_type         TEXT NOT NULL, -- 'Consultation', 'Lab Report', 'Symptom Log', 'Medication Rx', 'Vital Reading', 'Vaccine'
    title              TEXT NOT NULL,
    summary            TEXT NOT NULL,
    metrics_json       TEXT DEFAULT '{}',
    source_provenance  TEXT DEFAULT 'Self-Reported', -- 'Verified Doctor Note', 'NABL Accredited Lab', 'Self-Reported', 'Pharmacy Dispense'
    event_date         TEXT DEFAULT (date('now')),
    created_at         TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS emergency_cards (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                  TEXT UNIQUE NOT NULL,
    full_name                TEXT NOT NULL,
    age                      INTEGER DEFAULT 32,
    blood_group              TEXT DEFAULT 'B+ Positive',
    critical_allergies       TEXT DEFAULT 'Sulfa drugs, Penicillin',
    chronic_conditions       TEXT DEFAULT 'Hypertension (Well-managed)',
    current_medications      TEXT DEFAULT 'Amlodipine 5mg, Ashwagandha KSM-66',
    emergency_contacts_json  TEXT DEFAULT '[]',
    organ_donor              TEXT DEFAULT 'Registered Organ Donor',
    attending_physician      TEXT DEFAULT 'Dr. Shailesh Phalle (+91 98220 00000)',
    access_token             TEXT UNIQUE NOT NULL,
    token_active             INTEGER DEFAULT 1,
    created_at               TEXT DEFAULT (datetime('now')),
    updated_at               TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS doctor_followups (
    id                           INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id                    TEXT NOT NULL,
    doctor_name                  TEXT NOT NULL,
    patient_id                   TEXT NOT NULL,
    patient_name                 TEXT NOT NULL,
    appointment_id               INTEGER DEFAULT 0,
    status                       TEXT DEFAULT 'Pending Clinician Review', -- 'Pending Clinician Review', 'Notes Added', 'Follow-up Scheduled'
    clinical_notes               TEXT DEFAULT '',
    prescription_recommendations TEXT DEFAULT '',
    patient_summary              TEXT DEFAULT '',
    scheduled_followup_date      TEXT DEFAULT '',
    created_at                   TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pharmacy_partner_inventory (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    pharmacy_id        TEXT NOT NULL,
    pharmacy_name      TEXT NOT NULL,
    pin_code           TEXT NOT NULL,
    city               TEXT NOT NULL,
    medicine_name      TEXT NOT NULL,
    active_ingredients TEXT NOT NULL,
    dosage_form        TEXT DEFAULT 'Tablet / Strip of 10',
    batch_number       TEXT NOT NULL,
    expiry_date        TEXT NOT NULL,
    stock_quantity     INTEGER DEFAULT 50,
    price_inr          INTEGER NOT NULL,
    is_verified        INTEGER DEFAULT 1,
    last_updated_at    TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS healthcare_expenses (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            TEXT DEFAULT 'guest',
    profile_id         INTEGER DEFAULT 0,
    category           TEXT NOT NULL, -- 'Doctor Consult', 'Medicines & Herbs', 'Lab Diagnostics', 'Hospital & Therapy', 'Wellness & Devices'
    description        TEXT NOT NULL,
    amount_inr         REAL NOT NULL,
    expense_date       TEXT DEFAULT (date('now')),
    receipt_url        TEXT DEFAULT '',
    payment_mode       TEXT DEFAULT 'UPI / Razorpay',
    tax_eligible       TEXT DEFAULT 'Section 80D Eligible',
    refund_status      TEXT DEFAULT 'None',
    created_at         TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS smart_health_notifications (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            TEXT DEFAULT 'guest',
    notification_type  TEXT NOT NULL, -- 'Medication Dose', 'Doctor Follow-up', 'Lab Report Ready', 'Order Status', 'Preventive Screen'
    title              TEXT NOT NULL,
    message            TEXT NOT NULL,
    scheduled_time     TEXT DEFAULT '09:00 AM',
    timezone           TEXT DEFAULT 'Asia/Kolkata',
    channel            TEXT DEFAULT 'In-App & Push',
    status             TEXT DEFAULT 'Active', -- 'Active', 'Sent', 'Dismissed'
    is_opted_in        INTEGER DEFAULT 1,
    created_at         TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS preventive_screenings (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            TEXT DEFAULT 'guest',
    profile_id         INTEGER DEFAULT 0,
    screen_name        TEXT NOT NULL,
    target_age_min     INTEGER DEFAULT 18,
    target_age_max     INTEGER DEFAULT 99,
    frequency_months   INTEGER DEFAULT 12,
    last_completed_date TEXT DEFAULT '',
    next_due_date      TEXT DEFAULT '',
    status             TEXT DEFAULT 'Due', -- 'Due', 'Completed', 'Upcoming'
    guidance_notes     TEXT DEFAULT '',
    created_at         TEXT DEFAULT (datetime('now'))
  )`);

  // ── MedInVedic AI Simulation Lab Tables ─────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS simulation_jobs (
    id                     TEXT PRIMARY KEY,
    owner_id               TEXT DEFAULT 'guest',
    title                  TEXT NOT NULL,
    scenario_type          TEXT DEFAULT 'WELLNESS_ROUTINE_COMPARISON',
    bounds_json            TEXT DEFAULT '{}',
    synthetic_persona_json TEXT DEFAULT '{}',
    agents_json            TEXT DEFAULT '[]',
    status                 TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'
    current_round          INTEGER DEFAULT 0,
    report_json            TEXT DEFAULT '{}',
    error_code             TEXT DEFAULT '',
    created_at             TEXT DEFAULT (datetime('now')),
    updated_at             TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS simulation_events (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    simulation_id TEXT NOT NULL,
    event_type    TEXT NOT NULL,
    round         INTEGER DEFAULT 0,
    timestamp     TEXT DEFAULT (datetime('now')),
    data_json     TEXT DEFAULT '{}'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS simulation_feedback (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    simulation_id  TEXT NOT NULL,
    user_id        TEXT DEFAULT 'guest',
    rating         INTEGER DEFAULT 5,
    issue_category TEXT DEFAULT 'Educational Utility',
    comments       TEXT DEFAULT '',
    created_at     TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_sim_jobs_owner ON simulation_jobs(owner_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sim_events_simid ON simulation_events(simulation_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sim_fb_simid ON simulation_feedback(simulation_id)`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_hl_docs_uid ON health_locker_documents(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_symp_uid ON symptom_sessions(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_fam_uid ON family_profiles(primary_user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_timeline_uid ON health_timeline_events(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_pharm_pin ON pharmacy_partner_inventory(pin_code)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_expense_uid ON healthcare_expenses(user_id)`);
}

// ── Activity Data Retention & Stale Session Cleanup ──────────────
function cleanupExpiredActivity(retentionDays = 30) {
  try {
    if (!db) return;
    // Remove historical raw events older than retentionDays
    db.run("DELETE FROM activity_events WHERE datetime(timestamp) < datetime('now', '-' || ? || ' days')", [retentionDays]);
    // Stale sessions (>75s without heartbeat) become OFFLINE
    db.run("UPDATE activity_sessions SET status = 'OFFLINE', ended_at = datetime('now'), updated_at = datetime('now') WHERE status != 'OFFLINE' AND datetime(last_seen_at) < datetime('now', '-75 seconds')");
    save();
  } catch (e) {
    console.warn('[ActivityMonitor] Cleanup warning:', e.message);
  }
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
      ['MedInVedic Pune Hub', 'Senapati Bapat Road, Pune', 'Pune', 18.5360, 73.8290, 5.0, 300, '+91 20 2565 0000', 'Both']
    ].forEach(s => db.run(
      'INSERT INTO medical_stores (name,address,city,lat,lng,rating,reviews,phone,type) VALUES (?,?,?,?,?,?,?,?,?)', s
    ));
  }

  // Pharmacists
  const pharCount = get('SELECT COUNT(*) as c FROM pharmacists').c;
  if (!pharCount || pharCount === 0) {
    [
      ['Mahesh Deshpande', 'Senior Ayurvedic Pharmacist', 'Erandwane, Pune', 18.5089, 73.8340, 4.9, 125, '+91 98220 11111', '15 years'],
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

  // Workspace Medicines Catalog
  const medCatCount = (get('SELECT COUNT(*) as c FROM medicines_catalog') || {}).c || 0;
  if (medCatCount === 0) {
    [
      ['Paracetamol 500mg', 'Modern medicine', 'Pain & Fever', 'Fever, mild-to-moderate headache, muscle aches', '500-1000mg every 4-6 hours (max 4000mg/day)', 'Severe hepatic impairment, chronic alcoholism', 'First-line antipyretic and analgesic widely recommended by WHO. Rapid onset within 30 minutes.', 4.8],
      ['Cetirizine 10mg', 'Modern medicine', 'Allergy & Rhinitis', 'Allergic rhinitis, hives, sneezing, itchy watery eyes', '10mg once daily at bedtime', 'Severe renal impairment; caution with sedatives', 'Second-generation non-sedating antihistamine that blocks H1 histamine receptors with minimal blood-brain barrier penetration.', 4.7],
      ['Omeprazole 20mg', 'Modern medicine', 'Gastric & Acidity', 'GERD, acid reflux, heartburn, gastric and duodenal ulcers', '20mg once daily 30-60 minutes before breakfast', 'Hypersensitivity to PPIs; check B12 in long-term use', 'Potent proton pump inhibitor that suppresses basal and stimulated gastric acid secretion by blocking H+/K+ ATPase.', 4.8],
      ['Metformin 500mg', 'Modern medicine', 'Endocrinology', 'Type 2 Diabetes Mellitus glycemic management', '500mg once or twice daily with or after meals', 'eGFR < 30 mL/min, acute metabolic acidosis', 'Gold standard biguanide improving insulin sensitivity, reducing hepatic glucose output without causing hypoglycemia.', 4.9],
      ['Azithromycin 500mg', 'Modern medicine', 'Antibiotics', 'Bacterial respiratory infections, sinusitis, bronchitis', '500mg once daily for 3 to 5 days (Rx only)', 'Severe hepatic disease, cardiac arrhythmias / QT prolongation', 'Broad-spectrum macrolide antibiotic inhibiting bacterial protein synthesis via 50S ribosomal subunit.', 4.6],
      ['Turmeric (Haridra / Curcumin)', 'Ayurveda ingredient', 'Anti-inflammatory', 'Systemic inflammation, joint mobility, skin wellness, immunity', '500-1000mg standardized extract with piperine', 'Biliary tract obstruction, concurrent high-dose anticoagulants', 'Venerable golden spice in Ayurveda with over 15,000 published studies confirming curcuminoid anti-inflammatory action.', 4.9],
      ['Ashwagandha KSM-66', 'Ayurveda ingredient', 'Rasayana / Adaptogen', 'Chronic stress, cortisol elevation, anxiety, restorative sleep, fatigue', '300-600mg standardized root extract twice daily', 'Pregnancy, hyperthyroidism; consult doctor if on immunosuppressants', 'Premier Medhya Rasayana balancing Vata and Kapha doshas, clinically validated for reducing serum cortisol by up to 27%.', 4.9],
      ['Triphala Churna', 'Herbal formulation', 'Digestion & Detox', 'Occasional constipation, sluggish bowel, digestive rejuvenation', '3-5g powder with warm water before sleep', 'Acute diarrhea, severe abdominal pain of unknown origin', 'Classical Ayurvedic polyherbal formulation of Amalaki, Haritaki, and Vibhitaki supporting gentle colon motility and antioxidant status.', 4.8],
      ['Brahmi (Bacopa monnieri)', 'Ayurveda ingredient', 'Cognition & Focus', 'Memory retention, mental fatigue, concentration, cognitive resilience', '300-450mg standardized bacoside extract with meals', 'Co-administration with cholinergic drugs requires clinical supervision', 'Revered brain tonic in Charaka Samhita. Clinical trials highlight neuroprotective properties and enhancement of synaptic neurotransmission.', 4.7],
      ['Tulsi & Giloy Complex', 'Herbal formulation', 'Immunity & Viral Care', 'Seasonal chills, immune defense, platelet support, respiratory comfort', '10-15 drops in lukewarm water twice daily', 'Autoimmune conditions without medical guidance', 'Synergistic combination of Holy Basil and Guduchi activating macrophage phagocytosis and balancing Pitta and Kapha.', 4.8],
      ['Arjuna Heart Care', 'Herbal formulation', 'Cardiovascular Support', 'Cardiovascular endurance, endothelial health, blood pressure maintenance', '500mg bark extract twice daily after meals', 'Severe hypotension or unmanaged heart failure without cardiologist', 'Cardioprotective bark extract rich in arjunolic acid and flavonoids, celebrated in Ayurveda for tone and muscular strength of the heart.', 4.8],
      ['Ginger (Shunthi)', 'Ayurveda ingredient', 'Digestive Fire / Deepana', 'Nausea, indigestion, flatulence, morning sickness, motion discomfort', '1-2g dry powder or fresh infusion before meals', 'Active gallstones, bleeding disorders in excessive doses', 'Universal medicine (Vishwabheshaja) igniting Agni (digestive fire), alleviating Vata and Kapha without aggravating Pitta.', 4.9]
    ].forEach(m => db.run(
      'INSERT INTO medicines_catalog (name, category, tag, indication, dosage_instructions, contraindications, description, rating) VALUES (?,?,?,?,?,?,?,?)', m
    ));
  }

  // Workspace Ayurveda Herbs
  const herbCount = (get('SELECT COUNT(*) as c FROM ayurveda_herbs') || {}).c || 0;
  if (herbCount === 0) {
    [
      ['Turmeric', 'Haridra', 'Curcuma longa', 'Balances Kapha & Vata; Tridoshic in moderation', 'Krimighna / Varnya', 'Revered golden rhizome used across classical Ayurveda for skin glow, wound healing, and internal anti-inflammatory support.', 'Wounds, inflammation, skin disorders, respiratory congestion', 'Clinical trials demonstrate curcuminoids inhibit NF-kB transcription factor and COX-2 pathway. Absorption is enhanced 2000% with piperine.', 'Active gallstones, concurrent blood-thinning pharmacotherapy', 'Churna (powder) with warm milk (Golden Milk) or standardized capsule'],
      ['Ashwagandha', 'Ashwagandha', 'Withania somnifera', 'Balances Vata & Kapha; gently cools Pitta', 'Rasayana / Balya', 'Premuim rejuvenating adaptogenic root imparting strength of a stallion, longevity, and deep neural calm.', 'Chronic stress, nervous debility, insomnia, adrenal fatigue, low stamina', 'Randomized controlled trials confirm significant reductions in PSS (Perceived Stress Scale) and morning cortisol levels with improved DHEA-S.', 'Pregnancy, active hyperthyroidism without endocrinologist monitoring', 'Root powder with warm milk & ghee or standardized KSM-66 extract'],
      ['Triphala', 'Triphala', 'Emblica officinalis, Terminalia chebula, Terminalia bellirica', 'Tridoshic (Balances Vata, Pitta, and Kapha)', 'Rasayana / Deepana-Pachana', 'Timeless synergy of three medicinal fruits: Amalaki (cooling), Haritaki (cleansing), and Vibhitaki (clearing mucus).', 'Bowel irregularity, oxidative stress, ocular fatigue, digestive stagnation', 'Studies confirm prebiotic modulation of gut microbiota, gentle colon peristalsis without dependency, and high phenolic antioxidant profile.', 'Acute watery diarrhea, severe dehydration', '3-5 grams powder stirred into warm water, taken 30 minutes before sleep'],
      ['Brahmi', 'Brahmi', 'Bacopa monnieri', 'Balances Pitta & Vata; calms Sadhaka Pitta', 'Medhya Rasayana', 'Premier herbal neuro-enhancer promoting memory retention, clarity of intellect (Dhi), and nervous system equilibrium.', 'Brain fog, cognitive strain, anxiety, study focus, sleep quality', 'Meta-analyses demonstrate improvements in memory free-recall and delayed retention through bacoside modulation of synaptic dendrites.', 'Concomitant thyroid medications or severe bradycardia', 'Ghrita (clarified butter infusion) or powder with honey / warm water'],
      ['Tulsi', 'Surasa / Tulasi', 'Ocimum sanctum', 'Balances Vata & Kapha; increases Pitta slightly', 'Kaphahara / Vishahara', 'Queen of Herbs and adaptogen protecting against physical, chemical, and metabolic stress while clearing Pranavaha srotas.', 'Respiratory congestion, cough, seasonal viral exposure, stress resilience', 'Exhibits broad-spectrum antimicrobial and immunomodulatory activity, upregulating natural killer (NK) cells and T-helper cells.', 'Hypoglycemia sensitivity when combined with antidiabetic pharmaceuticals', 'Fresh leaf tea infusion, juice (Swarasa), or standardized extract drops'],
      ['Giloy', 'Guduchi / Amrita', 'Tinospora cordifolia', 'Tridoshic (balances all three doshas, especially Pitta)', 'Rasayana / Jvarahara', 'Fabled "Nectar of Immortality" renowned as an antipyretic immune modulator that purifies the blood and eliminates cellular Ama.', 'Intermittent fevers, low platelet count, gout (Vatarakta), liver recovery', 'Demonstrated macrophage stimulating activity and hepatoprotective properties against toxic metabolites in multiple clinical publications.', 'Autoimmune disease flares without medical oversight', 'Decoction (Kwatha) or Giloy Satva (water-soluble extract) with honey'],
      ['Arjuna', 'Arjuna', 'Terminalia arjuna', 'Balances Pitta & Kapha; pacifies heart heat', 'Hridya / Rasayana', 'Towering tree whose bark has guarded cardiovascular wellness in Indian medicine for more than 2,500 years.', 'Cardiovascular tone, angina pectoris, palpitations, post-infarction care', 'Enriched with oligomeric proanthocyanidins and arjunetin; trials demonstrate positive inotropic effects and reduction in systolic blood pressure.', 'Severe decompensated cardiac failure without specialist supervision', 'Kshirapaka (bark simmered gently in milk and water) or powder twice daily'],
      ['Ginger', 'Shunthi / Ardraka', 'Zingiber officinale', 'Balances Vata & Kapha; dry form does not provoke Pitta', 'Deepana / Pachana / Triptighna', 'Celebrated as "Universal Medicine" for reigniting digestive fire (Agni), burning toxins (Ama), and easing joint stiffness.', 'Nausea, sluggish digestion, dyspepsia, motion sickness, osteoarthritic aches', 'Gingerols and shogaols exhibit gastroprotective and antiemetic efficacy comparable to metoclopramide in multiple double-blind studies.', 'Active gastric ulcers in high acute doses; caution with warfarin', 'Fresh ginger juice with rock salt before meals or dry powder infusion']
    ].forEach(h => db.run(
      'INSERT INTO ayurveda_herbs (name, sanskrit_name, botanical_name, dosha_balance, category, description, indications, clinical_evidence, contraindications, preparation) VALUES (?,?,?,?,?,?,?,?,?,?)', h
    ));
  }

  // Seed initial sample appointment and reminder if table empty
  const apptCount = (get('SELECT COUNT(*) as c FROM appointments') || {}).c || 0;
  if (apptCount === 0) {
    db.run(`INSERT INTO appointments (user_id, patient_name, patient_phone, doctor_name, consultation_type, appointment_date, appointment_time, notes, status)
      VALUES ('guest', 'Sample Patient', '+91 98000 00000', 'Dr. Shailesh Phalle (MD - Ayurvedic & Panchakarma)', 'Ayurveda consultation', date('now', '+2 days'), '10:30 AM', 'Seasonal wellness checkup & dosha evaluation', 'Confirmed')`);
  }

  const remCount = (get('SELECT COUNT(*) as c FROM medication_reminders') || {}).c || 0;
  if (remCount === 0) {
    db.run(`INSERT INTO medication_reminders (user_id, med_name, dosage, reminder_time, frequency, status)
      VALUES ('guest', 'Ashwagandha KSM-66', '1 capsule with warm water', '09:00', 'Daily', 'Active')`);
    db.run(`INSERT INTO medication_reminders (user_id, med_name, dosage, reminder_time, frequency, status)
      VALUES ('guest', 'Triphala Churna', '1/2 teaspoon before sleep', '21:30', 'Daily', 'Active')`);
  }

  // ── Health Hub Initial Seed Data ──────────────────────────────
  const hlCount = (get('SELECT COUNT(*) as c FROM health_locker_documents') || {}).c || 0;
  if (hlCount === 0) {
    db.run(`INSERT INTO health_locker_documents (user_id, title, category, document_type, file_url, file_size, tags, date_recorded, share_token)
      VALUES ('guest', 'Comprehensive Metabolic Panel & CBC', 'Lab Reports', 'PDF', '/uploads/prescriptions/sample_metabolic_panel.pdf', 342000, 'blood,cbc,liver,kidney', date('now', '-5 days'), 'token_sh_9921')`);
    db.run(`INSERT INTO health_locker_documents (user_id, title, category, document_type, file_url, file_size, tags, date_recorded, share_token)
      VALUES ('guest', 'Ayurvedic Wellness & Rasayana Protocol', 'Prescriptions', 'PDF', '/uploads/prescriptions/sample_ayurveda_protocol.pdf', 215000, 'ayurveda,dosha,panchakarma', date('now', '-2 days'), 'token_sh_4482')`);
    db.run(`INSERT INTO health_locker_documents (user_id, title, category, document_type, file_url, file_size, tags, date_recorded)
      VALUES ('guest', 'Annual Preventive Health Discharge Summary', 'Discharge Summaries', 'PDF', '/uploads/prescriptions/annual_preventive_summary.pdf', 520000, 'hospital,annual,cardiac', date('now', '-30 days'))`);
  }

  const famCount = (get('SELECT COUNT(*) as c FROM family_profiles') || {}).c || 0;
  if (famCount === 0) {
    db.run(`INSERT INTO family_profiles (primary_user_id, full_name, relationship, dob, gender, blood_group, allergies, chronic_conditions, emergency_contact)
      VALUES ('guest', 'Primary Patient (Self)', 'Self', '1995-05-15', 'Male', 'B+', 'None known', 'Mild seasonal rhinitis', '+91 98000 00001')`);
    db.run(`INSERT INTO family_profiles (primary_user_id, full_name, relationship, dob, gender, blood_group, allergies, chronic_conditions, emergency_contact)
      VALUES ('guest', 'Family Member (Mother)', 'Mother', '1968-08-20', 'Female', 'O+', 'Sulfa Antibiotics', 'Hypertension, Osteoarthritis', '+91 98000 00002')`);
    db.run(`INSERT INTO family_profiles (primary_user_id, full_name, relationship, dob, gender, blood_group, allergies, chronic_conditions, emergency_contact)
      VALUES ('guest', 'Family Member (Child)', 'Child', '2020-03-15', 'Male', 'B+', 'Peanuts (Mild)', 'None', '+91 98000 00003')`);
  }

  const interCount = (get('SELECT COUNT(*) as c FROM medicine_interactions') || {}).c || 0;
  if (interCount === 0) {
    const interactions = [
      ['Warfarin', 'Guggulu (Commiphora mukul)', 'Warfarin', 'Guggulsterones', 'SEVERE', 'HERB_DRUG', 'Guggulu possesses antiplatelet properties and inhibits coagulation pathways, dramatically elevating INR and major bleeding risk with Warfarin.', 'CDSCO & AYUSH Pharmacovigilance Advisory 2023', 'Avoid concomitant administration without strict weekly INR monitoring by hematologist / cardiologist.'],
      ['Metformin', 'Karela (Bitter Gourd / Momordica)', 'Metformin', 'Charantin & Polypeptide-p', 'MODERATE', 'HERB_DRUG', 'Concurrent ingestion creates additive hypoglycemic effects, potentially inducing symptomatic hypoglycemia (blood glucose < 70 mg/dL).', 'ICMR Diabetology Bulletin 2022', 'Space doses by at least 2 hours; regularly monitor fasting and postprandial glucose levels.'],
      ['Paracetamol (Crocin)', 'Dolo-650 (Paracetamol)', 'Paracetamol', 'Paracetamol', 'SEVERE', 'DRUG_DRUG', 'DUPLICATE ACTIVE INGREDIENT: Concomitant ingestion of Crocin and Dolo leads to accidental paracetamol overdose exceeding safe maximum 4000mg/day, risking acute hepatotoxicity.', 'Central Drugs Standard Control Organisation (CDSCO)', 'DO NOT TAKE SIMULTANEOUSLY. Choose only one medication as advised by clinician.'],
      ['Ashwagandha', 'Levothyroxine (Thyronorm)', 'Withania somnifera', 'Levothyroxine', 'MODERATE', 'HERB_DRUG', 'Ashwagandha naturally stimulates thyroid hormone secretion (T3 and T4), which may precipitate subclinical hyperthyroidism when taken with levothyroxine.', 'Thyroid Research & Practice Journal 2021', 'Advise quarterly TSH / Free T4 lab monitoring and dose recalibration with endocrinologist.'],
      ['Aspirin', 'Ibuprofen (Brufen)', 'Acetylsalicylic acid', 'Ibuprofen', 'SEVERE', 'DRUG_DRUG', 'Ibuprofen competitively interferes with the irreversible antiplatelet effect of low-dose aspirin and markedly increases gastric ulceration and GI bleeding.', 'WHO Essential Medicines Safety Guide', 'Take immediate-release aspirin at least 30 minutes before ibuprofen, or consider non-NSAID alternatives.']
    ];
    interactions.forEach(i => {
      db.run(`INSERT INTO medicine_interactions (medicine_a, medicine_b, active_ingredient_a, active_ingredient_b, severity, interaction_type, description, clinical_evidence, management_recommendation)
        VALUES (?,?,?,?,?,?,?,?,?)`, i);
    });
  }

  const labCatCount = (get('SELECT COUNT(*) as c FROM lab_tests_catalog') || {}).c || 0;
  if (labCatCount === 0) {
    const labTests = [
      ['CBC01', 'Complete Blood Count (CBC) with ESR', 'Hematology', 'No Fasting Required', 12, 'Whole Blood EDTA', 350, 1, 'Detailed assessment of RBC, Hemoglobin, WBC differential count, Platelets, and inflammatory ESR.'],
      ['LIP02', 'Comprehensive Lipid Profile (Cholesterol & Triglycerides)', 'Biochemistry', '10-12 Hours Fasting Required', 24, 'Serum', 599, 1, 'Evaluates Total Cholesterol, HDL Good Cholesterol, LDL Bad Cholesterol, VLDL, and Triglycerides for cardiovascular risk.'],
      ['HBA03', 'HbA1c Glycated Hemoglobin (3-Month Average Glucose)', 'Diabetes Care', 'No Fasting Required', 12, 'Whole Blood', 450, 1, 'Gold-standard diagnostic metric for monitoring 90-day glycemic control without day-to-day glucose fluctuations.'],
      ['THY04', 'Thyroid Profile Total (T3, T4, Ultrasensitive TSH)', 'Endocrinology', 'Overnight Fasting Preferred', 24, 'Serum', 499, 1, 'Comprehensive thyroid gland functional evaluation detecting hypothyroidism, hyperthyroidism, and Hashimoto auto-immune states.'],
      ['VIT05', 'Vitamin D3 (25-Hydroxy) & Vitamin B12 Duo', 'Vitamins & Minerals', 'No Fasting Required', 24, 'Serum', 1199, 1, 'Essential micronutrient screen checking bone density cofactor (Vitamin D3) and neurological & RBC health (Vitamin B12).'],
      ['LFT06', 'Liver Function Test (LFT) with Enzymes & Bilirubin', 'Hepatology', '8 Hours Fasting Required', 18, 'Serum', 650, 1, 'Measures SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Bilirubin Total/Direct, and Albumin/Globulin ratio.'],
      ['VED07', 'Ayurvedic Prakriti & Dhatu Dosha Metabolic Profile', 'Integrative Health', 'Morning Empty Stomach', 24, 'Serum & Clinical Biomarkers', 899, 1, 'Integrative metabolic assessment correlating classical Ayurvedic Agni/Dhatu states with modern blood parameters.']
    ];
    labTests.forEach(t => {
      db.run(`INSERT INTO lab_tests_catalog (test_code, test_name, category, fasting_required, turnaround_hours, sample_type, price_inr, nabl_certified, description)
        VALUES (?,?,?,?,?,?,?,?,?)`, t);
    });
  }

  const pharmCount = (get('SELECT COUNT(*) as c FROM pharmacy_partner_inventory') || {}).c || 0;
  if (pharmCount === 0) {
    const pharmItems = [
      ['PHARM_PUNE_01', 'MedInVedic Central Pharmacy', '412115', 'Pune', 'Paracetamol 650mg (Dolo)', 'Paracetamol 650mg', 'Tablet / Strip of 15', 'BATCH-D24-88', '2027-08-31', 140, 32, 1],
      ['PHARM_PUNE_01', 'MedInVedic Central Pharmacy', '412115', 'Pune', 'Ashwagandha KSM-66 Organic Extract', 'Withania somnifera 500mg', 'Bottle of 60 Veg Capsules', 'BATCH-ASH-102', '2027-12-31', 75, 480, 1],
      ['PHARM_PUNE_01', 'MedInVedic Central Pharmacy', '412115', 'Pune', 'Triphala Churna Pure Herb', 'Haritaki, Bibhitaki, Amalaki', 'Jar of 200g Powder', 'BATCH-TRP-044', '2028-02-28', 90, 160, 1],
      ['PHARM_PUNE_02', 'Apollo Pharmacy Camp', '412115', 'Pune', 'Amlodipine 5mg (Amlong)', 'Amlodipine Besylate 5mg', 'Strip of 10 Tablets', 'BATCH-AML-512', '2026-11-30', 200, 45, 1],
      ['PHARM_PUNE_02', 'Apollo Pharmacy Camp', '412115', 'Pune', 'Metformin 500mg SR (Glycomet)', 'Metformin Hydrochloride 500mg', 'Strip of 10 Tablets', 'BATCH-MET-809', '2027-05-31', 180, 28, 1],
      ['PHARM_BLR_01', 'MedPlus Indiranagar', '560001', 'Bengaluru', 'Dolo 650mg', 'Paracetamol 650mg', 'Strip of 15 Tablets', 'BATCH-D24-91', '2027-09-30', 210, 32, 1],
      ['PHARM_DEL_01', 'Fortis Health Pharmacy', '110001', 'Delhi', 'Karela Jamun Juice Organic', 'Momordica charantia, Syzygium cumini', '500ml Bottle', 'BATCH-KJ-303', '2026-10-31', 45, 220, 1]
    ];
    pharmItems.forEach(p => {
      db.run(`INSERT INTO pharmacy_partner_inventory (pharmacy_id, pharmacy_name, pin_code, city, medicine_name, active_ingredients, dosage_form, batch_number, expiry_date, stock_quantity, price_inr, is_verified)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, p);
    });
  }

  const expCount = (get('SELECT COUNT(*) as c FROM healthcare_expenses') || {}).c || 0;
  if (expCount === 0) {
    db.run(`INSERT INTO healthcare_expenses (user_id, category, description, amount_inr, expense_date, payment_mode, tax_eligible)
      VALUES ('guest', 'Doctor Consult', 'Dr. Shailesh Phalle — Ayurveda & Holistic Consult', 600, date('now', '-10 days'), 'UPI', 'Section 80D Eligible')`);
    db.run(`INSERT INTO healthcare_expenses (user_id, category, description, amount_inr, expense_date, payment_mode, tax_eligible)
      VALUES ('guest', 'Lab Diagnostics', 'Comprehensive Metabolic Panel & Lipid Profile — Metropolis', 949, date('now', '-5 days'), 'Razorpay', 'Section 80D Eligible')`);
    db.run(`INSERT INTO healthcare_expenses (user_id, category, description, amount_inr, expense_date, payment_mode, tax_eligible)
      VALUES ('guest', 'Medicines & Herbs', 'Monthly Prescription: Ashwagandha KSM-66 & Triphala', 640, date('now', '-2 days'), 'Wallet', 'Applicable OTC')`);
  }

  const prevCount = (get('SELECT COUNT(*) as c FROM preventive_screenings') || {}).c || 0;
  if (prevCount === 0) {
    db.run(`INSERT INTO preventive_screenings (user_id, screen_name, target_age_min, target_age_max, frequency_months, last_completed_date, next_due_date, status, guidance_notes)
      VALUES ('guest', 'Blood Pressure & Cardiovascular Triage', 18, 99, 6, date('now', '-4 months'), date('now', '+2 months'), 'Upcoming', 'Target < 120/80 mmHg; checks systolic and diastolic vascular pressure.')`);
    db.run(`INSERT INTO preventive_screenings (user_id, screen_name, target_age_min, target_age_max, frequency_months, last_completed_date, next_due_date, status, guidance_notes)
      VALUES ('guest', 'Fasting Blood Glucose & HbA1c Diabetes Screen', 25, 99, 12, date('now', '-11 months'), date('now', '+1 month'), 'Due', 'Screening for prediabetes and insulin resistance. Recommended annually by ICMR.')`);
    db.run(`INSERT INTO preventive_screenings (user_id, screen_name, target_age_min, target_age_max, frequency_months, last_completed_date, next_due_date, status, guidance_notes)
      VALUES ('guest', 'Comprehensive Lipid Profile Screen', 20, 99, 24, date('now', '-5 months'), date('now', '+19 months'), 'Completed', 'Assesses atherogenic cardiovascular risk, HDL protective ratio, and triglycerides.')`);
    db.run(`INSERT INTO preventive_screenings (user_id, screen_name, target_age_min, target_age_max, frequency_months, last_completed_date, next_due_date, status, guidance_notes)
      VALUES ('guest', 'Annual Dental Examination & Tartar Debridement', 5, 99, 12, date('now', '-14 months'), date('now', '-2 months'), 'Overdue', 'Oral mucosa screening, gingival check, and dental hygiene evaluation.')`);
  }

  const notifCount = (get('SELECT COUNT(*) as c FROM smart_health_notifications') || {}).c || 0;
  if (notifCount === 0) {
    db.run(`INSERT INTO smart_health_notifications (user_id, notification_type, title, message, scheduled_time, status)
      VALUES ('guest', 'Medication Dose', 'Morning Dose: Ashwagandha KSM-66', 'Take 1 capsule with warm water after breakfast.', '08:30 AM', 'Active')`);
    db.run(`INSERT INTO smart_health_notifications (user_id, notification_type, title, message, scheduled_time, status)
      VALUES ('guest', 'Preventive Screen', 'Due Soon: Annual Fasting Blood Glucose', 'Your annual HbA1c screening is due next month under preventive care guidelines.', '10:00 AM', 'Active')`);
  }

  const emCardCount = (get('SELECT COUNT(*) as c FROM emergency_cards') || {}).c || 0;
  if (emCardCount === 0) {
    db.run(`INSERT INTO emergency_cards (user_id, full_name, age, blood_group, critical_allergies, chronic_conditions, current_medications, emergency_contacts_json, access_token)
      VALUES ('guest', 'Emergency Patient Profile', 32, 'B+ Positive', 'Sulfa Antibiotics, Penicillin', 'Mild Seasonal Allergy, Controlled Hypertension', 'Amlodipine 5mg, Ashwagandha KSM-66', '[{"name":"Primary Guardian (+91 98000 00000)","relation":"Guardian"},{"name":"Emergency SOS (112 / 108)","relation":"Ambulance"}]', 'em_token_8899a1')`);
  }

  const timeCount = (get('SELECT COUNT(*) as c FROM health_timeline_events') || {}).c || 0;
  if (timeCount === 0) {
    db.run(`INSERT INTO health_timeline_events (user_id, event_type, title, summary, metrics_json, source_provenance, event_date)
      VALUES ('guest', 'Consultation', 'Consultation with Dr. Shailesh Phalle', 'Reviewed seasonal dosha balance (Vata-Pitta) and prescribed adaptogenic herbs.', '{"doctor":"Dr. Shailesh Phalle","type":"Ayurveda"}', 'Verified Doctor Note', date('now', '-10 days'))`);
    db.run(`INSERT INTO health_timeline_events (user_id, event_type, title, summary, metrics_json, source_provenance, event_date)
      VALUES ('guest', 'Lab Report', 'Metabolic & Lipid Panel Completed', 'Total Cholesterol: 182 mg/dL (Normal), Fasting Glucose: 92 mg/dL (Normal).', '{"total_cholesterol":182,"glucose":92}', 'NABL Accredited Lab', date('now', '-5 days'))`);
    db.run(`INSERT INTO health_timeline_events (user_id, event_type, title, summary, metrics_json, source_provenance, event_date)
      VALUES ('guest', 'Vital Reading', 'Blood Pressure & Heart Rate Logged', 'Blood Pressure: 118/76 mmHg (Optimal), Resting Heart Rate: 72 bpm.', '{"bp_systolic":118,"bp_diastolic":76,"pulse":72}', 'Self-Reported', date('now', '-1 day'))`);
  }
}

module.exports = { initDB, run, get, all, insert, save, cleanupExpiredActivity };
