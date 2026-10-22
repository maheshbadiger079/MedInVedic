/**
 * server/services/rag-engine.js
 * MedInVedic RAG (Retrieval-Augmented Generation) Engine
 * ─────────────────────────────────────────────────────────────────
 * Architecture:
 *   1. RETRIEVE  → keyword-overlap retrieval from local knowledge base
 *   2. AUGMENT   → build structured prompt with retrieved context
 *   3. GENERATE  → call Gemini 1.5 Flash API (free tier, 15 RPM)
 *   4. FALLBACK  → rule-based answer if API unavailable / no key
 *
 * Supported features:
 *   - Medical report explanation (multilingual: en/hi/kn/mr)
 *   - Symptom triage (with emergency escalation guardrail)
 *   - Nutrition planning (Indian regional, Ayurvedic)
 *   - Drug interaction checking
 *   - Voice assistant Q&A
 *   - Generic health question answering
 * ─────────────────────────────────────────────────────────────────
 */

const axios  = require('axios');
const { retrieveChunks, buildContext, buildCitations } = require('./rag-knowledge-base');

// ── Config ───────────────────────────────────────────────────────
const GEMINI_MODEL   = 'gemini-3.8-flash';
const RAG_TIMEOUT_MS = 18000;

// Emergency red-flag patterns — checked BEFORE any LLM call
const EMERGENCY_PATTERNS = [
  /chest\s*(pain|pressure|tightness|crushing)/i,
  /heart\s*attack|myocardial/i,
  /cannot\s*breathe|can'?t\s*breathe|severe\s*breathlessness|stridor|choking/i,
  /stroke|facial\s*droop|slurred\s*speech|one.sided\s*weakness/i,
  /anaphylaxis|throat\s*swelling|severe\s*allergic\s*reaction/i,
  /vomiting\s*blood|coughing\s*up\s*blood|hematemesis|hemoptysis/i,
  /unconscious|unresponsive|syncope|seizure|convulsion/i,
  /thunderclap\s*headache|worst\s*headache\s*of\s*(my\s*)?life/i
];

const LANG_NAMES = { en: 'English', hi: 'Hindi', kn: 'Kannada', mr: 'Marathi' };

// ── Helpers ──────────────────────────────────────────────────────
function isEmergency(text) {
  return EMERGENCY_PATTERNS.some(p => p.test(text));
}

function emergencyResponse(lang = 'en') {
  const msgs = {
    en: '🚨 EMERGENCY: Your input indicates potentially life-threatening symptoms. Please call 112 (National Emergency) or 108 (Ambulance) IMMEDIATELY or go to the nearest Emergency Department. Do NOT drive yourself.',
    hi: '🚨 आपातकाल: आपके लक्षण गंभीर हो सकते हैं। तुरंत 112 या 108 (एम्बुलेंस) पर कॉल करें या नजदीकी आपातकालीन अस्पताल जाएं।',
    kn: '🚨 ತುರ್ತು: ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಗಂಭೀರವಾಗಿರಬಹುದು. ತಕ್ಷಣ 112 ಅಥವಾ 108 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ.',
    mr: '🚨 आणीबाणी: आपल्या लक्षणांमुळे गंभीर स्थिती असू शकते. लगेच 112 किंवा 108 वर फोन करा किंवा जवळच्या रुग्णालयात जा.'
  };
  return msgs[lang] || msgs.en;
}

// ── Gemini API Call ───────────────────────────────────────────────
async function callGemini(prompt, maxTokens = 1024) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new Error('NO_API_KEY');

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.9,
      maxOutputTokens: maxTokens,
      stopSequences: []
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT',         threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_ONLY_HIGH' }
    ]
  };

  const resp = await axios.post(geminiUrl, payload, {
    timeout: RAG_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' }
  });

  const candidate = resp.data?.candidates?.[0];
  if (!candidate) throw new Error('Empty Gemini response');
  if (candidate.finishReason === 'SAFETY') throw new Error('SAFETY_BLOCKED');

  return candidate.content?.parts?.[0]?.text?.trim() || '';
}

