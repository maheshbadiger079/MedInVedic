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
global.location = { 
  pathname: '/landing.html',
  href: '',
  replace: function(url) { this.href = url; }
};
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
const EmailValidator = require('../public/js/email-validator.js');

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

// Benchmark 3: Auth Guard Role Enforcement & Email Verification Gate
console.log('  Testing 3. Auth Guard User & Admin Role Enforcement...');
assert.strictEqual(AuthGuard.isAuthenticated(), false, 'Unauthenticated by default');
assert.strictEqual(AuthGuard.getUserRole(), 'VISITOR', 'Default role should be VISITOR');
assert.strictEqual(AuthGuard.isAdmin(), false, 'Visitor should not have admin rights');

// Simulate Login as Regular User with verified email
AuthGuard.setAuthUser({ uid: 'u123', email: 'patient@medinvedic.ai', role: 'USER', emailVerified: true });
assert.strictEqual(AuthGuard.isAuthenticated(), true, 'User should be authenticated');
assert.strictEqual(AuthGuard.getUserRole(), 'USER', 'Role should be USER');
assert.strictEqual(AuthGuard.isAdmin(), false, 'Regular USER should not be admin');
assert.strictEqual(AuthGuard.isEmailVerified(), true, 'Verified user should pass check');

// Simulate unverified user attempting Home page access
AuthGuard.setAuthUser({ uid: 'u_unverified', email: 'unverified@gmail.com', role: 'USER', emailVerified: false });
global.location.pathname = '/index.html';
const unverifiedAllowed = AuthGuard.checkRouteAccess();
assert.strictEqual(unverifiedAllowed, false, 'Unverified users must be blocked from Home page');
assert.ok(global.location.href.includes('login.html'), 'Unverified users must be redirected to login.html');
assert.ok(global.location.href.includes('reason=email_unverified'), 'Redirect must specify email_unverified reason');

// Simulate unauthorized attempt with admin claim in payload
AuthGuard.setAuthUser({ uid: 'fake_adm', email: 'other@medinvedic.com', role: 'ADMIN', emailVerified: true });
assert.strictEqual(AuthGuard.isAdmin(), false, 'Other emails must NOT get admin privileges');

// Simulate Login as Verified Admin
AuthGuard.setAuthUser({ uid: 'a999', email: 'maheshbadiger079@gmail.com' });
assert.strictEqual(AuthGuard.isAdmin(), true, 'maheshbadiger079@gmail.com must be recognized as admin');

// Simulate unauthenticated attempt to visit Home page (index.html)
AuthGuard.clearAuthSession();
global.location.pathname = '/index.html';
const homeAccessAllowed = AuthGuard.checkRouteAccess();
assert.strictEqual(homeAccessAllowed, false, 'Unauthenticated users must NOT be able to access Home page');
assert.ok(global.location.href.includes('login.html'), 'Unauthenticated user must be redirected to login page');
console.log('  ✅ PASS: Auth Guard roles & Email Verification Gate verified\n');

// Benchmark 4: Disposable & Fake Email Blocker Engine
console.log('  Testing 4. Disposable & Fake Email Validation Engine...');
const disposable1 = EmailValidator.validateEmail('fakeuser@mailinator.com');
assert.strictEqual(disposable1.valid, false, 'mailinator.com must be blocked');
assert.ok(disposable1.error.includes('Disposable'), 'Error message must specify disposable block');

const disposable2 = EmailValidator.validateEmail('spam@10minutemail.com');
assert.strictEqual(disposable2.valid, false, '10minutemail.com must be blocked');

const disposable3 = EmailValidator.validateEmail('user@trashmail.com');
assert.strictEqual(disposable3.valid, false, 'trashmail.com must be blocked');

const invalidSyntax = EmailValidator.validateEmail('invalid-email-address');
assert.strictEqual(invalidSyntax.valid, false, 'Malformed email must be blocked');

const validEmail1 = EmailValidator.validateEmail('maheshbadiger079@gmail.com');
assert.strictEqual(validEmail1.valid, true, 'Legitimate Gmail address must pass');

const validEmail2 = EmailValidator.validateEmail('doctor.sharma@hospital.org.in');
assert.strictEqual(validEmail2.valid, true, 'Legitimate institutional email must pass');
console.log('  ✅ PASS: Disposable, fake & invalid emails successfully blocked\n');

// Benchmark 5: RAG Grounded Answer & Citation Check
console.log('  Testing 5. RAG Grounded Medicine Inquiry & Citation Check...');
const ragAns = PHARMACY_RAG.askMedicineRAG('Paracetamol 500mg indications and dosage');
assert.strictEqual(ragAns.type, 'RAG_MEDICINE_EXPLANATION', 'Answer must be grounded in verified sources');
assert.ok(ragAns.sources.length >= 1, 'Response must contain official citations');
assert.strictEqual(ragAns.notDiagnosis, true, 'Response must maintain non-diagnostic medical boundary');
console.log('  ✅ PASS: RAG grounded citation verification passed\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Test Results: 5 passed, 0 failed (5 total)');
console.log('  🎉 LANDING, AUTH GUARD, EMAIL VALIDATOR & ANALYTICS SUITE PASSED!');
console.log('═══════════════════════════════════════════════════════════════\n');
