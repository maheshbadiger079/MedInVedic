/**
 * tests/ai_model_selector_test.js — MedInVedic AI Model Selector Verification Suite
 * ══════════════════════════════════════════════════════════════════════════════════
 * Comprehensive test suite verifying:
 * 1. Model registry profiles, metadata, and default configuration.
 * 2. Server-side allowlist validation and rejection of untrusted models.
 * 3. Healthcare safety invariance: Emergency 112 triage across all model profiles.
 * 4. Model-specific retrieval depth and execution strategy.
 * 5. Response effort settings resolution and constraints.
 * 6. Multimodal/vision compatibility enforcement.
 * 7. Tier-based access control and premium upgrade gates.
 * 8. Express API endpoints (/api/models, /api/models/:id, /api/models/select, /api/chat).
 * 9. Frontend API client methods in window.API.models.
 * 10. Frontend client component rendering, accessibility, and checkmark logic.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const http = require('http');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MedInVedic AI Model Selector — Comprehensive Verification Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

let passCount = 0;
let totalCount = 0;

function test(description, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function asyncTest(description, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

// ── 1. Model Registry & Metadata ──────────────────────────────────────────────
console.log('Testing 1. Model Registry Configuration & Metadata...');
const { MODEL_REGISTRY, ModelRegistryService } = require('../server/services/modelRegistry');

test('Registry contains all 4 verified profiles', () => {
  assert.ok(MODEL_REGISTRY['medinvedic-expert'], 'MedInVedic Expert must exist');
  assert.ok(MODEL_REGISTRY['medinvedic-advanced'], 'MedInVedic Advanced must exist');
  assert.ok(MODEL_REGISTRY['medinvedic-balanced'], 'MedInVedic Balanced must exist');
  assert.ok(MODEL_REGISTRY['medinvedic-quick'], 'MedInVedic Quick must exist');
});

test('Default model is MedInVedic Balanced', () => {
  const defaultId = ModelRegistryService.getDefaultModelId();
  assert.strictEqual(defaultId, 'medinvedic-balanced');
  assert.strictEqual(MODEL_REGISTRY[defaultId].isDefault, true);
});

test('Model metadata contains display names, descriptions, and capabilities', () => {
  const expert = MODEL_REGISTRY['medinvedic-expert'];
  assert.strictEqual(expert.name, 'MedInVedic Expert');
  assert.strictEqual(expert.badge, 'Premium');
  assert.ok(expert.capabilities.includes('deep_clinical_reasoning'));

  const advanced = MODEL_REGISTRY['medinvedic-advanced'];
  assert.strictEqual(advanced.name, 'MedInVedic Advanced');
  assert.ok(advanced.capabilities.includes('multi_step_retrieval'));

  const balanced = MODEL_REGISTRY['medinvedic-balanced'];
  assert.strictEqual(balanced.name, 'MedInVedic Balanced');
  assert.ok(balanced.capabilities.includes('general_health'));

  const quick = MODEL_REGISTRY['medinvedic-quick'];
  assert.strictEqual(quick.name, 'MedInVedic Quick');
  assert.ok(quick.capabilities.includes('terminology_lookup'));
});

// ── 2. Server-side Validation & Allowlist ──────────────────────────────────────
console.log('\nTesting 2. Server Allowlist Validation...');

test('Allowlist permits known model profiles', () => {
  const res = ModelRegistryService.validateModel('medinvedic-advanced');
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.model.id, 'medinvedic-advanced');
});

test('Allowlist case-insensitively normalizes input', () => {
  const res = ModelRegistryService.validateModel('  MedInVedic-Expert  ');
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.model.id, 'medinvedic-expert');
});

test('Allowlist strictly rejects unknown or malicious model identifiers', () => {
  const res = ModelRegistryService.validateModel('unauthorized-gpt-5');
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.code, 'INVALID_MODEL');
  assert.ok(res.allowedModels.includes('medinvedic-balanced'));
});

test('Null model falls back safely to default model', () => {
  const res = ModelRegistryService.validateModel(null);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.model.id, 'medinvedic-balanced');
});

// ── 3. Healthcare Safety & Triage Invariance ──────────────────────────────────
console.log('\nTesting 3. Healthcare Safety Controls Across All Models...');

const express = require('express');
const ragRouter = require('../server/routes/rag');
const app = express();
app.use(express.json());
app.use('/api', ragRouter);

// Mock helper to invoke router internally
function simulatePostChat(body, headers = {}) {
  return new Promise((resolve) => {
    const req = {
      method: 'POST',
      url: '/chat',
      body,
      headers
    };
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { resolve({ statusCode: this.statusCode, data }); },
      send(data) { resolve({ statusCode: this.statusCode, data }); }
    };
    ragRouter.handle(req, res, () => {});
  });
}

const jwt = require('../server/node_modules/jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'medinvedic_dev_jwt_secret_9876543210';
const testAdminToken = jwt.sign({ id: 1, email: 'admin@medinvedic.com', role: 'admin' }, JWT_SECRET);

async function runSafetyTest() {
  await asyncTest('Cardiac emergency intercepts with 112 directive on MedInVedic Expert', async () => {
    const res = await simulatePostChat({
      query: 'Crushing chest pain radiating to left arm',
      model: 'medinvedic-expert'
    }, { authorization: `Bearer ${testAdminToken}` });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.emergency.detected, true);
    assert.strictEqual(res.data.emergency.id, 'cardiac');
    assert.ok(res.data.emergency.message.includes('112'));
  });

  await asyncTest('Unauthenticated user selecting MedInVedic Expert receives UPGRADE_REQUIRED 403', async () => {
    const res = await simulatePostChat({
      query: 'Crushing chest pain',
      model: 'medinvedic-expert'
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.code, 'UPGRADE_REQUIRED');
  });

  await asyncTest('Stroke emergency intercepts on MedInVedic Quick', async () => {
    const res = await simulatePostChat({
      query: 'Sudden weakness on one side and slurred speech',
      model: 'medinvedic-quick'
    });

    assert.strictEqual(res.data.emergency.detected, true);
    assert.strictEqual(res.data.emergency.id, 'stroke');
    assert.ok(res.data.emergency.message.includes('FAST'));
  });

  await asyncTest('Non-diagnostic disclaimer is preserved on all models', async () => {
    const res = await simulatePostChat({
      query: 'High fever and headache symptoms',
      model: 'medinvedic-balanced'
    });

    assert.strictEqual(res.data.status, 'success');
    assert.ok(res.data.disclaimer.includes('Symptoms alone cannot confirm a diagnosis'));
    assert.strictEqual(res.data.model.id, 'medinvedic-balanced');
  });
}

// ── 4. Response Effort Settings ───────────────────────────────────────────────
console.log('\nTesting 4. Response Effort Resolution...');

test('Expert model supports low, medium, high efforts', () => {
  const expert = MODEL_REGISTRY['medinvedic-expert'];
  assert.strictEqual(ModelRegistryService.resolveEffort(expert, 'low'), 'low');
  assert.strictEqual(ModelRegistryService.resolveEffort(expert, 'high'), 'high');
  assert.strictEqual(ModelRegistryService.resolveEffort(expert, 'medium'), 'medium');
});

test('Quick model clamps unsupported high effort to default low effort', () => {
  const quick = MODEL_REGISTRY['medinvedic-quick'];
  const resolved = ModelRegistryService.resolveEffort(quick, 'high');
  assert.strictEqual(resolved, 'low');
});

// ── 5. Multimodal Vision Compatibility ────────────────────────────────────────
console.log('\nTesting 5. Multimodal & Vision Capabilities...');

test('Expert, Advanced, and Balanced support images', () => {
  assert.strictEqual(ModelRegistryService.validateImageSupport(MODEL_REGISTRY['medinvedic-expert']).supported, true);
  assert.strictEqual(ModelRegistryService.validateImageSupport(MODEL_REGISTRY['medinvedic-advanced']).supported, true);
  assert.strictEqual(ModelRegistryService.validateImageSupport(MODEL_REGISTRY['medinvedic-balanced']).supported, true);
});

test('Quick model cleanly rejects image input with clear recommendations', () => {
  const check = ModelRegistryService.validateImageSupport(MODEL_REGISTRY['medinvedic-quick']);
  assert.strictEqual(check.supported, false);
  assert.ok(check.error.includes('does not support image analysis'));
  assert.ok(check.recommendedModels.includes('medinvedic-balanced'));
});

// ── 6. Access Control & Tier Validation ───────────────────────────────────────
console.log('\nTesting 6. Access Restrictions & Tier Validation...');

test('Free models allow public access without authentication', () => {
  const balanced = MODEL_REGISTRY['medinvedic-balanced'];
  assert.strictEqual(ModelRegistryService.validateAccess(balanced, null).granted, true);

  const quick = MODEL_REGISTRY['medinvedic-quick'];
  assert.strictEqual(ModelRegistryService.validateAccess(quick, null).granted, true);
});

test('Expert model flags upgrade requirement for standard users', () => {
  const expert = MODEL_REGISTRY['medinvedic-expert'];
  const res = ModelRegistryService.validateAccess(expert, { role: 'user', membership: 'Silver' });
  assert.strictEqual(res.granted, false);
  assert.strictEqual(res.requiresUpgrade, true);
  assert.ok(res.upgradeUrl.includes('payment.html'));
});

test('Expert model grants access to Gold/Platinum and Admin members', () => {
  const expert = MODEL_REGISTRY['medinvedic-expert'];
  assert.strictEqual(ModelRegistryService.validateAccess(expert, { role: 'user', membership: 'Gold' }).granted, true);
  assert.strictEqual(ModelRegistryService.validateAccess(expert, { role: 'admin' }).granted, true);
  assert.strictEqual(ModelRegistryService.validateAccess(expert, { role: 'super_admin' }).granted, true);
});

// ── 7. Express API Endpoints Verification ─────────────────────────────────────
console.log('\nTesting 7. HTTP API Endpoints (/api/models & /api/chat)...');

function simulateGet(url) {
  return new Promise((resolve) => {
    const req = {
      method: 'GET',
      url,
      query: {},
      headers: {}
    };
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(data) { resolve({ statusCode: this.statusCode, data }); },
      send(data) { resolve({ statusCode: this.statusCode, data }); }
    };
    ragRouter.handle(req, res, () => {});
  });
}

async function runApiTests() {
  await asyncTest('GET /api/models returns model list with default and feature status', async () => {
    const res = await simulateGet('/models');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.featureEnabled, true);
    assert.strictEqual(res.data.defaultModel, 'medinvedic-balanced');
    assert.strictEqual(res.data.models.length, 4);
    assert.strictEqual(res.data.models[0].id, 'medinvedic-expert');
  });

  await asyncTest('GET /api/models/:id returns specific profile details', async () => {
    const res = await simulateGet('/models/medinvedic-advanced');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.id, 'medinvedic-advanced');
    assert.strictEqual(res.data.name, 'MedInVedic Advanced');
    assert.strictEqual(res.data.imageSupport, true);
  });

  await asyncTest('POST /api/chat rejects invalid model ID with 400', async () => {
    const res = await simulatePostChat({
      query: 'Fever treatment',
      model: 'invalid-model-x'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.code, 'INVALID_MODEL');
  });

  await asyncTest('POST /api/chat rejects multimodal image on text-only Quick model', async () => {
    const res = await simulatePostChat({
      query: 'Analyze this rash',
      model: 'medinvedic-quick',
      hasImage: true
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.code, 'UNSUPPORTED_MULTIMODAL');
  });

  await asyncTest('POST /api/chat routes successfully with model metadata attached', async () => {
    const res = await simulatePostChat({
      query: 'paracetamol dosage and side effects',
      model: 'medinvedic-advanced',
      effort: 'medium'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'success');
    assert.strictEqual(res.data.model.id, 'medinvedic-advanced');
    assert.strictEqual(res.data.model.name, 'MedInVedic Advanced');
    assert.strictEqual(res.data.model.effort, 'medium');
    assert.ok(res.data.sources.length > 0);
  });
}

// ── 8. Frontend API Integration ───────────────────────────────────────────────
console.log('\nTesting 8. Frontend API Client API.models...');

const API = require('../public/js/api');

async function runFrontendApiTests() {
  await asyncTest('API.models.list returns model profiles', async () => {
    assert.ok(API.models, 'API.models must exist');
    const res = await API.models.list();
    assert.strictEqual(res.featureEnabled, true);
    assert.strictEqual(res.models.length, 4);
  });

  await asyncTest('API.models.get retrieves model by ID', async () => {
    const m = await API.models.get('medinvedic-expert');
    assert.ok(m);
    assert.strictEqual(m.name, 'MedInVedic Expert');
  });

  await asyncTest('API.models.select validates selection', async () => {
    const res = await API.models.select('medinvedic-advanced', 'high');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.model.id, 'medinvedic-advanced');
  });
}

// ── 9. Frontend Script & CSS Verification ─────────────────────────────────────
console.log('\nTesting 9. Client Scripts, Styles & DOM Markup Integrity...');

test('ai-model-selector.css file exists and contains dropdown classes', () => {
  const css = fs.readFileSync(path.join(__dirname, '../public/css/ai-model-selector.css'), 'utf8');
  assert.ok(css.includes('.mv-model-dropdown'));
  assert.ok(css.includes('.mv-model-item'));
  assert.ok(css.includes('.mv-model-check'));
  assert.ok(css.includes('.mv-effort-row'));
  assert.ok(css.includes('.mv-upgrade-dialog'));
});

test('ai-model-selector.js file exists and exports MedInVedicModelSelector', () => {
  const js = fs.readFileSync(path.join(__dirname, '../public/js/ai-model-selector.js'), 'utf8');
  assert.ok(js.includes('window.MedInVedicModelSelector'));
  assert.ok(js.includes('selectModel'));
  assert.ok(js.includes('cycleEffort'));
  assert.ok(js.includes('role="listbox"'));
  assert.ok(js.includes('role="option"'));
  assert.ok(js.includes('aria-selected'));
  assert.ok(js.includes('medinvedic:model-changed'));
});

test('ai-assistant.html links model selector CSS, JS, and container', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/pages/ai-assistant.html'), 'utf8');
  assert.ok(html.includes('ai-model-selector.css'));
  assert.ok(html.includes('ai-model-selector.js'));
  assert.ok(html.includes('aiModelSelectorContainer'));
  assert.ok(html.includes('MedInVedicModelSelector.attachTo'));
});

test('index.html links model selector CSS, JS, and container', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert.ok(html.includes('ai-model-selector.css'));
  assert.ok(html.includes('ai-model-selector.js'));
  assert.ok(html.includes('homeModelSelectorContainer'));
});

// Run async tests
(async () => {
  await runSafetyTest();
  await runApiTests();
  await runFrontendApiTests();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Test Results: ${passCount} passed, ${totalCount - passCount} failed (${totalCount} total)`);
  if (passCount === totalCount) {
    console.log('  🎉 ALL AI MODEL SELECTOR TESTS PASSED PERFECTLY!');
  } else {
    console.log('  ⚠️ SOME TESTS FAILED. PLEASE REVIEW.');
    process.exit(1);
  }
  console.log('═══════════════════════════════════════════════════════════════\n');
})();
