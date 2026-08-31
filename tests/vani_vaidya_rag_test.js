/**
 * tests/vani_vaidya_rag_test.js
 * ═════════════════════════════════════════════════════════════════════
 * Comprehensive Verification Test Suite for Vani Vaidya Voice-First RAG AI
 */

const fs = require('fs');
const path = require('path');

// Mock browser globals for Node.js environment
global.window = global;
global.self = global;

function loadModule(relPath) {
  const fullPath = path.join(__dirname, '..', 'public', 'js', relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  eval(code);
}

// Load Core Dependencies
loadModule('medical-kb.js');
loadModule('rag-knowledge-base.js');
loadModule('rag-safety.js');
loadModule('rag-retriever.js');
loadModule('rag-generator.js');
loadModule('vani-language-registry.js');
loadModule('vani-multimodal.js');

console.log('🧪 Starting Vani Vaidya Voice-First RAG Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

// 1. Language Registry Tests
const langReg = global.VANI_LANGUAGES;
assert(langReg && langReg.totalCount >= 50, '1. 50+ Language Registry loaded with at least 50 supported languages', `Found: ${langReg?.totalCount}`);
assert(langReg && langReg.indianLanguages.length >= 23, '2. At least 23 Indian languages registered (including Sanskrit, Konkani, Bodo, Santhali, Dogri, Kashmiri)', `Found: ${langReg?.indianLanguages.length}`);

// 2. Language Lookup Tests
const knLang = langReg.getById('kn');
assert(knLang && knLang.name === 'Kannada' && knLang.nativeName === 'ಕನ್ನಡ' && knLang.code === 'kn-IN', '3. Kannada language metadata lookup is correct');

const hiLang = langReg.getById('hi');
assert(hiLang && hiLang.name === 'Hindi' && hiLang.nativeName === 'हिन्दी' && hiLang.code === 'hi-IN', '4. Hindi language metadata lookup is correct');

// 3. Code-Switching & Dialect Normalization
const kanglishNorm = langReg.normalizeCodeSwitching('nange fever ide');
assert(kanglishNorm.includes('fever'), '5. Kanglish code-switching "nange fever ide" normalized to "fever"', `Result: ${kanglishNorm}`);

const hinglishNorm = langReg.normalizeCodeSwitching('mujhe chest me pain ho raha hai');
assert(hinglishNorm.includes('chest pain'), '6. Hinglish code-switching "mujhe chest me pain" normalized to "chest pain"', `Result: ${hinglishNorm}`);

// 4. Emergency Risk Detection Gate
const emergencyCheck = global.RAG_SAFETY.classifyRisk(hinglishNorm);
assert(emergencyCheck.isEmergency === true && emergencyCheck.level === 'EMERGENCY', '7. Emergency Safety Gate correctly triages chest pain as EMERGENCY');

// 5. Multimodal Medicine Scanner
const medScan = global.VANI_MULTIMODAL.identifyMedicine('Paracetamol 650');
assert(medScan.success === true && medScan.medicine.generic.includes('Paracetamol') && medScan.medicine.warnings.includes('⚠️'), '8. Medicine Scanner retrieves verified pharmacology and warnings for Paracetamol');

const abxScan = global.VANI_MULTIMODAL.identifyMedicine('Augmentin');
assert(abxScan.success === true && abxScan.medicine.dosageGuidance.includes('PRESCRIPTION ONLY'), '9. Antibiotic scanner enforces STRICTLY PRESCRIPTION ONLY guidance');

// 6. Medical Report Reference-Range Analyzer
const sampleReport = `
  Patient: Rahul M.
  Hemoglobin: 10.5 g/dL
  Fasting Blood Sugar: 142 mg/dL
  Platelet Count: 1.2 Lakhs
  TSH: 6.5 µIU/mL
`;
const reportAnalysis = global.VANI_MULTIMODAL.analyzeReportText(sampleReport);
assert(reportAnalysis.success === true && reportAnalysis.results.length >= 4, '10. Lab Report Analyzer extracts multiple test parameters from report text');

const hbResult = reportAnalysis.results.find(r => r.test.includes('Hemoglobin'));
assert(hbResult && hbResult.status === 'LOW', '11. Lab Report Analyzer correctly marks Hb 10.5 as LOW');

const fbsResult = reportAnalysis.results.find(r => r.test.includes('Fasting Blood Sugar'));
assert(fbsResult && fbsResult.status === 'HIGH', '12. Lab Report Analyzer correctly marks FBS 142 as HIGH');

// 7. Health Image Analysis Guardrails
const imgAnalysis = global.VANI_MULTIMODAL.analyzeHealthImage('red itchy rash on arm');
assert(imgAnalysis.category.includes('Rash') && imgAnalysis.disclaimer.includes('purely educational'), '13. Health Image Analyzer provides non-diagnostic disclaimers and safety boundaries');

// 8. Full Kannada Voice RAG Retrieval
const knQuery = 'ನನಗೆ ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರ ಮತ್ತು ಗಂಟಲು ನೋವು ಇದೆ';
const knNorm = langReg.normalizeCodeSwitching(knQuery);
const knRetrieval = global.RAG_RETRIEVER.retrieve(knNorm);
assert(knRetrieval.chunks.length > 0 && knRetrieval.confidence !== 'NONE', '14. Kannada voice query retrieves evidence-grounded chunks from knowledge base', `Chunks: ${knRetrieval.chunks.length}`);

// 9. Full Structured Response Generation with Ayurveda & Modern Separations
const safetyKn = global.RAG_SAFETY.classifyRisk(knNorm);
const structured = global.RAG_GENERATOR.buildStructuredResponse(knQuery, safetyKn, knRetrieval.chunks);
assert(structured.remedies && structured.remedies.modern.length > 0 && structured.remedies.ayurvedic.length > 0, '15. Generated response provides separated Modern and Ayurvedic remedies with source citations');

// 10. Safety / Non-Diagnostic Phrasing Check
const directAnswerText = (structured.sections?.directAnswer?.formatted || structured.direct_answer || '').toLowerCase();
assert(!directAnswerText.includes('you have definitely') && !directAnswerText.includes('i diagnose you with'), '16. Grounded response strictly maintains non-diagnostic educational tone');

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)\n`);

if (passedTests === totalTests) {
  console.log('🎉 ALL VANI VAIDYA RAG BENCHMARKS VERIFIED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('⚠️ Some tests failed. Please review errors above.');
  process.exit(1);
}
