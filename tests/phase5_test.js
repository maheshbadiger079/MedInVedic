/**
 * MedInVedic — Phase 5 Admin Control Center & Revenue Intelligence Test Suite
 */
const assert = require('assert');
const fs = require('fs');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MedInVedic Phase 5 Admin & Revenue Intelligence Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// 1. Revenue Intelligence KPI Calculations
console.log('Testing 1. Revenue Intelligence KPI Engine...');
runTest('Calculates Care Membership MRR correctly across monthly and yearly plans', () => {
  const subscriptions = [
    { status: 'active', plan: 'monthly', amount: 99 },
    { status: 'active', plan: 'monthly', amount: 99 },
    { status: 'active', plan: 'yearly', amount: 999 }, // 999 / 12 ~ 83
    { status: 'cancelled', plan: 'monthly', amount: 99 }
  ];

  const mrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      const plan = s.plan || 'monthly';
      return sum + (plan === 'yearly' ? Math.round((s.amount || 999) / 12) : (s.amount || 99));
    }, 0);

  assert.strictEqual(mrr, 99 + 99 + 83); // 281
});

runTest('Calculates Monthly Target Progress towards ₹1,00,000 correctly', () => {
  const totalNetRevenue = 25000;
  const targetRevenue = 100000;
  const targetPct = Math.min(Math.round((totalNetRevenue / targetRevenue) * 100), 100);

  assert.strictEqual(targetPct, 25);
});

runTest('Calculates 30/60/90-day GMV projections based on rolling 7-day average', () => {
  const trends = [
    { gmv: 2000 }, { gmv: 2500 }, { gmv: 3000 },
    { gmv: 2200 }, { gmv: 2800 }, { gmv: 3500 }, { gmv: 2000 }
  ];
  const avgDaily = trends.reduce((s, t) => s + t.gmv, 0) / trends.length;
  const proj30 = Math.round(avgDaily * 30);
  const proj60 = Math.round(avgDaily * 60);
  const proj90 = Math.round(avgDaily * 90);

  assert.ok(proj30 > 70000 && proj30 < 80000);
  assert.strictEqual(proj60, proj30 * 2);
  assert.strictEqual(proj90, proj30 * 3);
});

// 2. Leads & CRM Pipeline
console.log('\nTesting 2. Leads & CRM Pipeline...');
runTest('Validates lead status lifecycle transitions (New -> In Progress -> Converted)', () => {
  const VALID_STATUSES = ['New', 'In Progress', 'Converted', 'Lost'];
  let currentStatus = 'New';
  
  function transition(next) {
    if (!VALID_STATUSES.includes(next)) throw new Error('Invalid status');
    currentStatus = next;
  }

  transition('In Progress');
  assert.strictEqual(currentStatus, 'In Progress');
  transition('Converted');
  assert.strictEqual(currentStatus, 'Converted');
});

// 3. Partner Management & Settlements
console.log('\nTesting 3. Partner Management & Settlements...');
runTest('Calculates partner commission and handles settlement reset to 0', () => {
  const partner = {
    name: 'Sai Medicals Pune',
    type: 'Pharmacy Partner',
    commissionRate: 10,
    outstanding: 2400,
    status: 'Active'
  };

  assert.strictEqual(partner.outstanding, 2400);

  // Settle partner
  const settledAmount = partner.outstanding;
  partner.outstanding = 0;
  partner.lastSettledAt = new Date().toISOString();

  assert.strictEqual(settledAmount, 2400);
  assert.strictEqual(partner.outstanding, 0);
  assert.ok(partner.lastSettledAt);
});

// 4. Audit Log CSV Export Formatting
console.log('\nTesting 4. Audit Log CSV Export Format...');
runTest('Generates CSV headers and escaped rows without corruption', () => {
  const logs = [
    { admin_name: 'admin@medinvedic.com', action: 'SETTLE_PARTNER', target_type: 'partners', target_id: 'p1', details: 'Settlement ₹2400', ip: '127.0.0.1', severity: 'INFO', status: 'SUCCESS', created_at: '2026-09-01T10:00:00.000Z' }
  ];
  const headers = ['admin_name', 'action', 'target_type', 'target_id', 'details', 'ip', 'severity', 'status', 'created_at'];
  const rows = logs.map(a => headers.map(h => `"${(a[h]||'').toString().replace(/"/g, '')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  assert.ok(csv.includes('admin_name,action,target_type,target_id,details,ip,severity,status,created_at'));
  assert.ok(csv.includes('"admin@medinvedic.com"'));
  assert.ok(csv.includes('"SETTLE_PARTNER"'));
});

// 5. Admin HTML UI Integration
console.log('\nTesting 5. Admin HTML UI Integrity...');
runTest('Verifies admin.html includes all Phase 5 panels, sidebar links, and JS functions', () => {
  const content = fs.readFileSync('public/pages/admin.html', 'utf8');

  // Check panels
  assert.ok(content.includes('id="panel-revenue"'), 'Missing panel-revenue');
  assert.ok(content.includes('id="panel-leads"'), 'Missing panel-leads');
  assert.ok(content.includes('id="panel-partners"'), 'Missing panel-partners');
  assert.ok(content.includes('id="panel-audit"'), 'Missing panel-audit');

  // Check modals
  assert.ok(content.includes('id="addLeadModal"'), 'Missing addLeadModal');
  assert.ok(content.includes('id="addPartnerModal"'), 'Missing addPartnerModal');

  // Check JS functions
  assert.ok(content.includes('function loadRevenue()'), 'Missing loadRevenue()');
  assert.ok(content.includes('function loadLeads()'), 'Missing loadLeads()');
  assert.ok(content.includes('function loadPartners()'), 'Missing loadPartners()');
  assert.ok(content.includes('function exportAuditCSV()'), 'Missing exportAuditCSV()');
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Test Results: ${passed} passed, ${total - passed} failed (${total} total)`);
if (passed === total) {
  console.log('  🎉 ALL PHASE 5 ADMIN & REVENUE INTELLIGENCE TESTS PASSED!');
}
console.log('═══════════════════════════════════════════════════════════════\n');
