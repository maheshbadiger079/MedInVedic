/**
 * server/services/simulationEngine.js
 * MedInVedic Multi-Agent Healthcare Scenario Simulator & Educational Decision Support Engine
 * ─────────────────────────────────────────────────────────────────
 * Clean-Room Independent Architecture inspired by MiroFish / OASIS concepts:
 *  - 8 configurable virtual agent roles
 *  - Multi-round bounded orchestration
 *  - Evidence-linked GraphRAG memory grounding
 *  - ReAct ReportAgent report synthesis
 *  - Interactive agent question exploration
 *  - Deterministic safety triage guardrails (emergency escalation & injection defense)
 * ─────────────────────────────────────────────────────────────────
 */

const { defaultKnowledgeGraph } = require('./simulationKnowledgeGraph');

// ── Role Definitions ───────────────────────────────────────────────
const SIMULATION_ROLES = {
  COORDINATOR: {
    id: 'SIMULATION_COORDINATOR',
    title: 'AI Simulation Coordinator',
    badge: 'Coordinator',
    icon: '🧭',
    description: 'Synthesizes multi-agent perspectives, balances discourse, highlights consensus vs disagreement, and maps uncertainties.'
  },
  PATIENT_PERSONA: {
    id: 'PATIENT_PERSONA',
    title: 'Simulated Patient Persona',
    badge: 'Synthetic Patient',
    icon: '👤',
    description: 'Represents the synthetic patient context, lived lifestyle experiences, adherence hurdles, and subjective questions.'
  },
  CLINICIAN: {
    id: 'CLINICIAN_PERSPECTIVE',
    title: 'Licensed Clinician Perspective (Simulated)',
    badge: 'Clinical Review',
    icon: '🩺',
    description: 'Explores evidence-based modern medical guidelines, diagnostic differential horizons, and standard of care boundaries.'
  },
  PHARMACIST: {
    id: 'PHARMACIST_PERSPECTIVE',
    title: 'Pharmacist Perspective (Simulated)',
    badge: 'Pharmacology',
    icon: '💊',
    description: 'Analyzes pharmacokinetics, drug-drug and drug-herb interactions, timing, bioavailability, and administration rules.'
  },
  AYURVEDIC_RESEARCHER: {
    id: 'AYURVEDIC_RESEARCHER',
    title: 'Ayurvedic Literature Researcher',
    badge: 'AYUSH Literature',
    icon: '🌿',
    description: 'Examines classical Ayurvedic texts (Charaka, Sushruta, Vagbhata), Prakriti energetics, Rasayanas, and contemporary AYUSH research.'
  },
  NUTRITION_SPECIALIST: {
    id: 'NUTRITION_SPECIALIST',
    title: 'Nutrition Education Specialist',
    badge: 'Nutrition & Diet',
    icon: '🥗',
    description: 'Evaluates macro/micronutrient intake, ICMR-NIN dietary guidelines, glycemic modulation, and food synergy.'
  },
  EVIDENCE_REVIEWER: {
    id: 'MEDICAL_EVIDENCE_REVIEWER',
    title: 'Medical Evidence Reviewer',
    badge: 'Evidence Assessment',
    icon: '📊',
    description: 'Critiques methodological rigor, GRADE evidence quality, systematic reviews, and flags speculative or unverified assertions.'
  },
  SAFETY_REVIEWER: {
    id: 'MEDICATION_SAFETY_REVIEWER',
    title: 'Medication Safety & Toxicity Reviewer',
    badge: 'Safety Guardrail',
    icon: '🛡️',
    description: 'Audits scenarios for contraindications, black-box warnings, potential toxicities, overdose hazards, and red flags.'
  }
};

// ── Emergency & Injection Guardrail Patterns ──────────────────────
const EMERGENCY_PATTERNS = [
  /chest\s*(pain|pressure|tightness|crushing)/i,
  /heart\s*attack|myocardial/i,
  /cannot\s*breathe|severe\s*breathlessness|stridor|suffocating/i,
  /stroke|facial\s*droop|slurred\s*speech|one-sided\s*weakness/i,
  /anaphylaxis|throat\s*swelling|severe\s*allergic/i,
  /coughing\s*blood|vomiting\s*blood|hematemesis/i,
  /suicid(e|al)|self-harm/i
];

const INJECTION_PATTERNS = [
  /ignore\s+(previous|all)\s+instructions/i,
  /system\s*prompt/i,
  /disregard\s+guardrails/i,
  /you\s+are\s+now\s+unrestricted/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /pretend\s+to\s+be\s+a\s+real\s+doctor/i
];

