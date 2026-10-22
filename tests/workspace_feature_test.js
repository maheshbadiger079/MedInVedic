/**
 * tests/workspace_feature_test.js
 * ═══════════════════════════════════════════════════════════════════
 * Direct In-Process Test Suite for Patient Health Workspace
 * - Runs directly inside sandbox without TCP socket dependency
 * - Tests Express route handlers and SQLite database persistence
 * - Tests Stats, Medicines Catalog, Doctors Directory
 * - Tests Appointments Booking, Listing, and Deletion
 * - Tests Medication Reminders Add, Toggle, and Deletion
 * - Tests Ayurveda Monographs Querying & Filtering
 * - Tests AI Health Assistant with Emergency Triage & Grounded Clinical Responses
 * - Tests Prescription Vault Querying
 * ═══════════════════════════════════════════════════════════════════
 */

const express = require('../server/node_modules/express');
const { EventEmitter } = require('events');
const db      = require('../server/database');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/workspace', require('../server/routes/workspace'));

function invoke(method, fullUrl, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL('http://localhost' + fullUrl);
    const req = new EventEmitter();
    req.method = method;
    req.url = urlObj.pathname + urlObj.search;
    req.originalUrl = req.url;
    req.headers = { 'content-type': 'application/json' };
    req.query = Object.fromEntries(urlObj.searchParams);
    req.body = body || {};
    req.params = {};
    req.connection = { remoteAddress: '127.0.0.1' };

    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res._headers[k.toLowerCase()];
    res.status = function(code) { res.statusCode = code; return res; };
    res.json = function(data) {
      resolve({ status: res.statusCode, body: data });
    };
    res.send = function(data) {
      resolve({ status: res.statusCode, body: data });
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
      else resolve({ status: 404, body: { error: 'Route not found' } });
    });
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MedInVedic Patient Health Workspace In-Process Test Suite');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0, failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 0. Initialize Database
    await db.initDB();

    // 1. Stats endpoint
    console.log('Test 1: Workspace Stats endpoint...');
    const statsRes = await invoke('GET', '/api/workspace/stats');
    assert(statsRes.status === 200, 'GET /api/workspace/stats returned HTTP 200');
    assert(statsRes.body.success === true, 'Response marked success');
    assert(typeof statsRes.body.stats.appointments === 'number', 'Stats contains appointment count');
    assert(typeof statsRes.body.stats.reminders === 'number', 'Stats contains reminder count');
    assert(statsRes.body.stats.medicines > 0, 'Stats indicates medicines in catalog');
    assert(statsRes.body.stats.herbs > 0, 'Stats indicates herbs in Ayurveda knowledge base');

    // 2. Medicine search
    console.log('\nTest 2: Dual Medicine Catalog Search...');
    const medSearchRes = await invoke('GET', '/api/workspace/medicines?q=paracetamol');
    assert(medSearchRes.status === 200, 'GET /api/workspace/medicines returned HTTP 200');
    assert(medSearchRes.body.medicines.length > 0, 'Found Paracetamol in catalog');
    assert(medSearchRes.body.medicines[0].category === 'Modern medicine', 'Paracetamol classified as Modern medicine');

    const ayurMedRes = await invoke('GET', '/api/workspace/medicines?category=Ayurveda');
    assert(ayurMedRes.body.medicines.some(m => m.name.includes('Ashwagandha') || m.name.includes('Turmeric')), 'Found Ayurveda medicines in catalog');

    // 3. Doctors directory
    console.log('\nTest 3: Doctors Directory for Consultations...');
    const docRes = await invoke('GET', '/api/workspace/doctors');
    assert(docRes.status === 200, 'GET /api/workspace/doctors returned HTTP 200');
    assert(docRes.body.doctors.length > 0, 'Doctors directory populated');
    const docName = docRes.body.doctors[0].name;

    // 4. Appointments Lifecycle (Book, List, Cancel)
    console.log('\nTest 4: Appointments Booking & Cancellation Lifecycle...');
    const bookRes = await invoke('POST', '/api/workspace/appointments', {
      doctor_name: docName,
      consultation_type: 'Ayurveda consultation',
      appointment_date: '2026-11-20',
      appointment_time: '11:00 AM',
      notes: 'Test wellness consultation',
      patient_name: 'Test Patient',
      patient_phone: '+91 99999 88888'
    });
    assert(bookRes.status === 200, 'POST /api/workspace/appointments created appointment');
    assert(bookRes.body.appointment && bookRes.body.appointment.id, 'Created appointment received ID');
    const createdApptId = bookRes.body.appointment.id;

    const listApptRes = await invoke('GET', '/api/workspace/appointments');
    assert(listApptRes.body.appointments.some(a => a.id === createdApptId), 'New appointment appears in live list');

    const cancelApptRes = await invoke('DELETE', `/api/workspace/appointments/${createdApptId}`);
    assert(cancelApptRes.status === 200 && cancelApptRes.body.success, 'DELETE /api/workspace/appointments/:id cancelled appointment');

    // 5. Medication Reminders Lifecycle (Add, Toggle, Delete)
    console.log('\nTest 5: Medication Reminders Lifecycle & State Toggling...');
    const addRemRes = await invoke('POST', '/api/workspace/reminders', {
      med_name: 'Triphala Churna 5g',
      dosage: '1 teaspoon with warm water',
      reminder_time: '21:00',
      frequency: 'Daily'
    });
    assert(addRemRes.status === 200, 'POST /api/workspace/reminders created reminder');
    const createdRemId = addRemRes.body.reminder.id;

    const toggleRes = await invoke('PATCH', `/api/workspace/reminders/${createdRemId}/toggle`);
    assert(toggleRes.status === 200 && toggleRes.body.status === 'Completed', 'Reminder toggled to Completed');

    const delRemRes = await invoke('DELETE', `/api/workspace/reminders/${createdRemId}`);
    assert(delRemRes.status === 200 && delRemRes.body.success, 'DELETE /api/workspace/reminders/:id deleted reminder');

    // 6. Ayurveda Herbs Monograph Explorer
    console.log('\nTest 6: Ayurveda Botanical & Clinical Monograph Explorer...');
    const ayurRes = await invoke('GET', '/api/workspace/ayurveda?q=Ashwagandha');
    assert(ayurRes.status === 200, 'GET /api/workspace/ayurveda returned HTTP 200');
    assert(ayurRes.body.herbs.length > 0, 'Found Ashwagandha monograph');
    const herb = ayurRes.body.herbs[0];
    assert(herb.botanical_name === 'Withania somnifera', 'Herb botanical name correctly documented');
    assert(herb.dosha_balance.includes('Vata'), 'Herb dosha profile documented');

    // 7. AI Health Assistant - Emergency Triage
    console.log('\nTest 7: AI Health Assistant — Emergency Triage Guardrail...');
    const emergencyChatRes = await invoke('POST', '/api/workspace/ai-chat', {
      message: 'I have severe crushing chest pain and shortness of breath'
    });
    assert(emergencyChatRes.status === 200, 'POST /api/workspace/ai-chat returned HTTP 200');
    assert(emergencyChatRes.body.emergency === true, 'Detected acute emergency condition');
    assert(emergencyChatRes.body.reply.includes('112'), 'Emergency response cites 112 helpline protocol');

    // 8. AI Health Assistant - Grounded Dual-Healthcare Response
    console.log('\nTest 8: AI Health Assistant — Grounded Knowledge Response...');
    const healthChatRes = await invoke('POST', '/api/workspace/ai-chat', {
      message: 'Can I take Turmeric for inflammation?'
    });
    assert(healthChatRes.status === 200, 'POST /api/workspace/ai-chat returned HTTP 200');
    assert(healthChatRes.body.emergency === false, 'Non-emergency query processed normally');
    assert(healthChatRes.body.reply.toLowerCase().includes('turmeric') || healthChatRes.body.reply.toLowerCase().includes('curcumin'), 'AI answered with herb specifics');
    assert(healthChatRes.body.sources && healthChatRes.body.sources.length > 0, 'Response includes verified clinical citations');

    // 9. Prescriptions Vault Query
    console.log('\nTest 9: Prescriptions Vault API Query...');
    const rxListRes = await invoke('GET', '/api/workspace/prescriptions');
    assert(rxListRes.status === 200, 'GET /api/workspace/prescriptions returned HTTP 200');
    assert(Array.isArray(rxListRes.body.prescriptions), 'Returns array of prescriptions');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