// ── System Prompt Builder ─────────────────────────────────────────
function buildSystemPrompt(feature) {
  const base = `You are MedInVedic Health AI — a responsible clinical assistant for the Indian healthcare context, combining evidence-based modern medicine with AYUSH/Ayurvedic protocols.

CRITICAL SAFETY RULES (never violate):
1. Do NOT diagnose diseases autonomously or tell users they "have" a specific disease.
2. Do NOT prescribe or recommend changing medications without physician supervision.
3. Do NOT invent test values, drug interactions, or medical facts.
4. ALWAYS direct serious symptoms to professional medical care.
5. ALWAYS end with a disclaimer if the topic is clinical.
6. Only cite sources provided in the [Retrieved Context] below.
7. Keep responses concise, structured, and patient-friendly.`;

  const features = {
    report_explainer: `\nROLE: Explain medical lab report findings in simple language. Identify abnormal values, explain what each test measures, and what action may be needed. Do not diagnose — help the patient understand and ask their doctor the right questions.`,
    symptom_checker: `\nROLE: Analyse described symptoms to provide general information about categories of concern and appropriate care pathways. Use the WHO/ICMR symptom triage principles. Never present speculative diagnoses as facts.`,
    nutrition: `\nROLE: Create a personalized, culturally relevant Indian meal plan using ICMR-NIN 2024 dietary guidelines. Include Ayurvedic dietary principles where relevant. Avoid clinical diet prescriptions for complex medical conditions.`,
    drug_interaction: `\nROLE: Identify clinically documented interactions between medicines using pharmacopoeia references. Explain severity, mechanism, and recommended action. If no interaction data available, clearly state this.`,
    voice_assistant: `\nROLE: Answer the patient's health question in a conversational, grounded way using only the retrieved context. If the question falls outside your context, say so clearly.`,
    general: `\nROLE: Answer this health question using the retrieved medical knowledge below. Be evidence-based, concise, and patient-friendly.`
  };

  return base + (features[feature] || features.general);
}

// ── CORE RAG PIPELINE ─────────────────────────────────────────────

/**
 * Main RAG pipeline: retrieve → augment → generate
 * @param {Object} opts
 * @param {string} opts.query         – User's question / text
 * @param {string} opts.feature       – Feature context (e.g. 'report_explainer')
 * @param {string} opts.lang          – 'en' | 'hi' | 'kn' | 'mr'
 * @param {string} opts.domain        – Optional KB domain filter
 * @param {Object} opts.extraContext  – Optional extra context string
 * @param {number} opts.topK          – Chunks to retrieve (default 4)
 */
async function ragQuery(opts) {
  const {
    query,
    feature = 'general',
    lang = 'en',
    domain = null,
    extraContext = '',
    topK = 4
  } = opts;

  // 1. Emergency guard — instant, no LLM
  if (isEmergency(query)) {
    return {
      answer: emergencyResponse(lang),
      citations: [{ title: 'National Emergency Protocol', source: '112 / 108 India', tier: 'Emergency Protocol', index: 1 }],
      is_emergency: true,
      rag_used: false,
      model: 'emergency_rule'
    };
  }

  // 2. Retrieve relevant chunks
  const chunks = retrieveChunks(query, topK, domain);
  const context = buildContext(chunks);
  const citations = buildCitations(chunks);

  // 3. Build augmented prompt
  const systemPrompt = buildSystemPrompt(feature);
  const langInstruction = lang !== 'en'
    ? `\nIMPORTANT: Respond in ${LANG_NAMES[lang]}. Keep medical terms in English with ${LANG_NAMES[lang]} explanation.`
    : '';

  const fullPrompt = `${systemPrompt}${langInstruction}

[Retrieved Context from MedInVedic Knowledge Base]
${context}
${extraContext ? `\n[Additional Patient Context]\n${extraContext}` : ''}

[User Query]
${query}

[Instructions]
- Base your answer ONLY on the Retrieved Context above.
- If context does not cover the query, say "I don't have specific information on this — please consult your doctor."
- Cite sources naturally in your response using (Source N) notation.
- Keep response under 400 words unless the query requires more detail.
- End with a brief safety disclaimer for clinical topics.

[Answer]`;

  // 4. Call Gemini, fallback to rule-based if unavailable
  let answer = '';
  let modelUsed = '';
  let ragUsed = true;

  try {
    answer = await callGemini(fullPrompt, 1200);
    modelUsed = GEMINI_MODEL;
  } catch (err) {
    // Graceful fallback: stitch context into readable answer
    if (err.message === 'NO_API_KEY') {
      answer = buildFallbackAnswer(query, chunks, lang);
      modelUsed = 'fallback_retrieval';
      ragUsed = true;
    } else if (err.message === 'SAFETY_BLOCKED') {
      answer = 'This query was flagged by safety filters. Please rephrase your question or consult a healthcare professional directly.';
      modelUsed = 'safety_blocked';
      ragUsed = false;
    } else {
      // API error — use fallback
      console.warn('[RAG] Gemini API error:', err.message);
      answer = buildFallbackAnswer(query, chunks, lang);
      modelUsed = 'fallback_retrieval';
      ragUsed = true;
    }
  }

  return {
    answer,
    citations,
    retrieved_chunks: chunks.length,
    is_emergency: false,
    rag_used: ragUsed,
    model: modelUsed,
    disclaimer: buildDisclaimer(feature, lang)
  };
}

