/**
 * MedInVedic Dashboard Real Data & Mock Removal Test Suite
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MedInVedic Dashboard Data & Mock Removal Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

const dashboardHtml = fs.readFileSync(path.join(__dirname, '../public/pages/dashboard.html'), 'utf-8');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}\n     ${err.message}`);
    failed++;
  }
}

console.log('Testing 1: Elimination of hardcoded fake data in dashboard.html...');
it('Does not contain hardcoded Age: 26', () => {
  assert(!dashboardHtml.includes('Age: <strong>26</strong>'), 'Found hardcoded Age: 26');
});

it('Does not contain hardcoded "English / ಕನ್ನಡ" in hero meta row', () => {
  assert(!dashboardHtml.includes('Language: <strong>English / ಕನ್ನಡ</strong>'), 'Found hardcoded Language in hero');
});

it('Does not contain hardcoded "82% Complete"', () => {
  assert(!dashboardHtml.includes('82% Complete'), 'Found hardcoded 82% Complete');
});

it('Does not contain CSS width: 82% on progress-fill', () => {
  assert(!dashboardHtml.includes('width: 82%;'), 'Found CSS width: 82%');
});

it('Does not contain hardcoded consultation with Dr. Shailesh Phalle in dashboard cards', () => {
  assert(!dashboardHtml.includes('Dr. Shailesh Phalle · 10:30 AM'), 'Found hardcoded Dr. Shailesh Phalle in card');
  assert(!dashboardHtml.includes('<div class="appt-doc-name">Dr. Shailesh Phalle</div>'), 'Found hardcoded Dr. Shailesh appt item');
});

it('Does not contain hardcoded Deenanath Mangeshkar Hospital report in dashboard card', () => {
  assert(!dashboardHtml.includes('Deenanath Mangeshkar Hospital) — Extracted via OCR'), 'Found hardcoded Deenanath report');
});

it('Does not contain hardcoded Metformin 500mg as taken medication in main dashboard', () => {
  assert(!dashboardHtml.includes('<div class="med-name">Metformin 500mg</div>'), 'Found hardcoded Metformin');
});

it('Does not contain hardcoded notification alert with Dr. Shailesh Phalle', () => {
  assert(!dashboardHtml.includes("Video Consultation with Dr. Shailesh Phalle"), 'Found hardcoded notification alert');
});

console.log('\nTesting 2: Verification of dynamic IDs and structural elements...');
it('Contains dynamic hero elements (age, lang, prakriti, progress)', () => {
  assert(dashboardHtml.includes('id="heroAgeVal"'), 'Missing heroAgeVal');
  assert(dashboardHtml.includes('id="heroLangVal"'), 'Missing heroLangVal');
  assert(dashboardHtml.includes('id="heroPrakritiBadge"'), 'Missing heroPrakritiBadge');
  assert(dashboardHtml.includes('id="profileStatusPercent"'), 'Missing profileStatusPercent');
  assert(dashboardHtml.includes('id="profileProgressFill"'), 'Missing profileProgressFill');
  assert(dashboardHtml.includes('id="btnProfileComplete"'), 'Missing btnProfileComplete');
});

it('Contains dynamic summary card stat elements', () => {
  assert(dashboardHtml.includes('id="statGoalsVal"'), 'Missing statGoalsVal');
  assert(dashboardHtml.includes('id="statGoalsSub"'), 'Missing statGoalsSub');
  assert(dashboardHtml.includes('id="statMedsVal"'), 'Missing statMedsVal');
  assert(dashboardHtml.includes('id="statMedsSub"'), 'Missing statMedsSub');
  assert(dashboardHtml.includes('id="statConsultVal"'), 'Missing statConsultVal');
  assert(dashboardHtml.includes('id="statConsultSub"'), 'Missing statConsultSub');
  assert(dashboardHtml.includes('id="statRecordsVal"'), 'Missing statRecordsVal');
  assert(dashboardHtml.includes('id="statRecordsSub"'), 'Missing statRecordsSub');
});

it('Contains dynamic containers for today\'s meds, upcoming appts, and lab reports', () => {
  assert(dashboardHtml.includes('id="todayMedsContainer"'), 'Missing todayMedsContainer');
  assert(dashboardHtml.includes('id="upcomingApptContainer"'), 'Missing upcomingApptContainer');
  assert(dashboardHtml.includes('id="recentReportContainer"'), 'Missing recentReportContainer');
});

it('Contains profile editing inputs for Age and Phone', () => {
  assert(dashboardHtml.includes('id="profAge"'), 'Missing profAge input');
  assert(dashboardHtml.includes('id="profPhone"'), 'Missing profPhone input');
});

console.log('\nTesting 3: JavaScript dynamic controller validation...');
it('Defines refreshDashboardStats function', () => {
  assert(dashboardHtml.includes('function refreshDashboardStats()'), 'Missing refreshDashboardStats function');
});

it('Defines helper functions for dynamic meds, appointments, and daily goals', () => {
  assert(dashboardHtml.includes('function renderTodayMedsList('), 'Missing renderTodayMedsList');
  assert(dashboardHtml.includes('function renderUpcomingAppointment('), 'Missing renderUpcomingAppointment');
  assert(dashboardHtml.includes('function renderRecentReport('), 'Missing renderRecentReport');
  assert(dashboardHtml.includes('function renderDailyGoalsList('), 'Missing renderDailyGoalsList');
  assert(dashboardHtml.includes('function addNewMedicineReminder('), 'Missing addNewMedicineReminder');
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Dashboard Test Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL DASHBOARD DATA ACCURACY TESTS PASSED PERFECTLY!\n');
}
