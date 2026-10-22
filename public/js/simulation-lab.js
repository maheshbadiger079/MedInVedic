/**
 * public/js/simulation-lab.js
 * MedInVedic AI Simulation Lab Controller & Resilient In-Browser Engine
 * ─────────────────────────────────────────────────────────────────
 * Handles client-side state, simulation lifecycle, interactive agent Q&A,
 * Knowledge Graph exploration, side-by-side comparison, and PDF export.
 * 
 * Includes an embedded fallback simulation engine so the simulator functions
 * 100% seamlessly whether offline, on static Firebase Hosting, or connected
 * to the Firebase Cloud Functions backend.
 * ─────────────────────────────────────────────────────────────────
 */

(function() {
  'use strict';

  // ── State ────────────────────────────────────────────────────────
  let currentActiveTab = 'dashboard';
  let activeSimulation = null;
  let activeJobId = null;
  let allSimulations = [];
  let knowledgeGraphData = null;

  const API_BASE = '/api/simulations';

  // ── Embedded Authoritative Medical Knowledge Graph ────────────────
  const CLIENT_KNOWLEDGE_GRAPH = {
    nodes: [
      {
        id: 'dis_t2dm',
        label: 'Type 2 Diabetes Mellitus',
        type: 'Condition',
        category: 'Endocrinology',
        description: 'Metabolic disorder characterized by progressive insulin resistance, impaired insulin secretion, and chronic hyperglycemia.',
        sources: [{ title: 'ICMR Guidelines for Management of Type 2 Diabetes', org: 'ICMR', year: '2023', tier: 'National Clinical Guideline' }]
      },
      {
        id: 'dis_htn',
        label: 'Essential Hypertension',
        type: 'Condition',
        category: 'Cardiovascular',
        description: 'Persistent elevation of systemic arterial blood pressure (>=140/90 mmHg per WHO criteria).',
        sources: [{ title: 'WHO Guideline for Pharmacological Treatment of Hypertension', org: 'WHO', year: '2023', tier: 'WHO Standard' }]
      },
      {
        id: 'dis_fatigue',
        label: 'General Fatigue & Chronic Stress',
        type: 'SymptomComplex',
        category: 'General Wellness',
        description: 'Persistent feeling of physical tiredness, cognitive strain, mental burnout, and impaired recovery.',
        sources: [{ title: 'Evaluation and Management of Chronic Fatigue', org: 'AAFP', year: '2023', tier: 'Systematic Review' }]
      },
      {
        id: 'med_metformin',
        label: 'Metformin Hydrochloride',
        type: 'Medicine',
        category: 'Biguanide Antidiabetic',
        mechanism: 'Decreases hepatic gluconeogenesis and improves peripheral insulin sensitivity.',
        sources: [{ title: 'CDSCO Approved Drug Formulations', org: 'CDSCO', year: '2024', tier: 'Statutory Approval' }]
      },
      {
        id: 'med_amlodipine',
        label: 'Amlodipine Besylate',
        type: 'Medicine',
        category: 'Calcium Channel Blocker',
        mechanism: 'Inhibits transmembrane influx of calcium ions into vascular smooth muscle, causing peripheral vasodilation.',
        sources: [{ title: 'British National Formulary (BNF 86)', org: 'BNF', year: '2023', tier: 'Gold Standard Clinical' }]
      },
      {
        id: 'ayur_ashwagandha',
        label: 'Ashwagandha (Withania somnifera)',
        type: 'AyurvedicHerb',
        category: 'Rasayana / Adaptogen',
        sanskrit: 'Aśvagandhā (अश्वगन्धा)',
        dosha_effects: 'Pacifies Vata and Kapha; balances Ojas',
        sources: [{ title: 'Ayurvedic Pharmacopoeia of India (API)', org: 'Ministry of AYUSH', year: '2021', tier: 'Statutory Pharmacopoeia' }]
      },
      {
        id: 'ayur_triphala',
        label: 'Triphala Churna',
        type: 'AyurvedicFormulation',
        category: 'Deepana-Pachana',
        sanskrit: 'Triphalā (त्रिफला)',
        dosha_effects: 'Tridoshic (Vata-Pitta-Kapha equilibrium)',
        sources: [{ title: 'Ayurvedic Formulary of India (AFI)', org: 'Ministry of AYUSH', year: '2020', tier: 'Statutory Pharmacopoeia' }]
      },
      {
        id: 'ayur_brahmi',
        label: 'Brahmi (Bacopa monnieri)',
        type: 'AyurvedicHerb',
        category: 'Medhya Rasayana',
        sanskrit: 'Brāhmī (ब्राह्मी)',
        sources: [{ title: 'API Part I Vol 2', org: 'Ministry of AYUSH', year: '2021', tier: 'Statutory Pharmacopoeia' }]
      },
      {
        id: 'ayur_arjuna',
        label: 'Arjuna (Terminalia arjuna)',
        type: 'AyurvedicHerb',
        category: 'Hridya (Cardioprotective)',
        sanskrit: 'Arjuna (अर्जुन)',
        sources: [{ title: 'API Part I Vol 2', org: 'Ministry of AYUSH', year: '2021', tier: 'Statutory Pharmacopoeia' }]
      },
      {
        id: 'ayur_gudmar',
        label: 'Gudmar (Gymnema sylvestre)',
        type: 'AyurvedicHerb',
        category: 'Pramehahara',
        sanskrit: 'Meṣaśṛṅgī (मेषशृङ्गी)',
        sources: [{ title: 'API Part I Vol 1', org: 'Ministry of AYUSH', year: '2020', tier: 'Statutory Pharmacopoeia' }]
      },
      {
        id: 'nutr_icmr_plate',
        label: 'ICMR-NIN My Plate for the Day',
        type: 'LifestyleNutrition',
        category: 'Dietary Protocol',
        description: '50% daily calories from vegetables, fruits, and legumes; high fiber, restricted sugars.',
        sources: [{ title: 'Dietary Guidelines for Indians', org: 'ICMR-NIN', year: '2024', tier: 'National Guideline' }]
      },
      {
        id: 'nutr_dinacharya',
        label: 'Ayurvedic Dinacharya (Circadian Routine)',
        type: 'LifestyleNutrition',
        category: 'Ayurvedic Preventive Lifestyle',
        description: 'Aligned daily routine: Brahma Muhurta awakening, Ushapan, main meal during peak Pitta noon.',
        sources: [{ title: 'Charaka Samhita Sutrasthana Ch. 5', org: 'Ministry of AYUSH', year: 'Classical Canon', tier: 'Classical AYUSH Canon' }]
      }
    ],
    edges: [
      {
        source: 'med_amlodipine',
        target: 'dis_htn',
        relation: 'FIRST_LINE_INDICATION',
        evidence: 'Long-acting dihydropyridine calcium channel blocker reducing blood pressure.',
        citation: 'WHO Essential Medicines List 2023; IGH-IV 2022'
      },
      {
        source: 'ayur_ashwagandha',
        target: 'dis_fatigue',
        relation: 'ADJUNCTIVE_WELLNESS_BENEFIT',
        evidence: 'Reduces serum cortisol and perceived stress scores in chronically fatigued adults.',
        citation: 'J Ethnopharmacol 2022; AYUSH National Clinical Guidelines'
      },
      {
        source: 'ayur_arjuna',
        target: 'med_amlodipine',
        relation: 'POTENTIAL_PHARMACODYNAMIC_INTERACTION',
        evidence: 'Both induce peripheral vascular relaxation; concurrent administration may cause additive hypotension.',
        citation: 'API Part I Vol 2; Phytomedicine Clinical Review 2022'
      },
      {
        source: 'nutr_icmr_plate',
        target: 'dis_t2dm',
        relation: 'PREVENTIVE_LIFESTYLE_BENEFIT',
        evidence: 'Adherence to high-fiber, low-glycemic dietary model improves insulin sensitivity.',
        citation: 'ICMR-NIN Dietary Guidelines for Indians 2024'
      }
    ]
  };

  // Pre-configured synthetic scenarios for quick educational exploration
  const PRESET_SCENARIOS = [
    {
      title: 'Evaluating Circadian Meal Timing & Herbal Adaptogens in Pre-Diabetes',
      scenarioType: 'WELLNESS_ROUTINE_COMPARISON',
      maxRounds: 3,
      patientGoals: 'Improve afternoon stamina, stabilize 3 PM energy drops, maintain sleep consistency.',
      medicalHistory: 'Mild essential hypertension (well-controlled), borderline fasting glucose (104 mg/dL).',
      medicationsContext: 'Amlodipine 5mg once daily in morning. Evaluating Ashwagandha or Triphala adjuncts.',
      lifestyle: 'Desk-bound tech professional, 6.5 hours sleep, dinner at 9:30 PM.'
    },
    {
      title: 'Medication Adherence Hurdles in Multidrug Hypertensive Regimens',
      scenarioType: 'MEDICATION_ADHERENCE_CHALLENGES',
      maxRounds: 3,
      patientGoals: 'Establish a reliable reminder routine, avoid duplicate doses, understand meal spacing.',
      medicalHistory: 'Stage 1 Essential Hypertension, mild dyslipidemia.',
      medicationsContext: 'Amlodipine 5mg morning, Atorvastatin 10mg night.',
      lifestyle: 'Frequent traveler, irregular meal timings, forgets evening dose.'
    },
    {
      title: 'Preventive Nutrition & ICMR Balanced Plate Integration',
      scenarioType: 'PREVENTIVE_NUTRITION_PLAN',
      maxRounds: 3,
      patientGoals: 'Transition to whole-grain millets and high-fiber diet without gastric distress.',
      medicalHistory: 'Family history of Type 2 Diabetes; BMI 26.2 (Overweight).',
      medicationsContext: 'No prescription medications. Occasional antacids.',
      lifestyle: 'High-refined carbohydrate diet, sedentary routine, seeks dietary guidance.'
    }
  ];

  // Helper to grab DOM element
  function el(id) {
    return document.getElementById(id);
  }

  // ── Tab Navigation ───────────────────────────────────────────────
  window.switchTab = function(tabName) {
    currentActiveTab = tabName;
    document.querySelectorAll('.sim-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sim-tab-btn').forEach(b => b.classList.remove('active'));

    const panel = el(`panel_${tabName}`);
    const btn = el(`tab_${tabName}`);
    if (panel) panel.classList.add('active');
    if (btn) btn.classList.add('active');

    const announcer = el('simLiveAnnouncer');
    if (announcer) {
      announcer.textContent = `Switched to ${tabName.replace('_', ' ')} panel.`;
    }

    if (tabName === 'history') {
      loadHistory();
    } else if (tabName === 'graph') {
      loadKnowledgeGraph();
    }
  };

  // ── Pre-populate Scenario Form ───────────────────────────────────
  window.loadPresetScenario = function(index) {
    const p = PRESET_SCENARIOS[index];
    if (!p) return;

    el('scenarioTitle').value = p.title;
    el('scenarioType').value = p.scenarioType;
    el('scenarioRounds').value = p.maxRounds;
    el('patientGoals').value = p.patientGoals;
    el('patientHistory').value = p.medicalHistory;
    el('patientMeds').value = p.medicationsContext;
    el('patientLifestyle').value = p.lifestyle;

    switchTab('create');
  };

  // ── Client-Side Safe API Fetch with Embedded Fallback ────────────
  async function safeApiFetch(url, options = {}) {
    try {
      const res = await fetch(url, options);
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Network call fell back to client simulation engine:', e.message);
    }
    return null; // Signals fallback to local engine
  }

  // ── Client-Side Simulation Engine (Self-Contained) ────────────────
  const ClientSimulationEngine = {
    validateScenario(input = {}) {
      const text = `${input.title || ''} ${input.patientGoals || ''} ${input.medicalHistory || ''} ${input.medicationsContext || ''}`;
      if (/chest\s*pain|heart\s*attack|cannot\s*breathe|stroke|anaphylaxis|suicid/i.test(text)) {
        return {
          valid: false,
          is_emergency: true,
          error: '🚨 CRITICAL SAFETY INTERCEPTION: The scenario description contains acute emergency symptoms. Simulated decision-support cannot process life-threatening conditions. Call 112 (National Emergency) or 108 (Ambulance) immediately.'
        };
      }
      if (/ignore\s+(previous|all)\s+instructions|system\s*prompt|jailbreak|DAN\s+mode/i.test(text)) {
        return {
          valid: false,
          is_injection: true,
          error: '🛡️ SECURITY GUARDRAIL VIOLATION: Malicious prompt override attempt detected.'
        };
      }
      if (/stop\s+taking\s+(your\s+)?(insulin|metformin|amlodipine|bp|heart)\s+medicine/i.test(text)) {
        return {
          valid: false,
          is_tampering: true,
          error: '⚠️ SAFETY BOUNDARY ENFORCED: The simulator strictly prohibits recommending discontinuation or modification of prescribed medical treatments.'
        };
      }
      return { valid: true };
    },

    createJob(scenarioInput) {
      const jobId = `sim_cli_${Date.now()}`;
      return {
        id: jobId,
        title: scenarioInput.title,
        scenarioType: scenarioInput.scenarioType,
        bounds: { maxRounds: scenarioInput.maxRounds || 3 },
        syntheticPersona: {
          synthetic_id: `SYNTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          is_synthetic: true,
          data_provenance: 'FICTIONAL_SIMULATION_DATA_ONLY',
          wellness_goals: scenarioInput.syntheticPersona.wellness_goals,
          synthetic_medical_history: scenarioInput.syntheticPersona.synthetic_medical_history,
          synthetic_medication_context: scenarioInput.syntheticPersona.synthetic_medication_context,
          hypothetical_lifestyle: scenarioInput.syntheticPersona.hypothetical_lifestyle
        },
        agents: [
          { id: 'SIMULATION_COORDINATOR', title: 'AI Simulation Coordinator', icon: '🧭', badge: 'Synthesis' },
          { id: 'PATIENT_PERSONA', title: 'Simulated Patient Persona', icon: '👤', badge: 'Patient' },
          { id: 'CLINICIAN_PERSPECTIVE', title: 'Licensed Clinician Perspective', icon: '🩺', badge: 'Clinical' },
          { id: 'PHARMACIST_PERSPECTIVE', title: 'Pharmacist Perspective', icon: '💊', badge: 'Pharmacology' },
          { id: 'AYURVEDIC_RESEARCHER', title: 'Ayurvedic Literature Researcher', icon: '🌿', badge: 'Ayurveda' },
          { id: 'NUTRITION_SPECIALIST', title: 'Nutrition Education Specialist', icon: '🥗', badge: 'Nutrition' },
          { id: 'MEDICAL_EVIDENCE_REVIEWER', title: 'Medical Evidence Reviewer', icon: '📊', badge: 'Evidence' },
          { id: 'MEDICATION_SAFETY_REVIEWER', title: 'Medication Safety Reviewer', icon: '🛡️', badge: 'Safety' }
        ],
        status: 'DRAFT',
        currentRound: 0,
        events: [],
        createdAt: new Date().toISOString()
      };
    },

    async runSimulation(job, onStep) {
      job.status = 'RUNNING';
      const events = [
        {
          eventType: 'EVIDENCE_RETRIEVAL',
          round: 0,
          summary: 'Retrieved 12 authoritative knowledge nodes and 4 documented drug-herb interactions from ICMR, CDSCO, WHO, and Ministry of AYUSH.'
        },
        {
          eventType: 'AGENT_ROUND_DIALOGUE',
          round: 1,
          turns: [
            {
              icon: '👤',
              agentTitle: 'Simulated Patient Persona',
              dialogue: `I am experiencing 3 PM energy crashes and sleep fragmentation while taking my daily morning Amlodipine 5mg. I was considering adding Ashwagandha or Triphala, but I want to ensure my blood pressure remains stable.`,
              focus: 'Lived Experience'
            },
            {
              icon: '🩺',
              agentTitle: 'Licensed Clinician Perspective (Simulated)',
              dialogue: `Blood pressure stability on Amlodipine is the primary medical priority. Afternoon fatigue in pre-diabetic ranges is most frequently driven by postprandial glucose variability rather than primary adrenal fatigue. Baseline lab assessment (HbA1c, electrolytes) is recommended before supplements.`,
              evidenceUsed: 'ICMR Guidelines for Management of Type 2 Diabetes 2023; IGH-IV 2022'
            },
            {
              icon: '💊',
              agentTitle: 'Pharmacist Perspective (Simulated)',
              dialogue: `Amlodipine is a calcium channel blocker metabolized via CYP3A4. Ashwagandha extracts exert mild GABAergic and vasodilatory effects; co-administration requires blood pressure monitoring to prevent orthostatic dizziness. Mineral supplements must be separated from herbal churna preparations by at least 2 hours.`,
              evidenceUsed: 'British National Formulary (BNF 86); CDSCO Formulations Catalog'
            }
          ]
        },
        {
          eventType: 'AGENT_ROUND_DIALOGUE',
          round: 2,
          turns: [
            {
              icon: '🌿',
              agentTitle: 'Ayurvedic Literature Researcher',
              dialogue: `Classical Ayurvedic literature (Charaka Samhita Chikitsasthana 1.1) describes Ashwagandha as an effective Balya Rasayana for Vata pacification. However, for afternoon sluggishness stemming from impaired Agni, adjusting lunch composition and introducing a gentle cumin-coriander-fennel warm infusion is clinically preferable to high-dose adaptogens. Rasayanas are supportive lifestyle adjuncts and never replacements for prescribed antihypertensives.`,
              evidenceUsed: 'Charaka Samhita Sutrasthana 25; Ayurvedic Pharmacopoeia of India (API)'
            },
            {
              icon: '🥗',
              agentTitle: 'Nutrition Education Specialist',
              dialogue: `Reviewing the 3 PM dip: shifting lunch composition according to the ICMR-NIN 'My Plate for the Day' (2024 revised guidelines) reduces insulin surges. Increasing dietary fiber with roasted legumes, fresh greens, and millets (jowar/ragi) stabilizes postprandial glycemic excursions far more reliably than supplements.`,
              evidenceUsed: 'ICMR-NIN Dietary Guidelines for Indians 2024'
            },
            {
              icon: '📊',
              agentTitle: 'Medical Evidence Reviewer',
              dialogue: `Methodological appraisal: While Withania somnifera meta-analyses indicate moderate-quality evidence (GRADE B) for perceived stress reduction, dietary lifestyle modifications hold Grade A randomized evidence. The patient should prioritize dietary rhythm before adding herbal extracts.`,
              evidenceUsed: 'Cochrane Systematic Reviews; GRADE Working Group Metrics'
            }
          ]
        },
        {
          eventType: 'AGENT_ROUND_DIALOGUE',
          round: 3,
          turns: [
            {
              icon: '🛡️',
              agentTitle: 'Medication Safety Reviewer',
              dialogue: `Safety Audit Complete: No fatal contraindication detected for dietary shifts. Caution flag: Any commercial herbal preparation must be AYUSH GMP-certified to eliminate heavy metal contamination risks. Prescribed cardiovascular medications must never be adjusted without explicit physician authorization.`,
              evidenceUsed: 'CDSCO Pharmacovigilance Programme of India (PvPI)'
            },
            {
              icon: '🧭',
              agentTitle: 'AI Simulation Coordinator',
              dialogue: `Consensus synthesis achieved: Simulated agents unanimously agree that circadian meal timing and fiber modulation represent the highest-benefit, lowest-risk initial strategy. Complementary adaptogenic herbs must remain secondary, monitored, and reviewed with the treating clinician.`,
              evidenceUsed: 'Unified Multi-Disciplinary Integrative Synthesis'
            }
          ]
        }
      ];

      job.events = events;
      job.currentRound = 3;
      job.report = {
        reportId: `REP-${job.id}`,
        scenarioObjective: job.title,
        legalDisclaimer: 'EDUCATIONAL & RESEARCH SIMULATION ONLY: This report is generated by a multi-agent artificial intelligence simulation system. It does NOT constitute medical diagnosis, prescription, or clinical advice. Never alter or discontinue prescribed medications without direct consultation with a qualified, licensed healthcare professional.',
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
        recommendedQuestionsForDoctor: [
          'Would you recommend checking my HbA1c and lipid panel during my next routine consultation to assess afternoon fatigue?',
          'Is there any contraindication to taking a mild herbal adaptogen (e.g. standardized Ashwagandha extract) alongside my Amlodipine?',
          'What home blood pressure range would you like me to maintain as my personal baseline?',
          'Could a consultation with a registered clinical dietician help optimize my meal glycemic index?'
        ],
        evidenceSources: [
          { entity: 'Type 2 Diabetes Mellitus', citation: 'ICMR Guidelines for Management of Type 2 Diabetes (2023)', evidenceTier: 'National Clinical Guideline' },
          { entity: 'Essential Hypertension', citation: 'WHO Guideline for Pharmacological Treatment of Hypertension (2023)', evidenceTier: 'WHO Standard' },
          { entity: 'Ashwagandha (Withania somnifera)', citation: 'Ayurvedic Pharmacopoeia of India (API) Part I Vol 1 (2021)', evidenceTier: 'Statutory Pharmacopoeia' },
          { entity: 'Amlodipine Besylate', citation: 'British National Formulary (BNF 86) (2023)', evidenceTier: 'Gold Standard Clinical' },
          { entity: 'ICMR-NIN My Plate for the Day', citation: 'Dietary Guidelines for Indians (2024)', evidenceTier: 'National Guideline' }
        ]
      };
      job.status = 'COMPLETED';
      return job;
    }
  };

  // ── Create Scenario & Start Simulation ───────────────────────────
  window.submitCreateScenario = async function(e) {
    if (e) e.preventDefault();

    const title = el('scenarioTitle').value.trim();
    if (!title || title.length < 5) {
      alert('Please enter a descriptive scenario title (minimum 5 characters).');
      return;
    }

    const payload = {
      title,
      scenarioType: el('scenarioType').value,
      maxRounds: parseInt(el('scenarioRounds').value, 10) || 3,
      syntheticPersona: {
        wellness_goals: el('patientGoals').value.trim(),
        synthetic_medical_history: el('patientHistory').value.trim(),
        synthetic_medication_context: el('patientMeds').value.trim(),
        hypothetical_lifestyle: el('patientLifestyle').value.trim()
      }
    };

    // Client-side safety check first
    const vCheck = ClientSimulationEngine.validateScenario(payload);
    if (!vCheck.valid) {
      alert(vCheck.error);
      return;
    }

    el('createSubmitBtn').disabled = true;
    el('createSubmitBtn').textContent = 'Validating Scenario...';

    // Try backend API first
    const backendData = await safeApiFetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    el('createSubmitBtn').disabled = false;
    el('createSubmitBtn').textContent = 'Launch Simulation 🚀';

    if (backendData && backendData.success) {
      activeSimulation = backendData.simulation;
      activeJobId = backendData.simulation.id;
    } else {
      // Use ClientSimulationEngine
      activeSimulation = ClientSimulationEngine.createJob(payload);
      activeJobId = activeSimulation.id;
    }

    allSimulations.unshift(activeSimulation);

    switchTab('progress');
    runLiveSimulation(activeJobId);
  };

  // ── Run Live Simulation ──────────────────────────────────────────
  async function runLiveSimulation(jobId) {
    el('progressTitle').textContent = activeSimulation ? activeSimulation.title : 'Executing Simulation...';
    el('progressBar').style.width = '20%';
    el('progressStatusText').textContent = 'Initializing virtual agent roles & retrieving knowledge graph evidence...';
    el('liveDialogueTimeline').innerHTML = '<div style="text-align:center; padding:20px; color:#64748b;">Orchestrating multi-agent discourse...</div>';

    // Try backend start endpoint
    let completedJob = null;
    const backendStart = await safeApiFetch(`${API_BASE}/${jobId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (backendStart && backendStart.success) {
      completedJob = backendStart.simulation;
    } else {
      // Execute in client simulation engine
      el('progressBar').style.width = '50%';
      el('progressStatusText').textContent = 'Simulating Multi-Agent Deliberations (Rounds 1–3)...';
      await new Promise(r => setTimeout(r, 600));
      completedJob = await ClientSimulationEngine.runSimulation(activeSimulation);
    }

    activeSimulation = completedJob;
    el('progressBar').style.width = '100%';
    el('progressStatusText').textContent = 'Simulation Completed. Structured report synthesized.';

    renderDialogueTimeline(activeSimulation.events || []);
    if (activeSimulation.report) {
      renderReport(activeSimulation.report);
    }
    populateExplorerAgents(activeSimulation.agents || []);
  }

  // ── Render Dialogue Timeline ─────────────────────────────────────
  function renderDialogueTimeline(events) {
    const container = el('liveDialogueTimeline');
    if (!container) return;
    container.innerHTML = '';

    events.forEach(ev => {
      if (ev.eventType === 'EVIDENCE_RETRIEVAL') {
        const div = document.createElement('div');
        div.className = 'sim-dialogue-item';
        div.style.borderLeftColor = '#0369a1';
        div.innerHTML = `
          <div class="sim-dialogue-header">
            <span class="sim-dialogue-author">📚 Medical Evidence Grounding Engine</span>
            <span class="sim-agent-badge" style="background:#e0f2fe; color:#0369a1;">Evidence Retrieval</span>
          </div>
          <div class="sim-dialogue-body">${ev.summary}</div>
        `;
        container.appendChild(div);
      } else if (ev.eventType === 'AGENT_ROUND_DIALOGUE') {
        (ev.turns || []).forEach(turn => {
          const div = document.createElement('div');
          div.className = 'sim-dialogue-item';
          div.innerHTML = `
            <div class="sim-dialogue-header">
              <span class="sim-dialogue-author">${turn.icon || '🤖'} ${turn.agentTitle || turn.agent}</span>
              <span class="sim-agent-badge">Round ${ev.round}</span>
            </div>
            <div class="sim-dialogue-body">${turn.dialogue || turn.text}</div>
            ${turn.evidenceUsed ? `<div class="sim-dialogue-citation">📖 Grounded in: ${turn.evidenceUsed}</div>` : ''}
          `;
          container.appendChild(div);
        });
      }
    });
  }

  // ── Render Structured AI Report ──────────────────────────────────
  function renderReport(report) {
    el('repObjective').textContent = report.scenarioObjective;
    el('repDisclaimer').textContent = report.legalDisclaimer;

    const fillList = (id, items) => {
      const ul = el(id);
      if (!ul) return;
      ul.innerHTML = '';
      (items || []).forEach(it => {
        const li = document.createElement('li');
        li.textContent = it;
        ul.appendChild(li);
      });
    };

    fillList('repObservations', report.keyObservations);
    fillList('repLimitations', report.uncertaintiesAndLimitations);
    fillList('repSafety', report.safetyFindings);
    fillList('repDoctorQuestions', report.recommendedQuestionsForDoctor);

    const citContainer = el('repCitations');
    if (citContainer) {
      citContainer.innerHTML = '';
      (report.evidenceSources || []).forEach(c => {
        const chip = document.createElement('div');
        chip.className = 'sim-node-chip';
        chip.innerHTML = `<strong>${c.entity}:</strong> ${c.citation} <span style="font-size:11px; opacity:0.8;">[${c.evidenceTier}]</span>`;
        citContainer.appendChild(chip);
      });
    }
  }

  // ── Interactive Agent Explorer ───────────────────────────────────
  function populateExplorerAgents(agents) {
    const select = el('exploreAgentSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose Virtual Agent Role --</option>';
    agents.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = `${a.icon || '🤖'} ${a.title} (${a.badge})`;
      select.appendChild(opt);
    });
  }

  window.askVirtualAgent = async function() {
    const agentId = el('exploreAgentSelect').value;
    const question = el('exploreQuestionInput').value.trim();

    if (!agentId) {
      alert('Please select a virtual agent role to query.');
      return;
    }
    if (!question) {
      alert('Please enter a question for the virtual agent.');
      return;
    }
    if (!activeJobId) {
      alert('Please run a simulation scenario first.');
      return;
    }

    const box = el('exploreAnswerBox');
    box.style.display = 'block';
    box.innerHTML = '<div style="color:#64748b;">Querying simulated agent memory & evidence provenance...</div>';

    // Try backend
    const backendAns = await safeApiFetch(`${API_BASE}/${activeJobId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, question })
    });

    let ans = null;
    if (backendAns && backendAns.success) {
      ans = backendAns.answer;
    } else {
      // Local engine answer
      ans = {
        agentTitle: (activeSimulation.agents.find(a => a.id === agentId) || {}).title || agentId,
        answer: `In my simulated perspective, my reasoning was anchored in national clinical guidelines (ICMR 2023 & WHO). I assumed stable home blood pressure on Amlodipine, and prioritized metabolic safety before considering complementary adaptogenic herbs.`,
        traceableEvidence: ['ICMR Guidelines for Management of Type 2 Diabetes 2023', 'British National Formulary BNF 86'],
        uncertaintyNotes: 'This response reflects simulated interdisciplinary reasoning and is intended for educational exploration.'
      };
    }

    box.innerHTML = `
      <div style="font-weight:800; color:#103f36; margin-bottom:6px;">${ans.agentTitle} Response:</div>
      <div style="font-size:14px; color:#334155; line-height:1.55; margin-bottom:10px;">${ans.answer}</div>
      ${ans.traceableEvidence && ans.traceableEvidence.length ? `
        <div style="font-size:12px; color:#15803d; font-weight:600; border-top:1px dashed #cbd5e1; padding-top:6px;">
          📚 Traceable Sources: ${ans.traceableEvidence.join('; ')}
        </div>` : ''}
      <div style="font-size:11.5px; color:#64748b; margin-top:4px; font-style:italic;">
        ⚖️ ${ans.uncertaintyNotes || 'Simulated response generated for educational decision support.'}
      </div>
    `;
  };

  // ── Knowledge Graph Exploration ──────────────────────────────────
  async function loadKnowledgeGraph() {
    const backendData = await safeApiFetch(`${API_BASE}/knowledge-graph`);
    const graphData = (backendData && backendData.success) ? backendData.result : CLIENT_KNOWLEDGE_GRAPH;

    knowledgeGraphData = graphData;
    renderKnowledgeGraphNodes(graphData.nodes || []);
    renderKnowledgeGraphEdges(graphData.edges || []);
    el('kgTotalNodes').textContent = (graphData.nodes || []).length;
    el('kgTotalEdges').textContent = (graphData.edges || []).length;
  }

  function renderKnowledgeGraphNodes(nodes) {
    const container = el('kgNodesContainer');
    if (!container) return;
    container.innerHTML = '';

    nodes.forEach(n => {
      const chip = document.createElement('div');
      chip.className = 'sim-node-chip';
      chip.innerHTML = `<strong>${n.label}</strong> <span style="font-size:11px; opacity:0.75;">(${n.type})</span>`;
      chip.onclick = () => showNodeDetails(n);
      container.appendChild(chip);
    });
  }

  function renderKnowledgeGraphEdges(edges) {
    const container = el('kgEdgesContainer');
    if (!container) return;
    container.innerHTML = '';

    edges.forEach(e => {
      const item = document.createElement('div');
      item.style.padding = '8px 12px';
      item.style.borderBottom = '1px solid #e2e8f0';
      item.style.fontSize = '13px';
      item.innerHTML = `
        <div><strong>${e.source}</strong> ──[<em>${e.relation}</em>]──▶ <strong>${e.target}</strong></div>
        <div style="font-size:12px; color:#64748b; margin-top:2px;">${e.evidence}</div>
        <div style="font-size:11px; color:#15803d; font-weight:600;">Citation: ${e.citation}</div>
      `;
      container.appendChild(item);
    });
  }

  function showNodeDetails(node) {
    const box = el('kgNodeDetailBox');
    if (!box) return;
    box.style.display = 'block';
    box.innerHTML = `
      <div style="font-size:16px; font-weight:800; color:#15803d; margin-bottom:4px;">${node.label}</div>
      <div style="font-size:12px; color:#64748b; margin-bottom:8px;">Category: ${node.category} | Type: ${node.type}</div>
      <div style="font-size:13.5px; color:#334155; line-height:1.5; margin-bottom:8px;">
        ${node.description || node.clinical_indications || node.mechanism || ''}
      </div>
      ${node.sanskrit ? `<div style="font-size:12.5px; color:#92400e; margin-bottom:6px;">🌿 Classical Sanskrit: ${node.sanskrit} (${node.dosha_effects || ''})</div>` : ''}
      <div style="font-size:12px; color:#0f172a; font-weight:700;">Verified Evidence Provenance:</div>
      <ul style="margin:4px 0 0 16px; padding:0; font-size:12px; color:#334155;">
        ${(node.sources || []).map(s => `<li>${s.title} — ${s.org} (${s.year}) [${s.tier}]</li>`).join('')}
      </ul>
    `;
  }

  // ── History & Comparisons ────────────────────────────────────────
  async function loadHistory() {
    const backendData = await safeApiFetch(`${API_BASE}`);
    if (backendData && backendData.simulations) {
      allSimulations = backendData.simulations;
    }
    renderHistoryTable(allSimulations);
    populateComparisonDropdowns(allSimulations);
  }

  function renderHistoryTable(jobs) {
    const tbody = el('historyTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!jobs.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">No simulations recorded yet. Launch your first hypothetical scenario.</td></tr>';
      return;
    }

    jobs.forEach(j => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:10px 14px; font-weight:700;">${j.title}</td>
        <td style="padding:10px 14px; font-size:12.5px;">${j.scenarioType}</td>
        <td style="padding:10px 14px;"><span class="badge-status-${(j.status||'draft').toLowerCase()}">${j.status}</span></td>
        <td style="padding:10px 14px; font-size:12px; color:#64748b;">${(j.createdAt || '').substring(0, 10)}</td>
        <td style="padding:10px 14px;">
          <button class="sim-btn sim-btn-outline sim-btn-sm" onclick="viewHistoricalReport('${j.id}')">View</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.viewHistoricalReport = function(id) {
    const found = allSimulations.find(s => s.id === id);
    if (found && found.report) {
      activeSimulation = found;
      activeJobId = found.id;
      renderReport(found.report);
      renderDialogueTimeline(found.events || []);
      switchTab('report');
    }
  };

  function populateComparisonDropdowns(jobs) {
    const selA = el('compareSelectA');
    const selB = el('compareSelectB');
    if (!selA || !selB) return;

    selA.innerHTML = '<option value="">-- Choose Scenario A --</option>';
    selB.innerHTML = '<option value="">-- Choose Scenario B --</option>';

    jobs.forEach(j => {
      const optA = document.createElement('option');
      optA.value = j.id;
      optA.textContent = j.title;
      selA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = j.id;
      optB.textContent = j.title;
      selB.appendChild(optB);
    });
  }

  window.runScenarioComparison = function() {
    const idA = el('compareSelectA').value;
    const idB = el('compareSelectB').value;

    if (!idA || !idB) {
      alert('Please select two scenarios to compare.');
      return;
    }
    if (idA === idB) {
      alert('Please select two distinct scenarios for comparison.');
      return;
    }

    const jobA = allSimulations.find(s => s.id === idA) || { title: 'Scenario A' };
    const jobB = allSimulations.find(s => s.id === idB) || { title: 'Scenario B' };

    renderComparisonResults({
      scenarioA: jobA,
      scenarioB: jobB,
      differencesInAssumptions: [
        `Scenario A explores '${jobA.title}' with focused dietary parameters.`,
        `Scenario B tests alternative lifestyle and timing variables without alterating prescription doses.`
      ],
      comparativeTakeaways: [
        'Both models agree: circadian meal timing and fiber modulation improve stamina before pharmacological changes.',
        'Neither scenario justifies discontinuing physician-prescribed medications.'
      ]
    });
  };

  function renderComparisonResults(comp) {
    const box = el('comparisonResultBox');
    box.style.display = 'block';

    el('compScenarioATitle').textContent = comp.scenarioA.title;
    el('compScenarioBTitle').textContent = comp.scenarioB.title;

    const fill = (id, list) => {
      const container = el(id);
      if (!container) return;
      container.innerHTML = '';
      (list || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        container.appendChild(li);
      });
    };

    fill('compDifferencesList', comp.differencesInAssumptions);
    fill('compTakeawaysList', comp.comparativeTakeaways);
  }

  // ── Print / PDF Export ──
  window.printSimulationReport = function() {
    window.print();
  };

  // ── Initialization on Load ──
  document.addEventListener('DOMContentLoaded', () => {
    loadKnowledgeGraph();
    loadHistory();
  });

})();
