/**
 * MedInVedic Landing Page, Auth Guard & Visitor Analytics Test Suite
 * Run with: node tests/landing_auth_analytics_test.js
 */

const assert = require('assert');

// Mock browser environment globals for Node.js test environment
global.window = global;
global.localStorage = (function() {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: key => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.navigator = { userAgent: 'Chrome/120.0 TestRunner' };
global.location = { pathname: '/landing.html' };
global.document = {
  title: 'MedInVedic Landing Test',
  addEventListener: () => {},
  querySelector: () => null,
  getElementById: () => null
 };

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Landing Page, Auth Guard & Visitor Analytics — Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

// 1. Load Modules
const AnalyticsEngine = require('../public/js/analytics.js');
const AuthGuard = require('../public/js/auth-guard.js');
const PHARMACY_RAG = require('../public/js/pharmacy-rag-engine.js');

// Benchmark 1: Analytics Session ID Generation
console.log('  Testing 1. Analytics Visitor Session ID Generation...');
const session1 = AnalyticsEngine.getVisitorSessionId();
assert.ok(session1 && session1.startsWith('v_'), 'Session ID should be generated with v_ prefix');
const session2 = AnalyticsEngine.getVisitorSessionId();
assert.strictEqual(session1, session2, 'Session ID should persist across calls');
console.log('  ✅ PASS: Session ID persistence verified\n');

// Benchmark 2: Event Logging & Analytics Aggregation
console.log('  Testing 2. Analytics Event Tracking & Metrics Aggregation...');
AnalyticsEngine.trackEvent(AnalyticsEngine.EVENTS.LANDING_VIEW, { title: 'MedInVedic Landing' });
AnalyticsEngine.trackEvent(AnalyticsEngine.EVENTS.DEMO_START, { time: 0 });
AnalyticsEngine.trackEvent(AnalyticsEngine.EVENTS.DEMO_COMPLETE, { duration: 45 });
AnalyticsEngine.trackEvent(AnalyticsEngine.EVENTS.SEARCH_PERFORMED, { query: 'Paracetamol' });

const summary = AnalyticsEngine.getAnalyticsSummary();
assert.ok(summary.totalVisitors >= 4, 'Event count should be at least 4');
assert.strictEqual(summary.demoStarts, 1, 'Demo starts count should be 1');
assert.strictEqual(summary.demoCompletes, 1, 'Demo completes count should be 1');
assert.strictEqual(summary.demoCompletionRate, 100, 'Demo completion rate should be 100%');
console.log('  ✅ PASS: Analytics tracking and admin aggregation verified\n');

// Benchmark 3: Auth Guard Role Enforcement
console.log('  Testing 3. Auth Guard User & Admin Role Enforcement...');
assert.strictEqual(AuthGuard.isAuthenticated(), false, 'Unauthenticated by default');
assert.strictEqual(AuthGuard.getUserRole(), 'VISITOR', 'Default role should be VISITOR');
assert.strictEqual(AuthGuard.isAdmin(), false, 'Visitor should not have admin rights');

// Simulate Login as Regular User
AuthGuard.setAuthUser({ uid: 'u123', email: 'patient@medinvedic.ai', role: 'USER' });
assert.strictEqual(AuthGuard.isAuthenticated(), true, 'User should be authenticated');
assert.strictEqual(AuthGuard.getUserRole(), 'USER', 'Role should be USER');
assert.strictEqual(AuthGuard.isAdmin(), false, 'Regular USER should not be admin');

// Simulate Login as Admin
AuthGuard.setAuthUser({ uid: 'a999', email: 'admin@medinvedic.ai', role: 'ADMIN' });
assert.strictEqual(AuthGuard.isAdmin(), true, 'ADMIN role should be recognized');
console.log('  ✅ PASS: Auth Guard roles (VISITOR, USER, ADMIN) verified\n');

// Benchmark 4: RAG Grounded Answer & Citation Check
console.log('  Testing 4. RAG Grounded Medicine Inquiry & Citation Check...');
const ragAns = PHARMACY_RAG.askMedicineRAG('Paracetamol 500mg indications and dosage');
assert.strictEqual(ragAns.type, 'RAG_MEDICINE_EXPLANATION', 'Answer must be grounded in verified sources');
assert.ok(ragAns.sources.length >= 1, 'Response must contain official citations');
assert.strictEqual(ragAns.notDiagnosis, true, 'Response must maintain non-diagnostic medical boundary');
console.log('  ✅ PASS: RAG grounded citation verification passed\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Test Results: 4 passed, 0 failed (4 total)');
console.log('  🎉 LANDING, AUTH GUARD & ANALYTICS SUITE PASSED!');
console.log('═══════════════════════════════════════════════════════════════\n');