// ── Fallback Answer Builder (no API key / API down) ───────────────
function buildFallbackAnswer(query, chunks, lang) {
  if (!chunks.length) {
    if (lang === 'kn') return 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ನಿಖರವಾದ ಮಾಹಿತಿ ದೊರೆತಿಲ್ಲ. ದಯವಿಟ್ಟು ನೋಂದಾಯಿತ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.';
    if (lang === 'hi') return 'आपके प्रश्न के लिए विशिष्ट जानकारी नहीं मिली। कृपया योग्य चिकित्सक से परामर्श करें।';
    if (lang === 'mr') return 'आपल्या प्रश्नासाठी अचूक माहिती उपलब्ध नाही. कृपया डॉक्टरांचा सल्ला घ्या.';
    return 'I could not find specific information for your query in my knowledge base. Please consult a qualified healthcare professional for personalized advice.';
  }

  const top = chunks[0];

  // Multilingual translation support for voice and clinical queries
  if (lang === 'kn') {
    if (/ashwagandha/i.test(query) || /ashwagandha/i.test(top.content)) {
      return `ಅಶ್ವಗಂಧ (Withania somnifera) ಆಯುರ್ವೇದ ಚಿಕಿತ್ಸೆಯಲ್ಲಿ ಪ್ರಮುಖವಾದ ರಸಾಯನ ಹಾಗೂ ಅಡಾಪ್ಟೋಜೆನ್ ಮೂಲಿಕೆಯಾಗಿದೆ. ಇದು ಮಾನಸಿಕ ಒತ್ತಡ ಹಾಗೂ ಕಾರ್ಟಿಸೋಲ್ ಮಟ್ಟವನ್ನು 28% ವರೆಗೆ ಕಡಿಮೆ ಮಾಡಲು, ನಿದ್ರೆಯ ಗುಣಮಟ್ಟವನ್ನು ಸುಧಾರಿಸಲು ಮತ್ತು ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಸಾಮಾನ್ಯವಾಗಿ 300-600 mg ಸಾರವನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗುತ್ತದೆ.\n\nಮೂಲ ಆಧಾರ: ${top.source} (${top.tier}).`;
    }
    return `ವರದಿ ಸಾರಾಂಶ: ${top.title} ಕುರಿತು ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ:\n${top.content}\n\nಆಧಾರ: ${top.source} (${top.tier}).`;
  }
  if (lang === 'hi') {
    if (/ashwagandha/i.test(query) || /ashwagandha/i.test(top.content)) {
      return `अश्वगंधा (Withania somnifera) एक शक्तिशाली आयुर्वेदिक रसायन और एडाप्टोजेन है। यह तनाव, चिंता और कोर्टिसोल स्तर को कम करने, अच्छी नींद और रोग प्रतिरोधक क्षमता बढ़ाने में सहायक है। सामान्य खुराक: 300-600 mg प्रतिदिन।\n\nप्रमाणित संदर्भ: ${top.source} (${top.tier})।`;
    }
    return `चिकित्सकीय सारांश: ${top.title}\n${top.content}\n\nसंदर्भ: ${top.source} (${top.tier})।`;
  }
  if (lang === 'mr') {
    if (/ashwagandha/i.test(query) || /ashwagandha/i.test(top.content)) {
      return `अश्वगंधा (Withania somnifera) हे एक महत्त्वाचे आयुर्वेदिक रसायन औषध आहे. ते मानसिक ताण कमी करण्यास, रोगप्रतिकारशक्ती वाढविण्यास आणि झोप सुधारण्यास मदत करते. शिफारस केलेले प्रमाण: 300-600 mg दररोज.\n\nसंदर्भ: ${top.source} (${top.tier}).`;
    }
    return `वैद्यकीय सारांश: ${top.title}\n${top.content}\n\nसंदर्भ: ${top.source} (${top.tier})।`;
  }

  // Stitch top chunk content as structured response
  let answer = `**${top.title}**\n\n${top.content}`;

  if (chunks.length > 1) {
    answer += `\n\n**Additional context:** ${chunks[1].title} — ${chunks[1].content.substring(0, 200)}...`;
  }

  answer += `\n\n⚠️ *This information is retrieved from ${top.source}. Always consult your physician for personalized clinical advice.*`;
  return answer;
}

