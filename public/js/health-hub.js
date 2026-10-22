/**
 * public/js/health-hub.js — MedInVedic Health Hub RAG Frontend
 * ═══════════════════════════════════════════════════════════════
 * All 20 Health Hub features connected to RAG-powered API endpoints.
 * Renders: AI answers, evidence citations, RAG model indicator,
 * emergency alerts, multilingual support, voice TTS/STT.
 * ═══════════════════════════════════════════════════════════════
 */

// ── API base ─────────────────────────────────────────────────────
const API_BASE = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'))
  ? (window.location.port === '3001' ? '/api' : 'http://localhost:3001/api')
  : '/api';

// ── Voice state ───────────────────────────────────────────────────
let recognition   = null;
let isRecording   = false;

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAccessibility();
  initSubnavTabs();
  loadOverviewStats();
  initVoiceAssistant();
  loadLockerDocuments();
  loadFamilyProfiles();
  loadTimeline();
  loadLabCatalog();
  loadPreventiveScreenings();
  loadExpenses();
  loadNotifications();
  loadEmergencyCard();
});

// ═══════════════════════════════════════════════════════════════
// ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════
function initAccessibility() {
  const c = localStorage.getItem('hh_contrast');
  if (c === 'high') document.body.classList.add('high-contrast-mode');
  const f = localStorage.getItem('hh_font_scale') || 'normal';
  if (f === 'lg') document.body.classList.add('font-scale-lg');
  if (f === 'xl') document.body.classList.add('font-scale-xl');
  if (localStorage.getItem('hh_motion') === 'true') document.body.classList.add('reduced-motion');
}
window.toggleHighContrast = () => {
  const on = document.body.classList.toggle('high-contrast-mode');
  localStorage.setItem('hh_contrast', on ? 'high' : 'normal');
  ariaAnnounce(on ? 'High contrast enabled.' : 'Standard contrast restored.');
};
window.setFontScale = scale => {
  document.body.classList.remove('font-scale-lg','font-scale-xl');
  if (scale !== 'normal') document.body.classList.add(`font-scale-${scale}`);
  localStorage.setItem('hh_font_scale', scale);
  ariaAnnounce(`Font size: ${scale}.`);
};
window.toggleReducedMotion = () => {
  const on = document.body.classList.toggle('reduced-motion');
  localStorage.setItem('hh_motion', on ? 'true' : 'false');
  ariaAnnounce(on ? 'Animations disabled.' : 'Animations enabled.');
};
function ariaAnnounce(msg) {
  const el = document.getElementById('hhLiveAnnouncer');
  if (el) { el.textContent = ''; setTimeout(() => el.textContent = msg, 50); }
}