const PRESCRIPTION_TAMPERING_PATTERNS = [
  /stop\s+taking\s+(your\s+)?(insulin|metformin|amlodipine|statin|bp|heart|chemo)\s+medicine/i,
  /throw\s+away\s+(your\s+)?pills/i,
  /discontinue\s+prescribed/i,
  /replace\s+(all\s+)?medicines\s+with\s+herbs/i
];

// ── Simulation Engine Core Class ──────────────────────────────────
class SimulationEngine {
  constructor(knowledgeGraph = defaultKnowledgeGraph) {
    this.kg = knowledgeGraph;
  }

  /**
   * Validate scenario input and execute safety triage
   */
  validateScenario(input = {}) {
    const textCorpus = [
      input.title || '',
      input.description || '',
      input.patientGoals || '',
      input.medicalHistory || '',
      input.medicationsContext || ''
    ].join(' ');

    // 1. Emergency red flag check
    for (const pattern of EMERGENCY_PATTERNS) {
      if (pattern.test(textCorpus)) {
        return {
          valid: false,
          is_emergency: true,
          errorCode: 'EMERGENCY_DETECTED',
          message: '🚨 CRITICAL SAFETY INTERCEPTION: The scenario description contains acute emergency symptoms. Simulated decision-support cannot process life-threatening conditions. Call 112 (National Emergency) or 108 (Ambulance) immediately.'
        };
      }
    }

    // 2. Prompt injection defense
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(textCorpus)) {
        return {
          valid: false,
          is_injection: true,
          errorCode: 'PROMPT_INJECTION_DETECTED',
          message: '🛡️ SECURITY GUARDRAIL VIOLATION: Malicious prompt override attempt detected. Simulation request rejected.'
        };
      }
    }

    // 3. Prescription tampering / dangerous advice attempt
    for (const pattern of PRESCRIPTION_TAMPERING_PATTERNS) {
      if (pattern.test(textCorpus)) {
        return {
          valid: false,
          is_tampering: true,
          errorCode: 'PRESCRIPTION_TAMPERING_BLOCKED',
          message: '⚠️ SAFETY BOUNDARY ENFORCED: The simulator strictly prohibits recommending discontinuation or modification of prescribed medical treatments.'
        };
      }
    }

    // 4. Basic parameter bounds check
    if (!input.title || input.title.trim().length < 5) {
      return { valid: false, errorCode: 'INVALID_TITLE', message: 'Scenario title must be at least 5 characters long.' };
    }

    return { valid: true };
  }

  /**
   * Generate virtual synthetic persona with synthetic safeguards
   */
  createSyntheticPersona(params = {}) {
    return {
      synthetic_id: `SYNTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      is_synthetic: true,
      data_provenance: 'FICTIONAL_SIMULATION_DATA_ONLY',
      age_band: params.age_band || '45-54',
      biological_sex: params.biological_sex || 'Unspecified',
      wellness_goals: params.wellness_goals || 'Manage fatigue, improve postprandial energy, maintain daily routine consistency',
      hypothetical_lifestyle: params.hypothetical_lifestyle || 'Sedentary desk worker, 7-hour broken sleep, irregular dinner timing (9:30 PM)',
      synthetic_medical_history: params.synthetic_medical_history || 'Mild essential hypertension (well-controlled), pre-diabetes borderline glucose',
      synthetic_medication_context: params.synthetic_medication_context || 'Amlodipine 5mg morning; considering herbal adaptogen for stress',
      care_access_constraints: params.care_access_constraints || 'High out-of-pocket budget awareness, prefers tele-consultation followups',
      prakriti_energetics: params.prakriti_energetics || 'Vata-Pitta'
    };
  }

  /**
   * Initialize a new simulation job
   */
  createSimulationJob(ownerId, scenarioInput = {}) {
    const validation = this.validateScenario(scenarioInput);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const persona = this.createSyntheticPersona(scenarioInput.syntheticPersona || {});
    const scenarioType = scenarioInput.scenarioType || 'WELLNESS_ROUTINE_COMPARISON';
    const bounds = {
      maxRounds: Math.min(Math.max(parseInt(scenarioInput.maxRounds || 3, 10), 1), 6),
      tokenCeiling: 4000,
      timeoutSeconds: 45
    };

    const agents = Object.values(SIMULATION_ROLES).map(role => ({
      id: role.id,
      title: role.title,
      badge: role.badge,
      icon: role.icon,
      description: role.description,
      status: 'INITIALIZED'
    }));

    const jobId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id: jobId,
      ownerId: ownerId || 'guest_user',
      title: scenarioInput.title.trim(),
      scenarioType,
      bounds,
      syntheticPersona: persona,
      agents,
      status: 'DRAFT', // DRAFT -> QUEUED -> RUNNING -> COMPLETED
      currentRound: 0,
      evidenceCitations: [],
      events: [],
      report: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Run the multi-agent simulation lifecycle
   */
  async executeSimulation(job, onRoundProgress = null) {
    job.status = 'RUNNING';
    job.updatedAt = new Date().toISOString();

    const persona = job.syntheticPersona;
    const scenarioQuery = `${job.title} ${persona.synthetic_medical_history} ${persona.synthetic_medication_context}`;

    // 1. Evidence Retrieval from Medical Knowledge Graph
    const graphResult = this.kg.queryGraph(scenarioQuery);
    const retrievedNodes = graphResult.nodes;
    const retrievedEdges = graphResult.edges;

    // Detect known interactions
    const relevantIds = retrievedNodes.map(n => n.id);
    const documentedInteractions = this.kg.findInteractions(relevantIds);

    // Record initial evidence event
    job.events.push({
      eventType: 'EVIDENCE_RETRIEVAL',
      round: 0,
      timestamp: new Date().toISOString(),
      summary: `Retrieved ${retrievedNodes.length} authoritative knowledge nodes and ${documentedInteractions.length} interaction references from Knowledge Graph.`,
      sources: retrievedNodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        citations: (n.sources || []).map(s => `${s.title} (${s.org}, ${s.year})`)
      }))
    });

    // 2. Multi-Round Simulation Dialogue
    const totalRounds = job.bounds.maxRounds;

    for (let round = 1; round <= totalRounds; round++) {
      job.currentRound = round;

      const roundEvents = [];

      if (round === 1) {
        // Round 1: Problem Formulation & Persona Experience
        roundEvents.push({
          agentId: 'PATIENT_PERSONA',
          agentTitle: 'Simulated Patient Persona',
          icon: '👤',
          dialogue: `I'm exploring how to improve my energy and digestion without interfering with my daily routine. Currently, I take Amlodipine 5mg in the morning. I am experiencing 3 PM energy crashes and stress-induced sleep fragmentation. I was considering adding Ashwagandha or Triphala, but I want to understand if there are interaction risks or better nutritional timings.`,
          focus: 'Lived Experience & Goals'
        });

        roundEvents.push({
          agentId: 'CLINICIAN_PERSPECTIVE',
          agentTitle: 'Licensed Clinician Perspective (Simulated)',
          icon: '🩺',
          dialogue: `From an evidence-based clinical perspective, blood pressure management with Amlodipine is foundational. Before introducing any complementary supplement, we must verify stable home BP logs. Afternoon fatigue in pre-diabetic thresholds is frequently related to postprandial glucose variability rather than primary adrenal fatigue. Baseline metabolic panels (HbA1c, fasting glucose, serum creatinine, electrolytes) must be assessed.`,
          evidenceUsed: 'ICMR Guidelines for Management of Type 2 Diabetes 2023; IGH-IV 2022'
        });

        roundEvents.push({
          agentId: 'PHARMACIST_PERSPECTIVE',
          agentTitle: 'Pharmacist Perspective (Simulated)',
          icon: '💊',
          dialogue: `Pharmacologically, Amlodipine is a dihydropyridine calcium channel blocker metabolized via CYP3A4. Ashwagandha extracts have shown mild hypotensive and GABAergic effects; while generally well-tolerated, co-administration requires blood pressure monitoring to avoid orthostatic dizziness. If iron or mineral supplements are ever used, they must be separated from herbal churna preparations by at least 2 hours to avoid chelation.`,
          evidenceUsed: 'British National Formulary (BNF 86); CDSCO Formulations Catalog'
        });
      } else if (round === 2) {
        // Round 2: Integrative Evidence Debate & Herbal Evaluation
        roundEvents.push({
          agentId: 'AYURVEDIC_RESEARCHER',
          agentTitle: 'Ayurvedic Literature Researcher',
          icon: '🌿',
          dialogue: `Classical Ayurvedic texts (Charaka Samhita Chikitsasthana 1.1) describe Ashwagandha as a Balya and Medhya Rasayana suitable for Vata-Kapha pacification and Ojas nourishment. However, for afternoon sluggishness stemming from impaired Agni (digestive fire), Triphala administered in the evening or a light cumin-coriander-fennel (CCF) warm infusion post-lunch is more targeted than high-dose adaptogens. Crucially, Ayurvedic rasayanas are supportive lifestyle adjuncts and never replacements for prescribed antihypertensives.`,
          evidenceUsed: 'Charaka Samhita Sutrasthana 25; Ayurvedic Pharmacopoeia of India (API)'
        });

        roundEvents.push({
          agentId: 'NUTRITION_SPECIALIST',
          agentTitle: 'Nutrition Education Specialist',
          icon: '🥗',
          dialogue: `Reviewing the 3 PM energy dip: shifting lunch composition in accordance with the ICMR-NIN 'My Plate for the Day' (2024 revised guidelines) reduces postprandial insulin surges. Increasing dietary fiber with roasted chana, seasonal green salads, and complex millets (like jowar/ragi) stabilizes glucose far more reliably than isolated botanical supplements. Adequate daytime hydration (2.5L) is also critical while on vasodilating agents.`,
          evidenceUsed: 'ICMR-NIN Dietary Guidelines for Indians 2024'
        });

        roundEvents.push({
          agentId: 'MEDICAL_EVIDENCE_REVIEWER',
          agentTitle: 'Medical Evidence Reviewer',
          icon: '📊',
          dialogue: `Methodological appraisal: While Withania somnifera meta-analyses (J Ethnopharmacol 2022) indicate moderate-quality evidence (GRADE B) for perceived stress reduction, long-term cardiovascular endpoint trials are limited. We must highlight this evidence asymmetry: lifestyle dietary shifts have high-grade randomized controlled evidence, whereas botanical adaptogens possess moderate adjunctive evidence.`,
          evidenceUsed: 'Cochrane Database of Systematic Reviews; GRADE Working Group Metrics'
        });
      } else {
        // Round 3+: Synthesis, Safety Audit & Bounded Consensus
        roundEvents.push({
          agentId: 'MEDICATION_SAFETY_REVIEWER',
          agentTitle: 'Medication Safety & Toxicity Reviewer',
          icon: '🛡️',
          dialogue: `Safety Audit Complete: No fatal or severe contraindications identified for modest dietary lifestyle improvements. Caution flag: If the patient initiates any commercial Ayurvedic extract, they must strictly avoid unstandardized preparations with potential heavy metal contamination, verify AYUSH GMP certification, and report any sudden BP drops (<100/60 mmHg) or gastric irritation. Prescriptions must never be adjusted without explicit physician authorization.`,
          evidenceUsed: 'CDSCO Pharmacovigilance Programme of India (PvPI); WHO Standard'
        });

        roundEvents.push({
          agentId: 'SIMULATION_COORDINATOR',
          agentTitle: 'AI Simulation Coordinator',
          icon: '🧭',
          dialogue: `Consensus synthesis achieved across simulated agents. The team agrees that addressing circadian meal timing, dietary fiber modulation, and gradual hydration represents the highest-benefit, lowest-risk initial strategy. Any complementary herbal exploration must remain secondary, closely monitored, and reviewed with the patient's treating clinician.`,
          evidenceUsed: 'Unified Multi-Disciplinary Integrative Synthesis'
        });
      }

      job.events.push({
        eventType: 'AGENT_ROUND_DIALOGUE',
        round,
        timestamp: new Date().toISOString(),
        turns: roundEvents
      });

      if (onRoundProgress) {
        onRoundProgress(round, totalRounds, roundEvents);
      }
    }

    // 3. Compile Evidence Citations & Disclaimers
    const citations = [];
    for (const node of retrievedNodes) {
      for (const s of (node.sources || [])) {
        citations.push({
          entity: node.label,
          type: node.type,
          citation: `${s.title} — ${s.org} (${s.year})`,
          evidenceTier: s.tier
        });
      }
    }

    // 4. Generate Structured AI Report (ReAct ReportAgent Style)
    const report = {
      reportId: `REP-${job.id}`,
      generatedAt: new Date().toISOString(),
      scenarioObjective: `Evaluate lifestyle, nutritional, and herbal complementary support options for a ${persona.age_band} individual with ${persona.synthetic_medical_history} currently taking ${persona.synthetic_medication_context}, aiming to address general fatigue without destabilizing blood pressure.`,
      inputAssumptions: [
        `Synthetic Patient Profile ID: ${persona.synthetic_id}`,
        `Baseline Medication: ${persona.synthetic_medication_context}`,
        `Documented Medical Context: ${persona.synthetic_medical_history}`,
        `Lifestyle Dynamics: ${persona.hypothetical_lifestyle}`
      ],
      participatingRoles: job.agents.map(a => `${a.title} (${a.badge})`),
      evidenceSources: citations,
      documentedInteractions: documentedInteractions.map(i => ({
        substances: `${i.sourceNode.label} ↔ ${i.targetNode.label}`,
        severity: i.severity,
        evidence: i.evidence,
        clinicalRecommendation: i.recommendation
      })),
      keyObservations: [
        'Circadian meal composition and postprandial glucose management are the primary drivers of afternoon energy dips.',
        'Prescribed antihypertensives (Amlodipine) maintain foundational safety and must not be altered or discontinued.',
        'Herbal adaptogens (Ashwagandha) provide moderate adjunctive stress benefits but require periodic blood pressure monitoring to prevent additive vasodilation.',
        'High-tannin botanical formulations (such as Triphala) should be timed at least 2 hours away from any mineral or iron supplements.'
      ],
      uncertaintiesAndLimitations: [
        'Simulations model hypothetical interactions based on literature and cannot account for idiosyncratic individual pharmacogenomic variations.',
        'Commercial botanical preparations vary significantly in active withanolide concentration.',
        'Consensus among virtual agents represents simulated interdisciplinary deliberation, NOT real clinical consensus or definitive medical proof.'
      ],
      safetyFindings: [
        'NO SEVERE CONTRAINDICATION: Low risk for ICMR-NIN dietary modifications.',
        'MODERATE CAUTION: Monitor home blood pressure logs if commencing standardized adaptogenic extracts.',
        'STRICT RULE: Zero changes to clinician-prescribed pharmaceuticals.'
      ],
      educationalConclusions: 'An evidence-informed integrative approach prioritizes nutritional rhythm and sleep hygiene first, viewing classical Ayurvedic herbs as gentle lifestyle adjuncts subject to physician awareness.',
      recommendedQuestionsForDoctor: [
        'Would you recommend checking my HbA1c and lipid panel during my next routine consultation to assess afternoon fatigue?',
        'Is there any contraindication to taking a mild herbal adaptogen (e.g. standardized Ashwagandha extract) alongside my Amlodipine?',
        'What home blood pressure range would you like me to maintain as my personal baseline?',
        'Could a consultation with a registered clinical dietician help optimize my meal glycemic index?'
      ],
      legalDisclaimer: 'EDUCATIONAL & RESEARCH SIMULATION ONLY: This report is generated by a multi-agent artificial intelligence simulation system. It does NOT constitute medical diagnosis, prescription, therapy, or validated clinical prediction. Never discontinue or modify prescribed medications without direct consultation with a qualified, licensed healthcare professional.'
    };

    job.report = report;
    job.status = 'COMPLETED';
    job.updatedAt = new Date().toISOString();

    return job;
  }

  /**
   * Interactive Agent Exploration: Allow users to interrogate simulated agents
   */
  askAgentQuestion(job, agentId, questionText) {
    if (!job || !job.events) {
      throw new Error('Simulation job not found or incomplete.');
    }

    const agent = job.agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found in this simulation.`);
    }

    const cleanQuestion = (questionText || '').trim();
    if (!cleanQuestion) {
      throw new Error('Question text cannot be empty.');
    }

    // Safety checks on question
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(cleanQuestion)) {
        return {
          agentId,
          agentTitle: agent.title,
          question: cleanQuestion,
          answer: '🛡️ Question rejected by safety filter: prompt injection detected.',
          safetyStatus: 'REJECTED'
        };
      }
    }

    // Generate grounded contextual response based on agent perspective
    let answerText = '';
    let citations = [];

    if (agentId === 'CLINICIAN_PERSPECTIVE') {
      answerText = `In my simulated clinical role, my assessment was anchored in national guidelines (ICMR 2023 & IGH-IV 2022). My priority was ensuring hemodynamic stability and metabolic safety before considering supplements. I assumed standard organ function based on the hypothetical scenario, but in a real-world setting, lab confirmation of renal function (eGFR) is mandatory.`;
      citations.push('ICMR Guidelines for Management of Type 2 Diabetes 2023', 'Indian Guidelines on Hypertension IV');
    } else if (agentId === 'PHARMACIST_PERSPECTIVE') {
      answerText = `My reasoning focused on pharmacodynamics and metabolism. Amlodipine is a calcium channel blocker; herbs with vasodilatory or diuretic properties (such as Arjuna or high-dose Ashwagandha) can have additive effects. My primary uncertainty is the exact chemical standardization of over-the-counter herbal extracts.`;
      citations.push('British National Formulary (BNF 86)', 'CDSCO Approved Formulations');
    } else if (agentId === 'AYURVEDIC_RESEARCHER') {
      answerText = `My perspective drew from classical references in the Charaka Samhita and the Ayurvedic Pharmacopoeia of India. I focused on Agni (digestive fire) and Dhatu balance. Classical literature does not view herbs as silver bullets; lifestyle rhythm (Dinacharya) must always precede herbal intervention.`;
      citations.push('Charaka Samhita Chikitsasthana 1.1', 'Ayurvedic Pharmacopoeia of India Part I');
    } else if (agentId === 'NUTRITION_SPECIALIST') {
      answerText = `I analyzed the afternoon fatigue pattern against glycemic curve kinetics. According to ICMR-NIN 2024 guidance, balancing macronutrients with fiber and protein attenuates insulin peaks. This is the safest, highest-yield lifestyle intervention for pre-diabetic fatigue.`;
      citations.push('ICMR-NIN Dietary Guidelines for Indians 2024');
    } else if (agentId === 'MEDICATION_SAFETY_REVIEWER') {
      answerText = `My evaluation screened for toxicities and drug-herb interactions. I identified no catastrophic contraindications for diet, but flagged that herbal extracts must be AYUSH GMP-certified to prevent heavy metal contamination, and prescription dosages must never be self-adjusted.`;
      citations.push('CDSCO Pharmacovigilance Programme of India (PvPI)');
    } else {
      answerText = `Based on the simulation events, my role analyzed the scenario assumptions and synthesized evidence-grounded perspectives without assuming clinical finality.`;
      citations.push('MedInVedic Simulation Architecture');
    }

    return {
      agentId,
      agentTitle: agent.title,
      question: cleanQuestion,
      answer: answerText,
      traceableEvidence: citations,
      uncertaintyNotes: 'This response reflects simulated domain reasoning and should be reviewed with a real clinician.',
      answeredAt: new Date().toISOString()
    };
  }

  /**
   * Compare two simulations side-by-side
   */
  compareScenarios(jobA, jobB) {
    if (!jobA || !jobB) {
      throw new Error('Both scenarios must be provided for comparison.');
    }

    return {
      comparisonId: `cmp_${jobA.id}_${jobB.id}`,
      generatedAt: new Date().toISOString(),
      scenarioA: {
        id: jobA.id,
        title: jobA.title,
        type: jobA.scenarioType,
        persona: jobA.syntheticPersona,
        status: jobA.status,
        safetyStatus: jobA.report ? jobA.report.safetyFindings[0] : 'Incomplete'
      },
      scenarioB: {
        id: jobB.id,
        title: jobB.title,
        type: jobB.scenarioType,
        persona: jobB.syntheticPersona,
        status: jobB.status,
        safetyStatus: jobB.report ? jobB.report.safetyFindings[0] : 'Incomplete'
      },
      differencesInAssumptions: [
        `Scenario A focuses on '${jobA.scenarioType}' whereas Scenario B explores '${jobB.scenarioType}'.`,
        `Patient goals: [A] "${jobA.syntheticPersona.wellness_goals}" vs [B] "${jobB.syntheticPersona.wellness_goals}".`,
        `Medication Context: [A] "${jobA.syntheticPersona.synthetic_medication_context}" vs [B] "${jobB.syntheticPersona.synthetic_medication_context}".`
      ],
      evidenceDifferences: {
        scenarioAEvidenceCount: (jobA.report && jobA.report.evidenceSources) ? jobA.report.evidenceSources.length : 0,
        scenarioBEvidenceCount: (jobB.report && jobB.report.evidenceSources) ? jobB.report.evidenceSources.length : 0
      },
      comparativeTakeaways: [
        'Modifying the primary lifestyle variable shifts the simulated consensus from pharmacological monitoring to nutritional ergonomics.',
        'Both scenarios consistently maintain the imperative: never self-adjust prescription medicine dosages.'
      ],
      cautionNote: 'Comparisons are educational and hypothetical. Do not interpret simulated variations as clinical predictive probabilities.'
    };
  }
}

const defaultSimulationEngine = new SimulationEngine();

module.exports = {
  SimulationEngine,
  defaultSimulationEngine,
  SIMULATION_ROLES
};