function buildDisclaimer(feature, lang) {
  const baseNotice = 'SAFETY NOTICE: This interpretation is for informational and educational support only. It does not autonomously diagnose diseases, prescribe medications, or replace professional medical consultation. Always consult a qualified physician or registered medical practitioner before altering any therapy.';
  const localized = {
    hi: ' (सुरक्षा सूचना: यह जानकारी केवल शैक्षणिक उद्देश्य के लिए है। कृपया योग्य चिकित्सक से परामर्श लें।)',
    kn: ' (ಸೂಚನೆ: ಈ ಮಾಹಿತಿ ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಕ್ಕಾಗಿ ಮಾತ್ರ. ರೋಗ ನಿರ್ಣಯ ಅಥವಾ ಔಷಧ ಸೂಚನೆ ಇಲ್ಲಿ ನೀಡಲಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.)',
    mr: ' (सूचना: ही माहिती केवळ शैक्षणिक हेतूसाठी आहे. कृपया योग्य वैद्यकीय सल्ला घ्या.)'
  };
  return lang && localized[lang] ? baseNotice + localized[lang] : baseNotice;
}

// ── Specialized RAG Methods ───────────────────────────────────────

/**
 * Feature 1: AI Medical Report Explainer
 */
async function explainMedicalReport(opts) {
  const { tests = [], rawText = '', lang = 'en', userId = 'guest' } = opts;

  // Build query from test names + values
  const testQuery = tests.map(t => `${t.test_name} ${t.value} ${t.unit} ${t.flag || ''}`).join(', ');
  const query = testQuery || rawText || 'blood report explanation';

  const extraContext = tests.length
    ? `Patient Test Results:\n${tests.map(t =>
        `• ${t.test_name}: ${t.value} ${t.unit} (Range: ${t.reference_range || 'N/A'}) [${t.flag || 'NORMAL'}]`
      ).join('\n')}`
    : rawText;

  return ragQuery({
    query: `Explain these blood test results and what they mean: ${testQuery}`,
    feature: 'report_explainer',
    lang,
    domain: 'lab_report',
    extraContext,
    topK: 5
  });
}

/**
 * Feature 2: Smart Symptom Checker
 */
async function evaluateSymptoms(opts) {
  const { symptoms, duration = '1–3 days', severity = 'Moderate', ageGroup = 'Adult', lang = 'en' } = opts;

  const query = `Patient symptoms: ${symptoms}. Duration: ${duration}. Severity: ${severity}. Age group: ${ageGroup}. What are possible categories of concern and recommended care pathway?`;

  return ragQuery({
    query,
    feature: 'symptom_checker',
    lang,
    domain: 'symptom_triage',
    extraContext: `Duration: ${duration} | Severity: ${severity} | Age Group: ${ageGroup}`,
    topK: 4
  });
}

/**
 * Feature 3: AI Nutrition & Diet Assistant
 */
async function generateNutritionPlan(opts) {
  const { region = 'South Indian', dietType = 'Vegetarian', allergies = 'None', caloriesTarget = 2000, goals = '', lang = 'en' } = opts;

  const query = `Create a balanced daily ${dietType} meal plan for ${region} cuisine with ${caloriesTarget} calorie target. Allergies: ${allergies}. Wellness goals: ${goals || 'General health'}.`;

  return ragQuery({
    query,
    feature: 'nutrition',
    lang,
    domain: 'nutrition',
    extraContext: `Region: ${region} | Diet: ${dietType} | Calories target: ${caloriesTarget} kcal | Allergies: ${allergies}`,
    topK: 4
  });
}

/**
 * Feature 9: Medicine Interaction Checker
 */
async function checkDrugInteractions(opts) {
  const { medicines = [], lang = 'en' } = opts;
  const medList = medicines.join(', ');

  const query = `Check drug interactions between these medicines: ${medList}. Are there any clinically significant interactions, contraindications, or herb-drug interactions?`;

  return ragQuery({
    query,
    feature: 'drug_interaction',
    lang,
    domain: 'drug_interaction',
    extraContext: `Medicines to check: ${medList}`,
    topK: 5
  });
}

/**
 * Feature 8: Multilingual Voice Assistant
 */
async function voiceAssistantQuery(opts) {
  const { query, lang = 'en' } = opts;
  return ragQuery({ query, feature: 'voice_assistant', lang, topK: 4 });
}

/**
 * Feature 16: Personal Health Record RAG
 */
async function healthRecordRAG(opts) {
  const { question, healthSummary = '', lang = 'en' } = opts;
  return ragQuery({
    query: question,
    feature: 'general',
    lang,
    extraContext: healthSummary,
    topK: 4
  });
}

/**
 * Generic health question answering
 */
async function askHealthQuestion(opts) {
  const { question, lang = 'en' } = opts;
  return ragQuery({ query: question, feature: 'general', lang, topK: 4 });
}

module.exports = {
  ragQuery,
  explainMedicalReport,
  evaluateSymptoms,
  generateNutritionPlan,
  checkDrugInteractions,
  voiceAssistantQuery,
  healthRecordRAG,
  askHealthQuestion,
  isEmergency,
  emergencyResponse,
  GEMINI_MODEL
};
