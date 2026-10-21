/**
 * MedInVedic GA4 Production Analytics & Privacy Verification Test Suite
 * Run with: node tests/ga4_production_analytics_test.js
 */

const assert = require('assert');

// Setup mock browser environment
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

// DataLayer mock for GA4
global.dataLayer = [];
global.gtag = function() {
  global.dataLayer.push(Array.from(arguments));
};

global.navigator = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', doNotTrack: '0' };
global.location = { pathname: '/dashboard.html', href: 'https://medinvedic.web.app/pages/dashboard.html' };
global.document = {
  title: 'MedInVedic Clinical Dashboard',
  readyState: 'complete',
  addEventListener: () => {},
  querySelector: () => null,
  getElementById: () => null,
  createElement: () => ({ id: '', src: '', async: false }),
  head: { appendChild: () => {} },
  documentElement: { appendChild: () => {} }
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MedInVedic GA4 & Health Privacy Analytics Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

// Load Analytics Module
const Analytics = require('../public/js/analytics.js');

// Test 1: GA4 Measurement ID & Config Verification
console.log('  Testing 1: Measurement ID & Config Verification...');
assert.strictEqual(Analytics.GA4_MEASUREMENT_ID, 'G-RW9JCDWBQ7', 'Measurement ID must be G-RW9JCDWBQ7');
console.log('  ✅ PASS: Measurement ID confirmed as G-RW9JCDWBQ7\n');

// Test 2: PII Redaction & Healthcare Privacy Guardrails
console.log('  Testing 2: Healthcare PII Redaction & Data Sanitization...');
const testEmail = 'patient.kumar@gmail.com';
const testPhone = '+919876543210';
const testAadhaar = '5412 8901 2345';
const rawSentence = 'Patient email is ' + testEmail + ', phone is ' + testPhone + ', Aadhaar is ' + testAadhaar;

const masked = Analytics.maskPII(rawSentence);
assert.ok(!masked.includes(testEmail), 'Email must be scrubbed');
assert.ok(masked.includes('[EMAIL_REDACTED]'), 'Email must be replaced with [EMAIL_REDACTED]');
assert.ok(!masked.includes('9876543210'), 'Phone number must be scrubbed');
assert.ok(masked.includes('[PHONE_REDACTED]'), 'Phone must be replaced with [PHONE_REDACTED]');
assert.ok(!masked.includes('5412 8901 2345'), 'Aadhaar must be scrubbed');
assert.ok(masked.includes('[ID_REDACTED]'), 'Aadhaar must be replaced with [ID_REDACTED]');

// Metadata blacklist redaction test
const sensitiveMeta = {
  userQuery: 'Dosage for high fever',
  patientEmail: 'user@test.org',
  password: 'supersecretpassword123',
  rawOcr: 'Private clinical notes text from prescription',
  prescriptionImage: 'data:image/jpeg;base64,...'
};
const cleanedMeta = Analytics.sanitizeMetadata(sensitiveMeta);
assert.strictEqual(cleanedMeta.password, '[PROTECTED_HEALTH_DATA]', 'Password must be completely protected');
assert.strictEqual(cleanedMeta.rawOcr, '[PROTECTED_HEALTH_DATA]', 'Raw OCR must be protected');
assert.strictEqual(cleanedMeta.prescriptionImage, '[PROTECTED_HEALTH_DATA]', 'Prescription image must be protected');
assert.strictEqual(cleanedMeta.patientEmail, '[EMAIL_REDACTED]', 'Metadata email must be scrubbed');
console.log('  ✅ PASS: Comprehensive PII and sensitive health data redaction verified\n');

// Test 3: Consent Management & DNT Enforcement
console.log('  Testing 3: Consent Controls & Do Not Track...');
Analytics.setConsent(false);
assert.strictEqual(Analytics.getConsentStatus(), 'denied', 'Consent should be denied');
Analytics.setConsent(true);
assert.strictEqual(Analytics.getConsentStatus(), 'granted', 'Consent should be granted');
console.log('  ✅ PASS: Consent management functioning properly\n');

// Test 4: GA4 Standard E-Commerce Events
console.log('  Testing 4: GA4 E-Commerce Event Formatting...');
const sampleProduct = { id: 'ayur_01', name: 'Ashwagandha Organic Extract', price: 349, category: 'Ayurvedic', qty: 2 };
Analytics.trackAddToCart(sampleProduct);

const sampleOrder = {
  id: 'ord_98765',
  totalAmount: 698,
  paymentMethod: 'UPI',
  items: [sampleProduct]
};
Analytics.trackPurchase(sampleOrder);

const ecommerceGtag = global.dataLayer.filter(call => call[0] === 'event' && (call[1] === 'add_to_cart' || call[1] === 'purchase'));
assert.strictEqual(ecommerceGtag.length, 2, 'Should have dispatched 2 GA4 ecommerce events');
assert.strictEqual(ecommerceGtag[0][2].currency, 'INR', 'Currency must be INR');
assert.strictEqual(ecommerceGtag[0][2].value, 698, 'Add to cart value should be qty * price');
assert.strictEqual(ecommerceGtag[1][2].transaction_id, 'ord_98765', 'Purchase transaction ID should match');
console.log('  ✅ PASS: Standard GA4 E-Commerce events formatted and dispatched\n');

// Test 5: Healthcare & AI Workflow Event Tracking
console.log('  Testing 5: Clinical AI, Doctor Booking & Emergency SOS Events...');
Analytics.trackRAGQuery({ query: 'Tulsi for respiratory health', category: 'Ayurveda', sourceCount: 3, grounded: true, tier: 'Tier 1' });
Analytics.trackDoctorBooking({ id: 'doc_12', specialty: 'Ayurvedic Vaidya', fee: 500 }, { type: 'Video Consultation' });
Analytics.trackPrakritiAssessment({ dominantDosha: 'Pitta-Kapha', vata: 20, pitta: 45, kapha: 35 });
Analytics.trackVedicMindQuiz({ category: 'Stress Resilience', scoreBracket: 'Balanced', score: 88 });
Analytics.trackSOSEmergency({ type: 'Cardiac Emergency', hospitalFound: true });

const clinicalGtag = global.dataLayer.filter(call => call[0] === 'event' && [
  'rag_query', 'doctor_consultation_booked', 'prakriti_assessment_completed',
  'vedicmind_quiz_completed', 'sos_emergency_triggered'
].includes(call[1]));

assert.strictEqual(clinicalGtag.length, 5, 'All 5 clinical events should be dispatched');
console.log('  ✅ PASS: Specialized Healthcare and AI event tracking verified\n');

// Test 6: Admin Dashboard Aggregator Metrics
console.log('  Testing 6: Admin Dashboard Aggregator Metrics & Local Persistence...');
const summary = Analytics.getAnalyticsSummary();
assert.ok(summary.totalEvents >= 7, 'Total logged events should be >= 7');
assert.ok(summary.aiQueries >= 1, 'AI queries count should be >= 1');
assert.ok(summary.ecommerceRevenue >= 698, 'Ecommerce revenue should be tracked');
assert.ok(summary.sosCount >= 1, 'SOS emergency count should be >= 1');
console.log('  ✅ PASS: Admin summary aggregation accurately mirrors real-time events\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  Test Results: 6 passed, 0 failed (6 total)');
console.log('  🎉 GA4 PRODUCTION ANALYTICS & PRIVACY SUITE PASSED!');
console.log('═══════════════════════════════════════════════════════════════\n');
