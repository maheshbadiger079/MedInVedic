/**
 * rag-safety.js — MedInVedic Medical Safety Triage Module
 * ════════════════════════════════════════════════════════
 * Layer 1: Emergency symptom detection → immediate alert
 * Layer 2: Intent classification → route query correctly
 * Layer 3: Enforce non-diagnostic language guardrails
 */

const RAG_SAFETY = (function () {

  // ────────────────────────────────────────────────────────────
  // EMERGENCY DETECTION PATTERNS
  // ────────────────────────────────────────────────────────────
  const EMERGENCY_PATTERNS = [
    // Cardiac
    {
      id: "cardiac",
      triggers: [/chest\s+pain/i, /chest\s+tightness/i, /heart\s+attack/i, /crushing\s+chest/i, /pressure\s+in\s+chest/i, /left\s+arm\s+pain/i, /jaw\s+pain.*chest/i],
      message: "🚨 CARDIAC EMERGENCY: Chest pain with these characteristics could indicate a heart attack. Call 112 immediately. Do not drive yourself. Chew (do not swallow) aspirin if available and not allergic.",
      callToAction: "Call 112 Now",
      severity: "critical"
    },
    // Stroke
    {
      id: "stroke",
      triggers: [/sudden\s+weakness/i, /face\s+droop/i, /slurred\s+speech/i, /sudden\s+confusion/i, /arm\s+weak/i, /sudden\s+numbness/i, /can't\s+speak/i, /stroke/i, /FAST\s+stroke/i],
      message: "🚨 POSSIBLE STROKE: Use the FAST test — Face drooping, Arm weakness, Speech difficulty → TIME to call 112. Stroke treatment is time-critical. Call 112 immediately.",
      callToAction: "Call 112 Now",
      severity: "critical"
    },
    // Breathing emergency
    {
      id: "respiratory",
      triggers: [/can'?t\s+breathe/i, /unable\s+to\s+breathe/i, /difficulty\s+breathing/i, /severe\s+breathlessness/i, /gasping/i, /choking/i, /anaphylaxis/i, /throat\s+swelling/i, /throat\s+closing/i],
      message: "🚨 BREATHING EMERGENCY: Severe difficulty breathing or throat swelling can be life-threatening. Call 112 immediately. If anaphylaxis is suspected and an EpiPen is available, use it now.",
      callToAction: "Call 112 Now",
      severity: "critical"
    },
    // Anaphylaxis
    {
      id: "anaphylaxis",
      triggers: [/anaphylaxis/i, /severe\s+allerg/i, /epipen/i, /throat.*closing/i, /face.*swelling.*breathing/i, /hives.*breathing/i],
      message: "🚨 ANAPHYLAXIS: Severe allergic reaction is a life-threatening emergency. Use epinephrine auto-injector (EpiPen) if available. Call 112 immediately.",
      callToAction: "Call 112 Now",
      severity: "critical"
    },
    // Uncontrolled bleeding
    {
      id: "bleeding",
      triggers: [/uncontrolled\s+bleeding/i, /won'?t\s+stop\s+bleed/i, /heavy\s+bleeding/i, /blood\s+in\s+vomit/i, /vomiting\s+blood/i, /coughing\s+blood/i, /black\s+tarry\s+stool/i],
      message: "🚨 SEVERE BLEEDING: Uncontrolled or internal bleeding is a medical emergency. Apply firm pressure to visible wounds. Call 112 immediately.",
      callToAction: "Call 112 Now",
      severity: "critical"
    },
    // Poisoning / overdose
    {
      id: "poisoning",
      triggers: [/poisoning/i, /overdose/i, /took\s+too\s+many\s+pills/i, /swallowed\s+something/i, /intoxication/i],
      message: "🚨 POISONING / OVERDOSE: Call the Poison Control Centre or 112 immediately. Do not induce vomiting unless instructed by a medical professional.",
      callToAction: "Call 112 Now",
      severity: "critical"
    },
    // Mental health emergency
    {
      id: "mental_health_emergency",
      triggers: [/suicidal/i, /want\s+to\s+die/i, /kill\s+myself/i, /end\s+my\s+life/i, /self\s+harm/i],
      message: "🧠 MENTAL HEALTH CRISIS: You are not alone. Please reach out for immediate support. iCall India: 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7). If you are in immediate danger, call 112.",
      callToAction: "Call iCall: 9152987821",
      severity: "critical"
    },
    // High fever emergency
    {
      id: "high_fever_emergency",
      triggers: [/fever.*convuls/i, /seizure.*fever/i, /fever.*stiff\s+neck/i, /very\s+high\s+fever.*confus/i, /103\s*f.*confus/i, /104\s*f/i, /105\s*f/i, /40\.5.*degree/i, /41\s+degree/i],
      message: "⚠️ HIGH FEVER WARNING: Fever above 104°F (40°C) with confusion, seizures, or stiff neck requires emergency medical attention. Call 112 or go to the emergency room immediately.",
      callToAction: "Seek Emergency Care",
      severity: "urgent"
    }
  ];

  // ────────────────────────────────────────────────────────────
  // INTENT CLASSIFICATION
  // ────────────────────────────────────────────────────────────
  const INTENT_PATTERNS = {
    SYMPTOM_INFORMATION: [/symptoms?\s+of/i, /signs?\s+of/i, /what\s+are\s+signs/i, /what\s+causes/i, /why\s+do\s+i\s+have/i, /i\s+have\s+(a\s+)?(fever|cough|cold|pain|ache|rash)/i],
    MEDICATION_INFORMATION: [/what\s+is\s+\w+\s+(used\s+for|for\s+)/i, /how\s+to\s+use/i, /dosage\s+of/i, /dose\s+of/i, /side\s+effects?\s+of/i, /can\s+i\s+take/i, /paracetamol|ibuprofen|metformin|aspirin/i],
    DRUG_INTERACTION: [/interact/i, /together\s+with/i, /mix.*medication/i, /take.*with.*medicine/i, /combination.*drug/i],
    HERBAL_REMEDY: [/herbal/i, /ayurvedic/i, /natural\s+remedy/i, /home\s+remedy/i, /ginger|turmeric|tulsi|ashwagandha|giloy|triphala|neem/i],
    EMERGENCY: [/emergency/i, /urgent/i, /call.*ambulance/i, /heart\s+attack/i, /stroke/i],
    DIAGNOSIS_REQUEST: [/do\s+i\s+have/i, /is\s+it\s+\w+/i, /i\s+think\s+i\s+have/i, /could\s+this\s+be/i, /diagnose/i],
    WELLNESS_INFORMATION: [/how\s+to\s+stay\s+healthy/i, /immunity\s+boost/i, /healthy\s+habits/i, /diet\s+for/i, /exercise\s+for/i],
    GENERAL_HEALTH: [/what\s+is\s+diabetes/i, /what\s+is\s+hypertension/i, /about\s+covid/i, /tell\s+me\s+about/i]
  };

  // ────────────────────────────────────────────────────────────
  // RESPONSE LANGUAGE GUARDRAILS
  // ────────────────────────────────────────────────────────────
  const FORBIDDEN_RESPONSE_PATTERNS = [
    /you\s+(definitely|certainly)\s+have/i,
    /you\s+are\s+diagnosed/i,
    /this\s+confirms\s+you\s+have/i,
    /it\s+is\s+(definitely|certainly)\s+\w+/i
  ];

  const NON_DIAGNOSTIC_DISCLAIMER = "These symptoms can occur with several conditions. Symptoms alone cannot confirm a diagnosis — clinical assessment and appropriate tests by a qualified healthcare provider are required.";

  const MEDICATION_DISCLAIMER = "This is general medication information. Individual prescribing, dosing adjustments, and contraindication assessment must be done by a licensed healthcare provider who knows your full medical history.";

  const HERBAL_DISCLAIMER = "Herbal and Ayurvedic remedies have varying levels of clinical evidence. 'Natural' does not mean safe for all individuals. Some may interact with medications or have contraindications. Consult a healthcare provider before starting any herbal supplement.";

  // ────────────────────────────────────────────────────────────
  // PUBLIC API
  // ────────────────────────────────────────────────────────────

  /**
   * Scan input for emergency patterns. Returns first match or null.
   */
  function detectEmergency(text) {
    const lowerText = text.toLowerCase();
    for (const pattern of EMERGENCY_PATTERNS) {
      const matched = pattern.triggers.some(re => re.test(lowerText));
      if (matched) {
        return {
          detected: true,
          id: pattern.id,
          message: pattern.message,
          callToAction: pattern.callToAction,
          severity: pattern.severity
        };
      }
    }
    return { detected: false };
  }

  /**
   * Classify the intent of the user query.
   */
  function classifyIntent(text) {
    const lowerText = text.toLowerCase();
    const scores = {};

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      scores[intent] = patterns.filter(re => re.test(lowerText)).length;
    }

    // Find the highest scoring intent
    let topIntent = "GENERAL_HEALTH";
    let topScore = 0;
    for (const [intent, score] of Object.entries(scores)) {
      if (score > topScore) {
        topScore = score;
        topIntent = intent;
      }
    }

    // Special case: empty or too short query
    if (text.trim().length < 3) {
      topIntent = "GENERAL_HEALTH";
    }

    return topIntent;
  }

  /**
   * Get appropriate disclaimer based on intent.
   */
  function getDisclaimerForIntent(intent) {
    switch (intent) {
      case "MEDICATION_INFORMATION":
      case "DRUG_INTERACTION":
        return MEDICATION_DISCLAIMER;
      case "HERBAL_REMEDY":
        return HERBAL_DISCLAIMER;
      case "DIAGNOSIS_REQUEST":
      case "SYMPTOM_INFORMATION":
        return NON_DIAGNOSTIC_DISCLAIMER;
      default:
        return NON_DIAGNOSTIC_DISCLAIMER;
    }
  }

  /**
   * Extract medical entities from text.
   */
  function extractEntities(text) {
    const entities = {
      symptoms: [],
      medications: [],
      conditions: [],
      bodyParts: []
    };

    const symptomWords = ["fever", "headache", "cough", "cold", "pain", "nausea", "vomiting", "diarrhea", "rash", "fatigue", "dizziness", "sore throat", "chest pain", "back pain", "abdominal pain", "joint pain"];
    const medicationWords = ["paracetamol", "ibuprofen", "aspirin", "metformin", "cetirizine", "omeprazole", "azithromycin", "dolo", "crocin", "antibiotics"];
    const conditionWords = ["fever", "dengue", "diabetes", "hypertension", "asthma", "migraine", "anxiety", "depression", "covid", "malaria", "typhoid"];
    const bodyPartWords = ["chest", "head", "stomach", "abdomen", "back", "throat", "heart", "lung", "liver", "kidney", "leg", "arm"];

    const lower = text.toLowerCase();

    symptomWords.forEach(s => { if (lower.includes(s)) entities.symptoms.push(s); });
    medicationWords.forEach(m => { if (lower.includes(m)) entities.medications.push(m); });
    conditionWords.forEach(c => { if (lower.includes(c)) entities.conditions.push(c); });
    bodyPartWords.forEach(b => { if (lower.includes(b)) entities.bodyParts.push(b); });

    return entities;
  }

  /**
   * Main triage assessment — runs all safety checks.
   */
  function assess(userQuery) {
    const emergency = detectEmergency(userQuery);
    const intent = classifyIntent(userQuery);
    const entities = extractEntities(userQuery);
    const disclaimer = getDisclaimerForIntent(intent);

    return {
      emergency,
      intent,
      entities,
      disclaimer,
      isSafe: !emergency.detected || emergency.severity !== "critical"
    };
  }

  /**
   * Classify risk level: LOW_RISK, MODERATE_RISK, HIGH_RISK, EMERGENCY
   */
  function classifyRisk(userQuery) {
    const assessment = assess(userQuery);
    let level = 'LOW_RISK';
    let isEmergency = false;
    if (assessment.emergency && assessment.emergency.detected) {
      level = 'EMERGENCY';
      isEmergency = true;
    } else if (assessment.intent === 'medication' || assessment.intent === 'interaction') {
      level = 'MODERATE_RISK';
    }
    return {
      level,
      isEmergency,
      ...assessment
    };
  }

  const exported = {
    assess,
    classifyRisk,
    detectEmergency,
    classifyIntent,
    extractEntities,
    getDisclaimerForIntent,
    NON_DIAGNOSTIC_DISCLAIMER,
    MEDICATION_DISCLAIMER,
    HERBAL_DISCLAIMER
  };

  return exported;
})();

if (typeof window !== "undefined") window.RAG_SAFETY = RAG_SAFETY;
if (typeof global !== "undefined") global.RAG_SAFETY = RAG_SAFETY;
if (typeof module !== "undefined" && module.exports) module.exports = RAG_SAFETY;
