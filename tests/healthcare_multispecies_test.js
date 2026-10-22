/**
 * tests/healthcare_multispecies_test.js
 * Verification test suite for MedInVedic Multi-Species Healthcare & Ayurveda Engine
 */

const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MedInVedic Multi-Species Healthcare & Ayurveda Test Suite');
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
    // 1. Taxonomy check
    console.log('Testing 1: Species & Healthcare Taxonomy endpoint...');
    const spRes = await request('GET', '/api/healthcare/species');
    assert(spRes.status === 200, 'HTTP status 200 returned');
    assert(spRes.body.healthcare_types.length === 3, 'Returns exactly 3 healthcare types (Human, Animal, Bird)');
    assert(spRes.body.species.animal.some(s => s.id === 'dog'), 'Animal taxonomy includes Dog');
    assert(spRes.body.species.animal.some(s => s.id === 'cat'), 'Animal taxonomy includes Cat');
    assert(spRes.body.species.bird.some(s => s.id === 'parrot'), 'Bird taxonomy includes Parrot');
    assert(spRes.body.species.bird.some(s => s.id === 'cockatiel'), 'Bird taxonomy includes Cockatiel');

    // 2. Strict species separation in medicines
    console.log('\nTesting 2: Strict Species Separation in Medicines Query...');
    const humRes = await request('GET', '/api/healthcare/medicines?healthcare_type=human');
    assert(humRes.body.medicines.every(m => m.healthcare_type === 'human'), 'Human query contains ONLY human medicines');
    assert(humRes.body.medicines.some(m => m.generic_name.includes('Paracetamol')), 'Human medicines include Paracetamol');

    const vetRes = await request('GET', '/api/healthcare/medicines?healthcare_type=animal&species=dog');
    assert(vetRes.body.medicines.every(m => m.healthcare_type === 'animal'), 'Veterinary query contains ONLY animal medicines');
    assert(vetRes.body.medicines.some(m => m.name.includes('Carprofen')), 'Canine medicines include Carprofen');
    assert(vetRes.body.medicines.every(m => m.species_compatibility.dog === true), 'All returned medicines are verified dog-compatible');

    const birdRes = await request('GET', '/api/healthcare/medicines?healthcare_type=bird&species=parrot');
    assert(birdRes.body.medicines.every(m => m.healthcare_type === 'bird'), 'Avian query contains ONLY bird medicines');
    assert(birdRes.body.medicines.some(m => m.name.includes('Enrofloxacin')), 'Avian medicines include Enrofloxacin');

    // 3. Cross-Species Toxicity Detection
    console.log('\nTesting 3: Cross-Species Toxicity Detection & Emergency Alert...');
    const toxicCat = await request('POST', '/api/healthcare/safety-check', {
      query: 'Can I give paracetamol to my cat for fever?',
      species: 'cat'
    });
    assert(toxicCat.body.safe === false, 'Cat paracetamol flagged as unsafe');
    assert(toxicCat.body.risk_level.includes('FATAL') || toxicCat.body.risk_level.includes('EMERGENCY'), 'Cat paracetamol categorized as fatal emergency');

    const toxicBird = await request('POST', '/api/healthcare/safety-check', {
      query: 'Can I use tea tree essential oil in my bird room?',
      species: 'bird'
    });
    assert(toxicBird.body.safe === false, 'Bird essential oil flagged as unsafe');
    assert(toxicBird.body.warning.includes('NOT SAFE'), 'Avian respiratory danger warning triggered');

    // 4. Safe Species Query Search
    console.log('\nTesting 4: Multi-Species Search with Required Context...');
    const searchRes = await request('POST', '/api/healthcare/search', {
      query: 'wound',
      healthcare_type: 'animal',
      species: 'dog'
    });
    assert(searchRes.body.success === true, 'Search returned success');
    assert(searchRes.body.results.some(r => r.name.includes('Scavon')), 'Found veterinary wound spray for dogs');

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Healthcare Test Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════════');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
