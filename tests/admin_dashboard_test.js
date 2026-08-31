/**
 * MedInVedic — Admin Dashboard & Control Center Automated Test Suite
 */
const path = require('path');
const db = require('../server/database');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MedInVedic Admin Dashboard & RAG/LLM Backend Test Suite');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 1: Initialize DB and verify super admins exist
  console.log('Testing 1. Database Initialization & Super Admin Seeding...');
  await db.initDB();
  
  const superAdmin = db.get("SELECT * FROM users WHERE email='admin@medinvedic.com'");
  assert(superAdmin && superAdmin.role === 'super_admin', 'Default super admin admin@medinvedic.com exists with super_admin role');

  const ownerAdmin = db.get("SELECT * FROM users WHERE email='maheshbadiger079@gmail.com'");
  assert(ownerAdmin && ownerAdmin.role === 'super_admin', 'Owner super admin maheshbadiger079@gmail.com exists with super_admin role');

  // Test 2: Verify RAG documents seeded
  console.log('\nTesting 2. RAG Knowledge Base Documents Seeding...');
  const ragDocs = db.all("SELECT * FROM rag_documents");
  assert(ragDocs && ragDocs.length >= 5, `RAG documents seeded (found ${ragDocs ? ragDocs.length : 0} verified documents)`);
  const whoDoc = db.get("SELECT * FROM rag_documents WHERE doc_id='fever_who_001'");
  assert(whoDoc && whoDoc.tier === 1 && whoDoc.evidence_level === 'Strong', 'WHO Tier 1 document correctly indexed');

  // Test 3: Verify LLM Configuration table
  console.log('\nTesting 3. LLM Control Center Configuration...');
  const llmConfig = db.get("SELECT * FROM llm_config LIMIT 1");
  assert(llmConfig && llmConfig.provider === 'Google Gemini' && llmConfig.routing_mode === 'hybrid_rag', 'LLM config initialized with Gemini Hybrid RAG');

  // Test 4: Verify Prompt Templates
  console.log('\nTesting 4. Prompt Template Library...');
  const prompts = db.all("SELECT * FROM prompt_templates");
  assert(prompts && prompts.length >= 4, `Prompt templates loaded (found ${prompts ? prompts.length : 0} templates)`);
  const sysPrompt = db.get("SELECT * FROM prompt_templates WHERE prompt_key='system_medical_rag'");
  assert(sysPrompt && sysPrompt.content.includes('MedInVedic AI'), 'System prompt for RAG medical assistant verified');

  // Test 5: Audit Log Recording & Integrity
  console.log('\nTesting 5. Immutable Audit Log Trail...');
  db.run(
    "INSERT INTO audit_logs (admin_id, admin_name, action, target_type, target_id, details, ip, status) VALUES (?,?,?,?,?,?,?,?)",
    ['1', 'Super Administrator', 'VERIFY_DOCTOR', 'doctor', '1', 'Approved credentials for Dr. Phalle', '127.0.0.1', 'SUCCESS']
  );
  const auditEntry = db.get("SELECT * FROM audit_logs WHERE action='VERIFY_DOCTOR'");
  assert(auditEntry && auditEntry.status === 'SUCCESS', 'Audit log entry recorded successfully');

  // Test 6: Security Center Event Logging
  console.log('\nTesting 6. Security Event Logging...');
  db.run(
    "INSERT INTO security_events (event_type, severity, ip, user_agent, details) VALUES (?,?,?,?,?)",
    ['RBAC_AUTH_CHECK', 'INFO', '127.0.0.1', 'Node/TestAgent', 'Super Admin session authorized']
  );
  const secEvent = db.get("SELECT * FROM security_events WHERE event_type='RBAC_AUTH_CHECK'");
  assert(secEvent && secEvent.severity === 'INFO', 'Security event recorded');

  // Test 7: AuthGuard Role & Email Whitelist Enforcement
  console.log('\nTesting 7. AuthGuard Role & Whitelist Security...');
  const AuthGuard = require('../public/js/auth-guard');
  assert(AuthGuard.isAdminEmail('admin@medinvedic.com'), 'admin@medinvedic.com recognized as admin');
  assert(AuthGuard.isAdminEmail('maheshbadiger079@gmail.com'), 'maheshbadiger079@gmail.com recognized as admin');
  assert(!AuthGuard.isAdminEmail('user@gmail.com'), 'Regular user email NOT recognized as admin');
  assert(!AuthGuard.isAdminEmail('hacker@attack.com'), 'Unauthorized email NOT recognized as admin');

  // Test 8: Frontend API Client & RAG Retrieval Engine
  console.log('\nTesting 8. Frontend API Client & Hybrid RAG Engine...');
  const API = require('../public/js/api');
  assert(typeof API.admin.getDashboard === 'function', 'API.admin.getDashboard exists');
  const ragSearch = await API.admin.testRagSearch('fever paracetamol');
  assert(ragSearch && ragSearch.results && ragSearch.results.length > 0, 'RAG search returns grounded monographs for fever query');
  assert(ragSearch.results[0].tier === 1, 'Top result for fever query is Tier 1 WHO guideline');

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Test Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  if (failed === 0) {
    console.log('  🎉 ALL ADMIN DASHBOARD & RAG/LLM TESTS PASSED!');
  } else {
    console.error('  ⚠️ SOME TESTS FAILED');
    process.exit(1);
  }
  console.log('═══════════════════════════════════════════════════════════════\n');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