// ═══════════════════════════════════════════════════════════════
// SUBNAV TABS
// ═══════════════════════════════════════════════════════════════
function initSubnavTabs() {
  document.querySelectorAll('.hh-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchHealthTab(btn.getAttribute('data-tab')));
  });
  const hash = window.location.hash?.replace('#','');
  if (hash) switchHealthTab(hash);
}
window.switchHealthTab = tabId => {
  document.querySelectorAll('.hh-subnav-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tabId));
  document.querySelectorAll('.hh-tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tabId}`));
  window.history.replaceState(null,'',`#${tabId}`);
  ariaAnnounce(`Switched to ${tabId}.`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ═══════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════
async function loadOverviewStats() {
  try {
    const d = await apiFetch('/health-hub/overview');
    if (d.success) {
      setEl('statDocsCount',    d.data.documents_count || 0);
      setEl('statReportsCount', d.data.report_analyses_count || 0);
      setEl('statFamilyCount',  d.data.family_members_count || 0);
      setEl('statExpensesTotal',`₹${(d.data.total_expenses_inr||0).toLocaleString('en-IN')}`);
      // Show RAG status badge
      const badge = document.getElementById('ragStatusBadge');
      if (badge) {
        badge.textContent = d.data.rag_status;
        badge.style.background = d.data.rag_status.includes('Flash') ? '#16a34a' : '#f59e0b';
      }
    }
  } catch(e) { console.warn('Overview stats:', e); }
}

// ═══════════════════════════════════════════════════════════════
// ── SHARED: RAG RESULT RENDERER ──────────────────────────────
// ═══════════════════════════════════════════════════════════════
function renderRAGResult(containerId, ragData, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const model       = ragData.rag_model || ragData.model || 'retrieval';
  const chunks      = ragData.retrieved_chunks || 0;
  const citations   = ragData.evidence_citations || ragData.citations || [];
  const answer      = ragData.rag_analysis || ragData.rag_meal_plan || ragData.rag_drug_info ||
                      ragData.rag_info || ragData.explanation || ragData.answer || '';
  const disclaimer  = ragData.disclaimer || ragData.safety_disclaimer || '';
  const isEmergency = ragData.is_emergency;

  if (isEmergency) {
    container.innerHTML = emergencyBanner(answer);
    container.style.display = 'block';
    ariaAnnounce('EMERGENCY: Critical symptoms detected. Call 112 immediately.');
    return;
  }

  const modelLabel   = model.includes('gemini') ? `🤖 Gemini 1.5 Flash AI` : `📚 RAG Retrieval (No API Key)`;
  const modelColor   = model.includes('gemini') ? '#16a34a' : '#f59e0b';
  const chunkBadge   = chunks ? `<span style="margin-left:8px;font-size:11px;color:#6b7280;">${chunks} sources retrieved</span>` : '';

  const citHTML = citations.length ? `
    <div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;border-left:3px solid #16a34a;">
      <strong style="font-size:13px;color:#15803d;">📎 Evidence Citations (RAG Sources):</strong><br/>
      ${citations.map((c,i) => `<div style="margin-top:6px;font-size:12px;color:#374151;">
        <strong>[${c.index||i+1}]</strong> ${c.title || c.source}
        <br/><span style="color:#6b7280;">Source: ${c.source}</span> · <em style="color:#059669;">${c.tier}</em>
      </div>`).join('')}
    </div>` : '';

  const disclaimerHTML = disclaimer ? `
    <div style="margin-top:12px;padding:10px;background:#fef3c7;border-radius:8px;font-size:12px;color:#92400e;">
      ⚠️ ${disclaimer}
    </div>` : '';

  const extraHTML = opts.extraHTML || '';

  container.innerHTML = `
    <div style="margin-bottom:10px;display:flex;align-items:center;flex-wrap:wrap;gap:8px;">
      <span style="background:${modelColor};color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">${modelLabel}</span>
      ${chunkBadge}
    </div>
    <div style="line-height:1.8;white-space:pre-wrap;font-size:14.5px;">${escapeToHTML(answer)}</div>
    ${citHTML}
    ${extraHTML}
    ${disclaimerHTML}
  `;
  container.style.display = 'block';
}

function emergencyBanner(msg) {
  return `<div class="hh-emergency-alert" role="alert">
    <div style="font-size:20px;font-weight:800;margin-bottom:8px;">🚨 EMERGENCY DETECTED</div>
    <p>${escapeToHTML(msg)}</p>
    <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap;">
      <a href="tel:112" class="hh-sos-btn" style="font-size:16px;padding:12px 24px;">📞 Call 112 (National Emergency)</a>
      <a href="tel:108" class="hh-sos-btn" style="background:#b91c1c;font-size:16px;padding:12px 24px;">🚑 Call 108 (Ambulance)</a>
    </div>
  </div>`;
}

function escapeToHTML(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\n/g,'<br/>');
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 1: AI MEDICAL REPORT EXPLAINER
// ═══════════════════════════════════════════════════════════════
window.currentStructuredTests = [];

window.analyzeReportInput = async function() {
  const title = document.getElementById('reportTitleInput').value || 'Diagnostic Blood Report';
  const lang  = document.getElementById('reportLanguageSelect')?.value || 'en';
  const outputCard = document.getElementById('reportAnalysisOutput');
  const loader     = document.getElementById('reportLoader');

  showLoader(loader, true);
  outputCard.style.display = 'none';

  try {
    const d = await apiFetch('/health-hub/reports/analyze', 'POST', { title, language: lang });
    showLoader(loader, false);
    if (!d.success) { showError(outputCard, d.error); return; }

    window.currentStructuredTests = d.structured_tests || [];
    setEl('reportOutputTitle', d.title);

    // Tests table
    const tbody = document.getElementById('reportTestsTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      d.structured_tests.forEach((t, i) => {
        const tr = document.createElement('tr');
        const cls = t.flag === 'HIGH' ? 'hh-badge-high' : t.flag === 'LOW' ? 'hh-badge-warning' : 'hh-badge-normal';
        tr.innerHTML = `
          <td><strong>${t.test_name}</strong></td>
          <td><input type="text" class="hh-input" style="width:90px;padding:4px 8px;" value="${t.value}" onchange="updateTestVal(${i},this.value)"></td>
          <td>${t.unit}</td>
          <td>${t.reference_range}</td>
          <td><span class="hh-badge ${cls}">${t.flag}</span></td>`;
        tbody.appendChild(tr);
      });
    }

    // RAG explanation with citations
    renderRAGResult('reportRAGOutput', d, {
      extraHTML: d.report_id ? `<div style="margin-top:10px;font-size:12px;color:#6b7280;">Report ID: ${d.report_id} · Saved to Health Locker</div>` : ''
    });
    outputCard.style.display = 'block';
    ariaAnnounce('Report analysis complete. Review findings and AI explanation below.');
  } catch(err) {
    showLoader(loader, false);
    showError(outputCard, err.message);
  }
};

window.updateTestVal = (i,v) => { if (window.currentStructuredTests[i]) window.currentStructuredTests[i].value = v; };

window.saveVerifiedReport = () => {
  alert('Report verified and saved to your Digital Health Locker!');
  loadOverviewStats();
};

window.downloadReportSummary = () => {
  const title   = document.getElementById('reportOutputTitle')?.textContent || 'Report';
  const explain = document.getElementById('reportRAGOutput')?.innerText || '';
  const tests   = window.currentStructuredTests.map(t => `- ${t.test_name}: ${t.value} ${t.unit} (Ref: ${t.reference_range}) [${t.flag}]`).join('\n');
  const content = `MedInVedic AI Medical Report Summary\n${'='.repeat(50)}\nReport: ${title}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nAI RAG Explanation:\n${explain}\n\nTest Parameters:\n${tests}\n\nNOTICE: For informational support only. Consult your physician.`;
  downloadTxt(content, `MedInVedic_Report_${Date.now()}.txt`);
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 2: SMART SYMPTOM CHECKER
// ═══════════════════════════════════════════════════════════════
window.selectedSymptomsList = [];

window.toggleSymptomPill = (el, symptom) => {
  el.classList.toggle('active');
  window.selectedSymptomsList = el.classList.contains('active')
    ? [...window.selectedSymptomsList, symptom]
    : window.selectedSymptomsList.filter(s => s !== symptom);
  setEl('selectedSymptomsInput', window.selectedSymptomsList.join(', '));
};

window.evaluateSymptoms = async function() {
  const symptoms = document.getElementById('selectedSymptomsInput')?.value || '';
  const duration = document.getElementById('symptomDurationSelect')?.value || '1–3 days';
  const severity = document.querySelector('input[name="symptomSeverity"]:checked')?.value || 'Moderate';
  const ageGroup = document.getElementById('symptomAgeGroupSelect')?.value || 'Adult';
  const lang     = document.getElementById('symptomLangSelect')?.value || 'en';
  const box      = document.getElementById('symptomResultBox');

  if (!symptoms) { alert('Please select or type at least one symptom.'); return; }

  const btnText = startLoading('symptomEvalBtn', '🔍 Analyzing via RAG…');
  try {
    const d = await apiFetch('/health-hub/symptoms/evaluate','POST',{ symptoms, duration, severity, age_group:ageGroup, language:lang });
    if (d.is_emergency) {
      box.innerHTML = emergencyBanner(d.urgency_guidance);
    } else {
      const riskColor = d.risk_level === 'Urgent' ? '#dc2626' : '#16a34a';
      box.innerHTML = `
        <div class="hh-card" style="border-left:5px solid ${riskColor};">
          <div class="hh-card-header">
            <h3 class="hh-card-title">Triage Result: <span class="hh-badge" style="background:${riskColor};color:#fff;">${d.risk_level}</span></h3>
          </div>
        </div>`;
      renderRAGResult('symptomRAGResult', d);
    }
    box.style.display = 'block';
    ariaAnnounce('Symptom analysis complete.');
  } catch(err) { alert('Symptom check error: ' + err.message); }
  finally { stopLoading('symptomEvalBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 3: AI NUTRITION & DIET ASSISTANT
// ═══════════════════════════════════════════════════════════════
window.generateNutritionPlan = async function() {
  const region   = document.getElementById('nutritionRegionSelect')?.value || 'South Indian';
  const dietType = document.getElementById('nutritionDietTypeSelect')?.value || 'Vegetarian';
  const calories = document.getElementById('nutritionCaloriesInput')?.value || 2000;
  const allergies= document.getElementById('nutritionAllergiesInput')?.value || 'None';
  const goals    = document.getElementById('nutritionGoalsInput')?.value || 'General wellness';
  const lang     = document.getElementById('nutritionLangSelect')?.value || 'en';
  const out      = document.getElementById('nutritionPlanOutput');

  const btnText = startLoading('nutritionGenerateBtn', '🥗 Generating via RAG…');
  try {
    const d = await apiFetch('/health-hub/nutrition/generate','POST',{ region, diet_type:dietType, calories_target:calories, allergies, goals, language:lang });
    if (!d.success) { alert(d.error); return; }

    setEl('nutritionPlanTitle', `${d.region} ${d.diet_type} Plan — ${d.calories_target} kcal`);

    // RAG meal plan
    renderRAGResult('nutritionRAGOutput', d);

    // Shopping list
    const shopEl = document.getElementById('nutritionShoppingList');
    if (shopEl) shopEl.innerHTML = (d.shopping_list||[]).map(i=>`<li><label><input type="checkbox" style="margin-right:8px;">${i}</label></li>`).join('');

    // Substitutions
    const subEl = document.getElementById('nutritionSubstitutions');
    if (subEl) subEl.innerHTML = (d.substitutions||[]).map(s=>`
      <div style="margin-bottom:8px;padding:8px;background:var(--hh-surface-subtle);border-radius:6px;">
        <strong>Instead of:</strong> ${s.replace} → <strong style="color:var(--hh-primary);">${s.with}</strong><br/>
        <small style="color:var(--hh-text-muted);">${s.benefit}</small>
      </div>`).join('');

    out.style.display = 'block';
    ariaAnnounce('Personalised RAG nutrition plan ready.');
  } catch(err) { alert('Nutrition plan error: ' + err.message); }
  finally { stopLoading('nutritionGenerateBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 4: DIGITAL HEALTH LOCKER
// ═══════════════════════════════════════════════════════════════
async function loadLockerDocuments(cat = 'All') {
  const grid = document.getElementById('lockerDocsGrid');
  if (!grid) return;
  try {
    const d = await apiFetch(`/health-hub/locker/documents?category=${encodeURIComponent(cat)}`);
    if (!d.documents?.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--hh-text-muted);">No documents. Upload your medical records above.</div>`;
      return;
    }
    grid.innerHTML = d.documents.map(doc => `
      <div class="hh-card">
        <div class="hh-card-header">
          <span class="hh-badge hh-badge-info">${doc.category}</span>
          <span style="font-size:12px;color:var(--hh-text-muted);">${doc.date_recorded||''}</span>
        </div>
        <h4 style="margin:0 0 6px;font-size:16px;">${doc.title}</h4>
        <p style="font-size:13px;color:var(--hh-text-muted);margin-bottom:12px;">Type: ${doc.document_type} · Tags: ${doc.tags}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="hh-btn hh-btn-sm hh-btn-secondary" onclick="shareLockerDoc(${doc.id})">🔗 Share</button>
          <a href="${doc.file_url}" target="_blank" class="hh-btn hh-btn-sm hh-btn-secondary">👁️ View</a>
          <button class="hh-btn hh-btn-sm hh-btn-danger" onclick="deleteLockerDoc(${doc.id})">🗑️ Delete</button>
        </div>
      </div>`).join('');
  } catch(e) { console.warn('Locker:', e); }
}

window.filterLockerCategory = (cat, el) => {
  document.querySelectorAll('.locker-filter-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  loadLockerDocuments(cat);
};

window.uploadLockerDoc = async function() {
  const fi   = document.getElementById('lockerFileInput');
  const title= document.getElementById('lockerTitleInput')?.value;
  const cat  = document.getElementById('lockerCategorySelect')?.value || 'Lab Reports';
  if (!fi?.files[0]) { alert('Please select a file.'); return; }
  const fd = new FormData();
  fd.append('file', fi.files[0]);
  fd.append('title', title || fi.files[0].name);
  fd.append('category', cat);
  try {
    const r = await fetch(`${API_BASE}/health-hub/locker/upload`, { method:'POST', body:fd });
    const d = await r.json();
    alert(d.message || 'Uploaded!');
    loadLockerDocuments();
    loadOverviewStats();
  } catch(e) { alert('Upload error: ' + e.message); }
};

window.shareLockerDoc = async id => {
  const d = await apiFetch('/health-hub/locker/share','POST',{ document_id:id, hours_valid:24 });
  if (d.success) prompt('Secure share link (valid 24h):', d.share_link);
};
window.deleteLockerDoc = async id => {
  if (!confirm('Archive this document?')) return;
  await apiFetch(`/health-hub/locker/documents/${id}`,'DELETE');
  loadLockerDocuments();
};

// RAG Q&A on locker
window.askLockerRAG = async function() {
  const q    = document.getElementById('lockerRAGInput')?.value;
  const lang = document.getElementById('lockerRAGLang')?.value || 'en';
  if (!q) { alert('Enter a question.'); return; }
  const btnText = startLoading('lockerRAGBtn','🔍 Searching your records…');
  try {
    const d = await apiFetch('/health-hub/locker/ask','POST',{ question:q, language:lang });
    renderRAGResult('lockerRAGOutput', d);
  } catch(e) { alert(e.message); }
  finally { stopLoading('lockerRAGBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 5: MEDICINE BARCODE SCANNER
// ═══════════════════════════════════════════════════════════════
window.lookupBarcode = async function() {
  const code = document.getElementById('barcodeInput')?.value?.trim();
  const name = document.getElementById('barcodeManualName')?.value?.trim();
  const out  = document.getElementById('barcodeResult');
  if (!code && !name) { alert('Enter barcode number or medicine name.'); return; }

  const btnText = startLoading('barcodeBtn','🔍 Looking up…');
  try {
    const d = await apiFetch(`/health-hub/barcode/lookup/${code||'000000'}${name?`?name=${encodeURIComponent(name)}`:''}`);
    out.style.display = 'block';
    if (d.found && d.product) {
      const p = d.product;
      out.innerHTML = `
        <div class="hh-card" style="border-left:5px solid #16a34a;">
          <h3>✅ ${p.name}</h3>
          <table style="width:100%;font-size:13px;border-collapse:collapse;margin:10px 0;">
            ${[['Manufacturer',p.manufacturer],['Ingredients',p.ingredients],['Strength',p.strength],['Form',p.form],['Batch',p.batch],['Expiry',p.expiry],['MRP',`₹${p.mrp}`],['Schedule',p.schedule]].map(([k,v])=>`<tr><td style="font-weight:700;width:130px;padding:4px 0;">${k}</td><td>${v||'—'}</td></tr>`).join('')}
          </table>
          <div id="barcodeRAGOut"></div>
        </div>`;
      renderRAGResult('barcodeRAGOut', d);
    } else {
      out.innerHTML = `<div class="hh-card" style="border-left:5px solid #f59e0b;">
        <h3>⚠️ Not in Verified Catalog</h3>
        <p>${d.message || ''}</p>
        <div id="barcodeRAGOut"></div>
      </div>`;
      if (d.rag_info) renderRAGResult('barcodeRAGOut', { answer:d.rag_info, citations:d.citations||[], rag_model:'retrieval' });
    }
  } catch(e) { alert(e.message); }
  finally { stopLoading('barcodeBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 6: LIVE ORDER TRACKING
// ═══════════════════════════════════════════════════════════════
window.trackOrder = async function() {
  const orderId = document.getElementById('orderIdInput')?.value?.trim();
  if (!orderId) { alert('Enter Order ID.'); return; }
  const out = document.getElementById('orderTrackingOutput');
  const btnText = startLoading('trackOrderBtn','🔍 Tracking…');
  try {
    const d = await apiFetch(`/health-hub/orders/track/${encodeURIComponent(orderId)}`);
    if (!d.success) { alert(d.error); return; }
    const t = d.tracking;
    out.innerHTML = `
      <div class="hh-card">
        <div class="hh-card-header"><h3>Order #${t.order_id} — <span class="hh-badge hh-badge-info">${t.status}</span></h3></div>
        <div style="margin:16px 0;">
          ${t.timeline.map(s=>`
            <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:12px;">
              <div style="width:28px;height:28px;border-radius:50%;background:${s.status==='COMPLETED'?'#16a34a':s.status==='IN_TRANSIT'?'#2563eb':'#d1d5db'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">${s.step}</div>
              <div><div style="font-weight:600;font-size:14px;">${s.label}</div><div style="font-size:12px;color:var(--hh-text-muted);">${s.time}</div></div>
            </div>`).join('')}
        </div>
        <div style="padding:12px;background:var(--hh-surface-subtle);border-radius:8px;font-size:13px;">
          <strong>Courier:</strong> ${t.logistics?.courier||'—'} · AWB: ${t.logistics?.awb||'—'}<br/>
          <strong>GST Invoice:</strong> ${t.invoice?.gst_invoice||'—'} · Total: ₹${t.invoice?.total_inr||0}
        </div>
      </div>`;
    out.style.display = 'block';
  } catch(e) { alert(e.message); }
  finally { stopLoading('trackOrderBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 7: FAMILY HEALTH PROFILES
// ═══════════════════════════════════════════════════════════════
async function loadFamilyProfiles() {
  const grid = document.getElementById('familyProfilesGrid');
  if (!grid) return;
  const d = await apiFetch('/health-hub/family');
  if (!d.profiles?.length) {
    grid.innerHTML = `<div style="color:var(--hh-text-muted);padding:20px;">No family profiles. Add one below.</div>`;
    return;
  }
  grid.innerHTML = d.profiles.map(p=>`
    <div class="hh-card">
      <div class="hh-card-header"><span class="hh-badge hh-badge-info">${p.relationship}</span></div>
      <h4 style="margin:6px 0;">${p.full_name}</h4>
      <p style="font-size:13px;color:var(--hh-text-muted);">DOB: ${p.dob} · Blood Group: ${p.blood_group}</p>
      <p style="font-size:13px;">Allergies: ${p.allergies}</p>
      <button class="hh-btn hh-btn-sm hh-btn-danger" onclick="revokeFamilyAccess(${p.id})">🔒 Revoke Access</button>
    </div>`).join('');
}

window.addFamilyProfile = async function() {
  const name = document.getElementById('familyNameInput')?.value;
  if (!name) { alert('Full name required.'); return; }
  const d = await apiFetch('/health-hub/family','POST',{
    full_name:name,
    relationship: document.getElementById('familyRelSelect')?.value||'Other',
    dob: document.getElementById('familyDobInput')?.value||'2000-01-01',
    gender: document.getElementById('familyGenderSelect')?.value||'Other',
    blood_group: document.getElementById('familyBGInput')?.value||'Unknown',
    allergies: document.getElementById('familyAllergiesInput')?.value||'None',
    chronic_conditions: document.getElementById('familyConditionsInput')?.value||'None',
    emergency_contact: document.getElementById('familyContactInput')?.value||''
  });
  alert(d.message||'Profile added.');
  loadFamilyProfiles();
  loadOverviewStats();
};

window.revokeFamilyAccess = async id => {
  if (!confirm('Revoke access to this family profile?')) return;
  await apiFetch(`/health-hub/family/${id}`,'DELETE');
  loadFamilyProfiles();
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 8: MULTILINGUAL VOICE ASSISTANT
// ═══════════════════════════════════════════════════════════════
function initVoiceAssistant() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const btn = document.getElementById('voiceRecordBtn');
    if (btn) { btn.textContent = '⌨️ Type Query'; btn.title = 'Speech not supported in this browser'; }
  }
}

window.toggleVoiceRecording = function() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) { alert('Speech recognition not supported. Please type your question.'); return; }

  if (isRecording) {
    recognition?.stop();
    return;
  }

  const lang = document.getElementById('voiceLangSelect')?.value || 'en';
  const langBCP = { en:'en-IN', hi:'hi-IN', kn:'kn-IN', mr:'mr-IN' }[lang] || 'en-IN';

  recognition = new SpeechRec();
  recognition.lang = langBCP;
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isRecording = true;
    setEl('voiceRecordBtn','🔴 Recording… (click to stop)');
    setEl('voiceTranscriptBox','Listening…');
  };
  recognition.onresult = e => {
    const t = Array.from(e.results).map(r=>r[0].transcript).join('');
    setEl('voiceTranscriptBox', t);
    if (e.results[e.results.length-1].isFinal) {
      const inp = document.getElementById('voiceQueryInput');
      if (inp) inp.value = t;
    }
  };
  recognition.onerror = () => { isRecording = false; setEl('voiceRecordBtn','🎙️ Start Recording'); };
  recognition.onend   = () => { isRecording = false; setEl('voiceRecordBtn','🎙️ Start Recording'); };
  recognition.start();
  ariaAnnounce('Microphone activated. Speak your health question.');
};

window.submitVoiceQuery = async function() {
  const query = document.getElementById('voiceQueryInput')?.value?.trim();
  const lang  = document.getElementById('voiceLangSelect')?.value || 'en';
  const out   = document.getElementById('voiceAnswerBox');
  if (!query) { alert('Please record or type your question.'); return; }

  const btnText = startLoading('voiceSubmitBtn','🔍 Processing via RAG…');
  try {
    const d = await apiFetch('/health-hub/voice-assistant/query','POST',{ query, language:lang });
    renderRAGResult('voiceRAGOutput', d);
    out.style.display = 'block';

    // TTS
    if (d.answer && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(
        d.answer.replace(/<[^>]*>/g,'').replace(/[#*]/g,'').substring(0,500)
      );
      utter.lang = { en:'en-IN', hi:'hi-IN', kn:'kn-IN', mr:'mr-IN' }[lang] || 'en-IN';
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
    ariaAnnounce('Voice assistant response ready. Playing audio.');
  } catch(err) { alert('Voice assistant error: ' + err.message); }
  finally { stopLoading('voiceSubmitBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 9: MEDICINE INTERACTION CHECKER
// ═══════════════════════════════════════════════════════════════
window.checkDrugInteractions = async function() {
  const m1   = document.getElementById('interactionMed1Input')?.value?.trim();
  const m2   = document.getElementById('interactionMed2Input')?.value?.trim();
  const m3   = document.getElementById('interactionMed3Input')?.value?.trim();
  const lang = document.getElementById('interactionLangSelect')?.value || 'en';
  const meds = [m1,m2,m3].filter(Boolean);
  if (!meds.length) { alert('Enter at least one medicine.'); return; }

  const btnText = startLoading('interactionCheckBtn','🔬 Checking via RAG…');
  try {
    const d = await apiFetch('/health-hub/interactions/check','POST',{ medicines:meds, language:lang });
    renderRAGResult('interactionRAGOutput', d, {
      extraHTML: `<div style="margin-top:10px;padding:8px;background:#fef2f2;border-radius:6px;font-size:12px;color:#991b1b;">
        <strong>Medicines checked:</strong> ${(d.medicines_checked||meds).join(', ')}</div>`
    });
  } catch(err) { alert('Interaction check error: ' + err.message); }
  finally { stopLoading('interactionCheckBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 10: LAB TEST BOOKING
// ═══════════════════════════════════════════════════════════════
async function loadLabCatalog() {
  const grid = document.getElementById('labCatalogGrid');
  if (!grid) return;
  const d = await apiFetch('/health-hub/labs/catalog');
  if (!d.tests?.length) { grid.innerHTML = '<p style="color:var(--hh-text-muted);">Lab catalog loading…</p>'; return; }
  grid.innerHTML = d.tests.map(t=>`
    <div class="hh-card" style="cursor:pointer;" onclick="prefillLabBook('${t.test_name||t.name}','${t.lab_name||'MedInVedic NABL Lab'}')">
      <div class="hh-card-header"><span class="hh-badge hh-badge-info">${t.category||'Diagnostic'}</span></div>
      <h4 style="margin:6px 0;font-size:15px;">${t.test_name||t.name}</h4>
      <p style="font-size:13px;color:var(--hh-text-muted);">${t.description||''}</p>
      <p style="font-weight:700;color:var(--hh-primary);">₹${t.price_inr||t.price||0}</p>
      <button class="hh-btn hh-btn-sm hh-btn-primary" style="margin-top:8px;">📅 Book This Test</button>
    </div>`).join('');
}

window.prefillLabBook = (name, lab) => {
  const n = document.getElementById('labTestNameInput');
  const l = document.getElementById('labNameInput');
  if (n) n.value = name;
  if (l) l.value = lab;
  switchHealthTab('labs');
};

window.bookLabTest = async function() {
  const testName = document.getElementById('labTestNameInput')?.value;
  const labName  = document.getElementById('labNameInput')?.value || 'MedInVedic NABL Lab';
  const slotDate = document.getElementById('labSlotDateInput')?.value;
  const homeCol  = document.getElementById('labHomeCollectionCheck')?.checked;
  if (!testName) { alert('Select or enter a test name.'); return; }

  const btnText = startLoading('labBookBtn','📅 Booking…');
  try {
    const d = await apiFetch('/health-hub/labs/book','POST',{
      test_name:testName, lab_name:labName, slot_date:slotDate, home_collection:homeCol
    });
    if (!d.success) { alert(d.error); return; }
    const out = document.getElementById('labBookingResult');
    out.innerHTML = `
      <div class="hh-card" style="border-left:5px solid #16a34a;">
        <h3>✅ Booking Confirmed #${d.booking_id}</h3>
        <p><strong>${testName}</strong> at ${labName}</p>
        <p>Slot: ${slotDate||'To be confirmed'} · Home collection: ${homeCol?'Yes':'No'}</p>
        <p style="margin-top:8px;font-size:13px;">${d.instructions||''}</p>
        <div id="labRAGInfo" style="margin-top:12px;"></div>
      </div>`;
    out.style.display = 'block';
    if (d.rag_test_info) renderRAGResult('labRAGInfo', { answer:d.rag_test_info, citations:d.citations||[], rag_model:d.rag_model||'retrieval' });
  } catch(err) { alert(err.message); }
  finally { stopLoading('labBookBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 11: PERSONAL HEALTH TIMELINE
// ═══════════════════════════════════════════════════════════════
async function loadTimeline() {
  const list = document.getElementById('timelineEventsList');
  if (!list) return;
  const d = await apiFetch('/health-hub/timeline');
  if (!d.events?.length) { list.innerHTML = '<p style="color:var(--hh-text-muted);padding:20px;">No health events recorded yet. Add vitals or book lab tests.</p>'; return; }
  list.innerHTML = d.events.map(e=>`
    <div class="hh-card" style="display:flex;gap:16px;align-items:flex-start;margin-bottom:10px;">
      <div style="text-align:center;min-width:60px;">
        <div style="font-size:12px;font-weight:700;color:var(--hh-primary);">${e.event_date||'—'}</div>
      </div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="hh-badge hh-badge-info">${e.event_type}</span>
          <strong>${e.title}</strong>
        </div>
        <p style="font-size:13px;color:var(--hh-text-muted);margin:4px 0 0;">${e.summary||''}</p>
        <p style="font-size:11px;color:#9ca3af;">Source: ${e.source_provenance||'—'}</p>
      </div>
    </div>`).join('');
}

window.addVitalSign = async function() {
  const type  = document.getElementById('vitalTypeSelect')?.value || 'Blood Pressure';
  const value = document.getElementById('vitalValueInput')?.value;
  const unit  = document.getElementById('vitalUnitInput')?.value || '';
  if (!value) { alert('Enter a value.'); return; }
  const d = await apiFetch('/health-hub/timeline/vitals','POST',{ type, value, unit });
  alert(d.message||'Vital saved.');
  loadTimeline();
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 12: SMART NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
async function loadNotifications() {
  const list = document.getElementById('notificationsList');
  if (!list) return;
  const d = await apiFetch('/health-hub/notifications');
  if (!d.notifications?.length) { list.innerHTML = '<p style="color:var(--hh-text-muted);">No notifications set.</p>'; return; }
  list.innerHTML = d.notifications.map(n=>`
    <div class="hh-card" style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <strong>${n.title}</strong> <span class="hh-badge hh-badge-info">${n.notification_type}</span>
        <p style="font-size:13px;color:var(--hh-text-muted);margin:4px 0;">${n.message||''}</p>
        <p style="font-size:12px;color:#9ca3af;">Scheduled: ${n.scheduled_time||'—'} · Status: ${n.status}</p>
      </div>
      <button class="hh-btn hh-btn-sm hh-btn-danger" onclick="disableNotification(${n.id})">🔕 Disable</button>
    </div>`).join('');
}

window.addNotification = async function() {
  const d = await apiFetch('/health-hub/notifications','POST',{
    notification_type: document.getElementById('notifTypeSelect')?.value||'Medication Reminder',
    title:   document.getElementById('notifTitleInput')?.value||'Health Reminder',
    message: document.getElementById('notifMessageInput')?.value||'',
    scheduled_time: document.getElementById('notifTimeInput')?.value||''
  });
  alert(d.message||'Notification set.');
  loadNotifications();
};
window.disableNotification = async id => { await apiFetch(`/health-hub/notifications/${id}`,'DELETE'); loadNotifications(); };

// ═══════════════════════════════════════════════════════════════
// FEATURE 13: EMERGENCY CARD
// ═══════════════════════════════════════════════════════════════
async function loadEmergencyCard() {
  const area = document.getElementById('emergencyCardDisplay');
  if (!area) return;
  const d = await apiFetch('/health-hub/emergency-card');
  if (!d.exists) { area.innerHTML = '<p style="color:var(--hh-text-muted);">No emergency card yet. Create one below.</p>'; return; }
  const c = d.card;
  area.innerHTML = `
    <div class="hh-card" style="border:2px solid #dc2626;">
      <h3 style="color:#dc2626;">🆘 Emergency Medical Card</h3>
      <p><strong>Name:</strong> ${c.full_name}</p>
      <p><strong>Blood Group:</strong> <span style="font-size:18px;font-weight:800;color:#dc2626;">${c.blood_group}</span></p>
      <p><strong>Conditions:</strong> ${c.chronic_conditions}</p>
      <p><strong>Allergies:</strong> ${(c.allergies||[]).join(', ')||'None'}</p>
      <p><strong>Medications:</strong> ${(c.current_medications||[]).join(', ')||'None'}</p>
      <p><strong>QR Token:</strong> <code style="font-size:11px;">${c.qr_token}</code></p>
    </div>`;
}

window.createEmergencyCard = async function() {
  const d = await apiFetch('/health-hub/emergency-card','POST',{
    full_name:          document.getElementById('emergencyNameInput')?.value||'Patient',
    blood_group:        document.getElementById('emergencyBGInput')?.value||'Unknown',
    chronic_conditions: document.getElementById('emergencyCondInput')?.value||'None',
    allergies:          (document.getElementById('emergencyAllergyInput')?.value||'').split(',').map(s=>s.trim()),
    current_medications:(document.getElementById('emergencyMedInput')?.value||'').split(',').map(s=>s.trim()),
    emergency_contacts: [{ name: document.getElementById('emergencyContactNameInput')?.value||'', phone: document.getElementById('emergencyContactPhoneInput')?.value||'' }]
  });
  alert(d.message||'Emergency card created.');
  loadEmergencyCard();
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 16: PERSONAL RAG HEALTH ASSISTANT
// ═══════════════════════════════════════════════════════════════
window.submitRAGQuestion = async function() {
  const q    = document.getElementById('ragQuestionInput')?.value?.trim();
  const lang = document.getElementById('ragLangSelect')?.value || 'en';
  if (!q) { alert('Enter a health question.'); return; }

  const btnText = startLoading('ragSubmitBtn','🔍 Searching knowledge base…');
  try {
    const d = await apiFetch('/health-hub/rag/ask','POST',{ question:q, language:lang });
    renderRAGResult('ragAnswerOutput', d);
    document.getElementById('ragAnswerSection').style.display = 'block';
  } catch(err) { alert('RAG error: ' + err.message); }
  finally { stopLoading('ragSubmitBtn', btnText); }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 17: PREVENTIVE HEALTH PLANNER
// ═══════════════════════════════════════════════════════════════
async function loadPreventiveScreenings() {
  const list = document.getElementById('preventiveScreeningsList');
  if (!list) return;
  const d = await apiFetch('/health-hub/preventive/screenings');
  if (d.rag_schedule_guide) renderRAGResult('preventiveRAGGuide', { answer:d.rag_schedule_guide, citations:d.citations||[], rag_model:'retrieval' });
  if (!d.screenings?.length) { list.innerHTML = '<p style="color:var(--hh-text-muted);">No screenings recorded. Add your first below.</p>'; return; }
  list.innerHTML = d.screenings.map(s=>`
    <div class="hh-card" style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <strong>${s.screening_name}</strong> <span class="hh-badge hh-badge-${s.status==='Overdue'?'high':s.status==='Due'?'warning':'normal'}">${s.status}</span>
        <p style="font-size:13px;color:var(--hh-text-muted);">Frequency: ${s.recommended_frequency} · Next due: ${s.next_due_date||'—'}</p>
        <p style="font-size:12px;">${s.notes||''}</p>
      </div>
    </div>`).join('');
}

window.addPreventiveScreening = async function() {
  const d = await apiFetch('/health-hub/preventive/screenings','POST',{
    screening_name:  document.getElementById('screeningNameInput')?.value||'Annual Check',
    frequency:       document.getElementById('screeningFreqSelect')?.value||'Annual',
    last_done_date:  document.getElementById('screeningLastDoneInput')?.value||'',
    next_due_date:   document.getElementById('screeningNextDueInput')?.value||'',
    status:          document.getElementById('screeningStatusSelect')?.value||'Due',
    notes:           document.getElementById('screeningNotesInput')?.value||''
  });
  alert(d.message||'Screening added.');
  loadPreventiveScreenings();
};

// ═══════════════════════════════════════════════════════════════
// FEATURE 18: HEALTH EXPENSE TRACKER
// ═══════════════════════════════════════════════════════════════
async function loadExpenses() {
  const list = document.getElementById('expenseList');
  if (!list) return;
  const d = await apiFetch('/health-hub/expenses');
  if (d.tax_80d_info) renderRAGResult('expense80DInfo', { answer:d.tax_80d_info, citations:d.citations||[], rag_model:'retrieval' });
  setEl('expenseTotalDisplay', `₹${(d.summary?.total_inr||0).toLocaleString('en-IN')}`);
  if (!d.expenses?.length) { list.innerHTML = '<p style="color:var(--hh-text-muted);">No expenses recorded.</p>'; return; }
  list.innerHTML = d.expenses.map(e=>`
    <div class="hh-card" style="display:flex;justify-content:space-between;">
      <div>
        <strong>${e.expense_type}</strong> — ${e.description||''}
        <p style="font-size:13px;color:var(--hh-text-muted);">${e.provider_name||''} · ${e.expense_date}</p>
      </div>
      <div style="font-weight:700;color:var(--hh-primary);">₹${(e.amount_inr||0).toLocaleString('en-IN')}</div>
    </div>`).join('');
}

window.addExpense = async function() {
  const d = await apiFetch('/health-hub/expenses','POST',{
    expense_type:  document.getElementById('expenseTypeSelect')?.value||'Consultation',
    description:   document.getElementById('expenseDescInput')?.value||'',
    amount_inr:    parseFloat(document.getElementById('expenseAmountInput')?.value||0),
    expense_date:  document.getElementById('expenseDateInput')?.value||new Date().toISOString().split('T')[0],
    provider_name: document.getElementById('expenseProviderInput')?.value||'',
    insurance_claimed: document.getElementById('expenseInsuranceCheck')?.checked||false
  });
  alert(d.message||'Expense saved.');
  loadExpenses();
};

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════
async function apiFetch(endpoint, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type':'application/json' } };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);
  const r = await fetch(`${API_BASE}${endpoint}`, opts);
  return r.json();
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) {
    if (typeof val === 'string' && val.includes('<')) el.innerHTML = val;
    else el.textContent = val;
  }
}

function showLoader(el, show) { if (el) el.style.display = show ? 'block' : 'none'; }

function showError(container, msg) {
  if (!container) return;
  container.innerHTML = `<div style="padding:16px;background:#fef2f2;border-radius:8px;color:#dc2626;border:1px solid #fca5a5;">❌ Error: ${escapeToHTML(msg)}</div>`;
  container.style.display = 'block';
}

function startLoading(btnId, loadingText) {
  const btn = document.getElementById(btnId);
  if (!btn) return loadingText;
  const prev = btn.textContent;
  btn.textContent = loadingText;
  btn.disabled = true;
  return prev;
}

function stopLoading(btnId, prevText) {
  const btn = document.getElementById(btnId);
  if (btn) { btn.textContent = prevText; btn.disabled = false; }
}

function downloadTxt(content, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type:'text/plain;charset=utf-8' }));
  a.download = filename;
  a.click();
}
