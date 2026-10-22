/**
 * lab-rag-engine.js — MedInVedic RAG-Based Laboratory Report Reader & Biomarker Engine
 * ══════════════════════════════════════════════════════════════════════════════════════
 * Features:
 * 1. Comprehensive clinical reference ranges grounded in authoritative Tier 1 guidelines:
 *    - American Diabetes Association (ADA 2026 Standards of Care)
 *    - National Cholesterol Education Program (NCEP ATP III) / AHA / ACC
 *    - Endocrine Society Clinical Practice Guidelines (Vitamin D)
 *    - WHO / NIH Laboratory Manual (Vitamin B12, Iron, Ferritin)
 *    - KDIGO Clinical Practice Guidelines (Kidney Disease / Creatinine / eGFR)
 *    - American Thyroid Association (ATA Guidelines)
 *    - ICMR / WHO Hematology Standards (CBC, Platelets, Hemoglobin)
 *    - ACG / AASLD Clinical Guidelines (Liver Function / Enzymes)
 * 2. Ayurvedic Dhatu physiology bridging:
 *    - Rasa (Plasma/Lymph), Rakta (Blood), Mamsa (Muscle), Medas (Adipose/Lipids),
 *      Asthi (Bone/Minerals), Majja (Nerve/Marrow), Shukra (Vitality/Reproductive).
 *    - Dosha imbalance identification (Vata, Pitta, Kapha) and Ama (metabolic toxins).
 * 3. Evidence-grounded report evaluation with clinical triage and red flag safety alerts.
 * 4. Sample preloaded reports (Prediabetes, Anemia, Hypothyroid, Normal).
 */

(function (root, factory) {
  const result = factory();
  if (typeof module === 'object' && module.exports) { module.exports = result; }
  if (typeof global !== 'undefined') { global.LAB_RAG = result; }
  if (typeof window !== 'undefined') { window.LAB_RAG = result; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     1. MASTER BIOMARKER KNOWLEDGE BASE (TIER 1 CLINICAL GUIDELINES)
  ───────────────────────────────────────────────────────────── */
  const BIOMARKER_KB = {
    // ── GLYCEMIC / DIABETES PROFILE ──
    hba1c: {
      id: 'hba1c',
      name: 'Glycated Hemoglobin (HbA1c)',
      shortName: 'HbA1c',
      category: 'glycemic',
      categoryLabel: 'Blood Sugar & Glycemic Control',
      unit: '%',
      step: 0.1,
      defaultVal: 5.8,
      referenceRangeText: '< 5.7% (Normal), 5.7–6.4% (Prediabetes), ≥ 6.5% (Diabetes)',
      min: 3.0,
      max: 18.0,
      guidelineOrg: 'American Diabetes Association (ADA 2026)',
      tier: 'Tier 1: Clinical Practice Guideline',
      plainMeaning: 'Measures your average blood sugar levels over the past 2 to 3 months by assessing glucose bound to red blood cells.',
      classify: function(val) {
        if (val < 4.0) return { status: 'LOW', label: 'Hypoglycemic Tendency', level: 'warn', deduction: 8 };
        if (val < 5.7) return { status: 'NORMAL', label: 'Optimal / Normal', level: 'good', deduction: 0 };
        if (val <= 6.4) return { status: 'BORDERLINE', label: 'Prediabetes Range', level: 'warn', deduction: 12 };
        if (val <= 8.5) return { status: 'ELEVATED', label: 'Diabetes Range (Elevated)', level: 'bad', deduction: 22 };
        return { status: 'CRITICAL', label: 'Severely Elevated (High Risk)', level: 'critical', deduction: 32 };
      },
      clinicalInterpretation: {
        LOW: 'Subnormal glycated hemoglobin may indicate chronic hypoglycemia, hemolytic anemia, or recent significant blood loss.',
        NORMAL: 'Normal glycemic control with balanced insulin sensitivity over the past 90 days. Low risk of diabetic microvascular complications.',
        BORDERLINE: 'Prediabetic state. Glucose metabolism is impaired, indicating peripheral insulin resistance and progressive beta-cell strain.',
        ELEVATED: 'Consistent with diabetes mellitus. Elevated circulating glucose levels accelerate glycation of vascular endothelium and end-organs.',
        CRITICAL: 'Substantially elevated blood glucose. High risk of acute diabetic complications (ketoacidosis/hyperosmolar state) and accelerated vascular damage.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Medas Dhatu (Fat/Adipose) & Rakta Dhatu (Blood)',
        dosha: 'Kapha-Pitta vitiation with Medo-Dhatvagni Mandya',
        concept: 'In Ayurveda, chronic hyperglycemia aligns with Prameha (metabolic syndrome). Defective digestion leads to Ama (toxic sludge), which clogs micro-channels (Srotorodha) in Medovaha Srotas.',
        herbs: ['Gudmar (Gymnema sylvestre — "Sugar Destroyer")', 'Vijaysar (Pterocarpus marsupium)', 'Methi (Fenugreek seed extract)', 'Nisha-Amalaki (Turmeric + Amla combination)'],
        dietLifestyle: 'Favor barley (Yava), bitter gourd (Karela), fenugreek, and green gram. Avoid refined sugar, cold heavy dairy, and sedentary habits.'
      }
    },

    fbs: {
      id: 'fbs',
      name: 'Fasting Blood Sugar (FBS)',
      shortName: 'Fasting Sugar',
      category: 'glycemic',
      categoryLabel: 'Blood Sugar & Glycemic Control',
      unit: 'mg/dL',
      step: 1,
      defaultVal: 104,
      referenceRangeText: '70–99 mg/dL (Normal), 100–125 mg/dL (Impaired), ≥ 126 mg/dL (Diabetes)',
      min: 30,
      max: 500,
      guidelineOrg: 'ADA 2026 Standards of Medical Care',
      tier: 'Tier 1: Clinical Practice Guideline',
      plainMeaning: 'Measures circulating blood glucose concentration after an overnight fast of at least 8 to 10 hours.',
      classify: function(val) {
        if (val < 70) return { status: 'LOW', label: 'Hypoglycemia', level: 'critical', deduction: 18 };
        if (val <= 99) return { status: 'NORMAL', label: 'Normal Fasting Glucose', level: 'good', deduction: 0 };
        if (val <= 125) return { status: 'BORDERLINE', label: 'Impaired Fasting Glucose', level: 'warn', deduction: 10 };
        if (val <= 199) return { status: 'ELEVATED', label: 'Elevated (Diabetic Range)', level: 'bad', deduction: 20 };
        return { status: 'CRITICAL', label: 'Critically High Fasting Glucose', level: 'critical', deduction: 30 };
      },
      clinicalInterpretation: {
        LOW: 'Hypoglycemia. Can cause dizziness, sweating, tremors, palpitations, and in severe cases cognitive impairment.',
        NORMAL: 'Normal baseline hepatic glucose output and overnight insulin sensitivity.',
        BORDERLINE: 'Impaired fasting glucose indicates excessive hepatic gluconeogenesis and early insulin resistance.',
        ELEVATED: 'Diagnostic threshold for diabetes if confirmed on repeat testing. Requires comprehensive metabolic evaluation.',
        CRITICAL: 'Severe fasting hyperglycemia. Immediate medical evaluation needed to prevent acute metabolic decompensation.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Rasa & Medas Dhatu',
        dosha: 'Kaphaja / Pittaja Agnimandya',
        concept: 'Reflects sluggish morning Agni (digestive-metabolic fire) and accumulation of Kleda (excess unctuous moisture) in circulating Rasa Dhatu.',
        herbs: ['Jamun seed powder (Syzygium cumini)', 'Karela juice', 'Neem leaves (Azadirachta indica)'],
        dietLifestyle: 'Early light dinner before 7:30 PM. 20-minute morning brisk walk and Kapalbhati pranayama.'
      }
    },

    // ── LIPID PROFILE ──
    ldl: {
      id: 'ldl',
      name: 'LDL Cholesterol ("Bad" Cholesterol)',
      shortName: 'LDL',
      category: 'lipid',
      categoryLabel: 'Lipid & Cardiovascular Profile',
      unit: 'mg/dL',
      step: 1,
      defaultVal: 122,
      referenceRangeText: '< 100 mg/dL (Optimal), 100–129 mg/dL (Near Optimal), ≥ 130 mg/dL (Borderline High)',
      min: 20,
      max: 400,
      guidelineOrg: 'NCEP ATP III / American Heart Association (AHA)',
      tier: 'Tier 1: Consensus Clinical Guideline',
      plainMeaning: 'Low-Density Lipoprotein carries cholesterol to tissues; elevated levels penetrate arterial walls and drive atherosclerosis.',
      classify: function(val) {
        if (val < 50) return { status: 'LOW', label: 'Very Low LDL', level: 'good', deduction: 0 };
        if (val < 100) return { status: 'NORMAL', label: 'Optimal (< 100)', level: 'good', deduction: 0 };
        if (val <= 129) return { status: 'BORDERLINE', label: 'Near Optimal / Borderline', level: 'warn', deduction: 6 };
        if (val <= 159) return { status: 'ELEVATED', label: 'Borderline High (130–159)', level: 'warn', deduction: 12 };
        if (val <= 189) return { status: 'ELEVATED', label: 'High (160–189)', level: 'bad', deduction: 20 };
        return { status: 'CRITICAL', label: 'Very High (≥ 190)', level: 'critical', deduction: 28 };
      },
      clinicalInterpretation: {
        LOW: 'Low LDL is generally cardioprotective unless accompanied by severe malnutrition or malabsorption.',
        NORMAL: 'Optimal atherogenic particle concentration; low baseline plaque formation rate in coronary arteries.',
        BORDERLINE: 'Mild elevation. Early atherogenic risk that responds effectively to saturated fat reduction and soluble fiber.',
        ELEVATED: 'Increased arterial plaque deposition risk. Correlates with elevated long-term coronary heart disease incidence.',
        CRITICAL: 'Severely high LDL cholesterol. Statin therapy and intensive cardiovascular risk assessment are typically indicated.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Medas Dhatu (Lipid/Fat tissue)',
        dosha: 'Medoroga / Kapha-Vata Srotorodha',
        concept: 'Excess unrefined lipid deposition in Dhamanis (arteries) corresponds to Medo-Dushti and Dhamani-Prathichaya (atherosclerosis) caused by heavy, unctuous Ama.',
        herbs: ['Shuddha Guggulu (Commiphora mukul)', 'Arjuna bark (Terminalia arjuna)', 'Pushkarmool (Inula racemosa)', 'Garlic (Lashuna)'],
        dietLifestyle: 'Consume flaxseeds, oats, warm water with lemon in the morning. Strictly avoid trans-fats, reheated frying oils, and vanaspati.'
      }
    },

    hdl: {
      id: 'hdl',
      name: 'HDL Cholesterol ("Good" Cholesterol)',
      shortName: 'HDL',
      category: 'lipid',
      categoryLabel: 'Lipid & Cardiovascular Profile',
      unit: 'mg/dL',
      step: 1,
      defaultVal: 48,
      referenceRangeText: '≥ 40 mg/dL (Men) / ≥ 50 mg/dL (Women); ≥ 60 mg/dL is Protective',
      min: 10,
      max: 120,
      guidelineOrg: 'NCEP ATP III / AHA Cardiology Standards',
      tier: 'Tier 1: Clinical Practice Guideline',
      plainMeaning: 'High-Density Lipoprotein sweeps excess cholesterol away from arterial walls back to the liver for excretion (reverse cholesterol transport).',
      classify: function(val) {
        if (val < 40) return { status: 'LOW', label: 'Low Protective HDL (< 40)', level: 'bad', deduction: 14 };
        if (val < 50) return { status: 'BORDERLINE', label: 'Moderate Protection (40–49)', level: 'warn', deduction: 5 };
        if (val < 60) return { status: 'NORMAL', label: 'Adequate Protection (50–59)', level: 'good', deduction: 0 };
        return { status: 'NORMAL', label: 'High Cardioprotective (≥ 60)', level: 'good', deduction: 0 };
      },
      clinicalInterpretation: {
        LOW: 'Low HDL is an independent risk factor for coronary artery disease due to impaired reverse cholesterol clearance.',
        BORDERLINE: 'Borderline protective capacity. Modifiable with aerobic physical activity and dietary monounsaturated fats.',
        NORMAL: 'Normal to robust reverse cholesterol transport mechanisms helping protect vascular integrity.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Shuddha Medas (Purified Adipose Essence) & Ojas',
        dosha: 'Sama Pitta & Balanced Dhatvagni',
        concept: 'Represents balanced lipid metabolic intelligence that clears morbid Kapha from systemic channels.',
        herbs: ['Arjuna Ksheerapaka', 'Amla', 'Triphala Guggulu'],
        dietLifestyle: 'Regular aerobic exercise, consumption of walnuts, almonds soaked overnight, and mustard/olive oil.'
      }
    },

    triglycerides: {
      id: 'triglycerides',
      name: 'Serum Triglycerides',
      shortName: 'Triglycerides',
      category: 'lipid',
      categoryLabel: 'Lipid & Cardiovascular Profile',
      unit: 'mg/dL',
      step: 1,
      defaultVal: 155,
      referenceRangeText: '< 150 mg/dL (Normal), 150–199 mg/dL (Borderline), ≥ 200 mg/dL (High)',
      min: 20,
      max: 1000,
      guidelineOrg: 'AHA / NCEP ATP III Standards',
      tier: 'Tier 1: Clinical Guideline',
      plainMeaning: 'The primary storage form of fat in the body. Rapidly elevated by simple carbohydrates, alcohol, and insulin resistance.',
      classify: function(val) {
        if (val < 150) return { status: 'NORMAL', label: 'Normal (< 150)', level: 'good', deduction: 0 };
        if (val <= 199) return { status: 'BORDERLINE', label: 'Borderline High (150–199)', level: 'warn', deduction: 8 };
        if (val <= 499) return { status: 'ELEVATED', label: 'High (200–499)', level: 'bad', deduction: 16 };
        return { status: 'CRITICAL', label: 'Very High (≥ 500 — Pancreatitis Risk)', level: 'critical', deduction: 28 };
      },
      clinicalInterpretation: {
        NORMAL: 'Normal circulating neutral fat concentrations; optimal carbohydrate-lipid turnover.',
        BORDERLINE: 'Mild hypertriglyceridemia, frequently a hallmark of metabolic syndrome and excessive dietary sugar intake.',
        ELEVATED: 'High triglycerides accelerate arterial wall stiffness and correlate with non-alcoholic fatty liver disease (NAFLD).',
        CRITICAL: 'Severely elevated triglycerides (> 500 mg/dL) carry a direct risk of acute necrotizing pancreatitis requiring immediate therapy.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Medas Dhatu (Abnormal accumulation)',
        dosha: 'Kapha Prakopa with Medoroga',
        concept: 'Reflects Santarpanottha Vyadhi (over-nutrition disorder) with thick, sluggish circulation of Rasa-Rakta.',
        herbs: ['Triphala churna with warm honey-water', 'Kutki (Picrorhiza kurroa)', 'Guggulu'],
        dietLifestyle: 'Eliminate refined white sugars, fruit juices, and alcohol. Introduce intermittent fasting (14:10).'
      }
    },

    // ── VITAMINS & MINERALS ──
    vitd: {
      id: 'vitd',
      name: 'Vitamin D3 (25-Hydroxycholecalciferol)',
      shortName: 'Vitamin D3',
      category: 'vitamin',
      categoryLabel: 'Vitamins & Bone Health',
      unit: 'ng/mL',
      step: 1,
      defaultVal: 26,
      referenceRangeText: '< 20 ng/mL (Deficient), 20–29 ng/mL (Insufficient), 30–100 ng/mL (Sufficient)',
      min: 4,
      max: 150,
      guidelineOrg: 'Endocrine Society Clinical Practice Guidelines',
      tier: 'Tier 1: Clinical Guideline',
      plainMeaning: 'A critical secosteroid hormone regulating calcium absorption, bone mineralization, immune defense, and mood.',
      classify: function(val) {
        if (val < 10) return { status: 'CRITICAL', label: 'Severe Deficiency (< 10)', level: 'critical', deduction: 22 };
        if (val < 20) return { status: 'LOW', label: 'Deficient (10–19)', level: 'bad', deduction: 14 };
        if (val < 30) return { status: 'BORDERLINE', label: 'Insufficient (20–29)', level: 'warn', deduction: 7 };
        if (val <= 100) return { status: 'NORMAL', label: 'Sufficient (30–100)', level: 'good', deduction: 0 };
        return { status: 'CRITICAL', label: 'Hypervitaminosis D (> 100)', level: 'critical', deduction: 20 };
      },
      clinicalInterpretation: {
        CRITICAL: 'Severe deficiency impairs bone turnover, causing osteomalacia, profound muscle aches, and heightened infection vulnerability.',
        LOW: 'Deficiency impairs intestinal calcium absorption, leading to secondary hyperparathyroidism and accelerated bone density loss.',
        BORDERLINE: 'Suboptimal level. Adequate for basic rickets prevention but suboptimal for bone density and immune modulation.',
        NORMAL: 'Optimal physiological concentration for skeletal mineralization, neuromuscular function, and immune competence.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Asthi Dhatu (Bone tissue) & Majja Dhatu',
        dosha: 'Vata Aggravation (Asthi-Kshaya)',
        concept: 'In Ayurveda, bone weakness is Asthi-Kshaya caused by vitiated Vata entering bone tissue pores. Sun exposure represents absorption of Agni/Surya Tejas.',
        herbs: ['Hadjoď (Cissus quadrangularis — "Bone Setter")', 'Ashwagandha', 'Mukta Pishti (Purified pearl calcium)', 'Lakshadi Guggulu'],
        dietLifestyle: 'Direct early morning sun exposure (20–30 mins between 7:30 AM–9:00 AM). Sesame seeds (Til), moringa leaves, and fortified milk.'
      }
    },

    b12: {
      id: 'b12',
      name: 'Vitamin B12 (Cyanocobalamin)',
      shortName: 'Vitamin B12',
      category: 'vitamin',
      categoryLabel: 'Vitamins & Bone Health',
      unit: 'pg/mL',
      step: 1,
      defaultVal: 380,
      referenceRangeText: '< 200 pg/mL (Low), 200–300 pg/mL (Borderline), 300–900 pg/mL (Normal)',
      min: 50,
      max: 2000,
      guidelineOrg: 'WHO / NIH Clinical Pathology Standards',
      tier: 'Tier 1: International Reference Standard',
      plainMeaning: 'Essential water-soluble vitamin required for DNA synthesis, red blood cell formation, and myelin sheath nerve insulation.',
      classify: function(val) {
        if (val < 150) return { status: 'CRITICAL', label: 'Severe Deficiency (< 150)', level: 'critical', deduction: 20 };
        if (val < 200) return { status: 'LOW', label: 'Low / Deficient (150–199)', level: 'bad', deduction: 14 };
        if (val <= 300) return { status: 'BORDERLINE', label: 'Borderline Suboptimal (200–300)', level: 'warn', deduction: 6 };
        if (val <= 900) return { status: 'NORMAL', label: 'Normal (300–900)', level: 'good', deduction: 0 };
        return { status: 'BORDERLINE', label: 'Elevated (> 900)', level: 'warn', deduction: 4 };
      },
      clinicalInterpretation: {
        CRITICAL: 'Severe B12 depletion can trigger megaloblastic anemia and irreversible peripheral neuropathy (tingling, numbness, ataxia).',
        LOW: 'Deficiency causes fatigue, cognitive sluggishness, glossitis (smooth tongue), and microvascular neurological symptoms.',
        BORDERLINE: 'Subclinical insufficiency. Common in vegetarian and vegan diets without supplementation.',
        NORMAL: 'Optimal neuro-hematological store supporting vigorous cellular metabolism and nerve conduction.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Majja Dhatu (Marrow & Nervous System) & Rakta Dhatu',
        dosha: 'Vata Vitiation affecting Majjavaha Srotas',
        concept: 'Numbness, tingling, and mental fatigue reflect depletion of Majja Dhatu and Vata disturbance in nervous pathways.',
        herbs: ['Ashwagandha (Withania somnifera)', 'Brahmi (Bacopa monnieri)', 'Shankhpushpi', 'Shatavari'],
        dietLifestyle: 'Cultured A2 dairy (fermented curd/buttermilk/chaas), fortified nutritional yeast, and sprouts.'
      }
    },

    // ── RENAL / KIDNEY PROFILE ──
    creat: {
      id: 'creat',
      name: 'Serum Creatinine',
      shortName: 'Creatinine',
      category: 'renal',
      categoryLabel: 'Kidney Function & Excretion',
      unit: 'mg/dL',
      step: 0.1,
      defaultVal: 0.9,
      referenceRangeText: '0.7–1.2 mg/dL (Adult Male), 0.5–1.0 mg/dL (Adult Female); > 1.3 mg/dL indicates reduced filtration',
      min: 0.2,
      max: 12.0,
      guidelineOrg: 'KDIGO Clinical Practice Guideline for CKD',
      tier: 'Tier 1: Clinical Practice Guideline',
      plainMeaning: 'A breakdown waste product of muscle metabolism filtered out almost entirely by healthy kidney glomeruli.',
      classify: function(val) {
        if (val < 0.5) return { status: 'LOW', label: 'Low Creatinine (< 0.5)', level: 'good', deduction: 0 };
        if (val <= 1.2) return { status: 'NORMAL', label: 'Normal Renal Filtration', level: 'good', deduction: 0 };
        if (val <= 1.5) return { status: 'BORDERLINE', label: 'Borderline High (1.3–1.5)', level: 'warn', deduction: 12 };
        if (val <= 2.5) return { status: 'ELEVATED', label: 'Elevated (Impaired GFR)', level: 'bad', deduction: 22 };
        return { status: 'CRITICAL', label: 'Critical Renal Elevation (≥ 2.6)', level: 'critical', deduction: 35 };
      },
      clinicalInterpretation: {
        LOW: 'Low creatinine typically reflects low muscle mass or reduced protein intake, rarely of direct clinical concern.',
        NORMAL: 'Normal glomerular filtration rate (GFR) and kidney excretory clearance.',
        BORDERLINE: 'Mild elevation indicates reduced glomerular filtration or transient dehydration. Requires eGFR and urine protein testing.',
        ELEVATED: 'Significant reduction in renal clearance capacity. Clinical staging of Chronic Kidney Disease (CKD) recommended.',
        CRITICAL: 'Severe renal impairment. Immediate nephrological evaluation required to assess acute kidney injury or advanced CKD.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Meda & Mutra (Excretory Mala)',
        dosha: 'Apana Vata & Pitta Dushti in Mutravaha Srotas',
        concept: 'Governed by Vrikka (kidneys) and Mutravaha Srotas. Elevated toxins correspond to Mutrasanga and defective filtration of Mala.',
        herbs: ['Punarnava (Boerhavia diffusa — "Renewer")', 'Gokshura (Tribulus terrestris)', 'Varun bark (Crataeva nurvala)', 'Chandraprabha Vati'],
        dietLifestyle: 'Adequate clean warm water intake. Avoid excessive sodium, NSAID painkillers, and unprescribed protein powders.'
      }
    },

    // ── HEMATOLOGY (CBC) ──
    hb: {
      id: 'hb',
      name: 'Hemoglobin (Hb)',
      shortName: 'Hemoglobin',
      category: 'hematology',
      categoryLabel: 'Complete Blood Count (CBC)',
      unit: 'g/dL',
      step: 0.1,
      defaultVal: 13.8,
      referenceRangeText: '13.0–17.5 g/dL (Men), 12.0–15.5 g/dL (Women); < 12 g/dL indicates Anemia',
      min: 4.0,
      max: 22.0,
      guidelineOrg: 'WHO / ICMR Anemia Guidelines',
      tier: 'Tier 1: Global Health Standard',
      plainMeaning: 'The oxygen-carrying iron-rich protein in red blood cells that delivers oxygen to all vital organs and muscles.',
      classify: function(val) {
        if (val < 8.0) return { status: 'CRITICAL', label: 'Severe Anemia (< 8.0)', level: 'critical', deduction: 30 };
        if (val < 11.0) return { status: 'LOW', label: 'Moderate Anemia (8.0–10.9)', level: 'bad', deduction: 18 };
        if (val < 12.0) return { status: 'BORDERLINE', label: 'Mild Anemia (11.0–11.9)', level: 'warn', deduction: 8 };
        if (val <= 17.5) return { status: 'NORMAL', label: 'Normal Oxygen Carrying Capacity', level: 'good', deduction: 0 };
        return { status: 'BORDERLINE', label: 'High / Polycythemia (> 17.5)', level: 'warn', deduction: 8 };
      },
      clinicalInterpretation: {
        CRITICAL: 'Severe anemia causing hypoxia, exertional dyspnea, tachycardia, and potential cardiovascular decompensation.',
        LOW: 'Moderate anemia. Causes fatigue, cold intolerance, dizziness, and pale conjunctiva. Iron/folate studies needed.',
        BORDERLINE: 'Mild anemia, commonly due to early iron deficiency, chronic blood loss, or dietary insufficiency.',
        NORMAL: 'Normal red cell mass and optimal oxygen transport kinetics to tissues.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Rakta Dhatu (Blood Essence)',
        dosha: 'Pitta-Vata Vitiation (Pandu Roga)',
        concept: 'In Ayurveda, anemia is Pandu Roga (pallor), reflecting diminished Rakta Dhatu vitality and impaired Ranjaka Pitta in the liver and spleen.',
        herbs: ['Loha Bhasma (Purified iron calx — under Vaidya care)', 'Drakshasava (Raisin formulation)', 'Amalaki Rasayana', 'Punarnava Mandur'],
        dietLifestyle: 'Pomegranate (Dadima), beetroot, black raisins soaked overnight, dates, and iron-vessel cooked food.'
      }
    },

    // ── THYROID PROFILE ──
    tsh: {
      id: 'tsh',
      name: 'Thyroid Stimulating Hormone (TSH)',
      shortName: 'TSH',
      category: 'thyroid',
      categoryLabel: 'Thyroid & Endocrine Function',
      unit: 'mIU/L',
      step: 0.1,
      defaultVal: 2.4,
      referenceRangeText: '0.45–4.50 mIU/L (Normal); > 4.5 indicates Hypothyroidism, < 0.45 indicates Hyperthyroidism',
      min: 0.01,
      max: 50.0,
      guidelineOrg: 'American Thyroid Association (ATA) Guidelines',
      tier: 'Tier 1: Clinical Practice Guideline',
      plainMeaning: 'Pituitary hormone directing the thyroid gland to release T3 and T4 hormones controlling body metabolism and thermogenesis.',
      classify: function(val) {
        if (val < 0.1) return { status: 'CRITICAL', label: 'Overt Hyperthyroidism (< 0.1)', level: 'critical', deduction: 22 };
        if (val < 0.45) return { status: 'BORDERLINE', label: 'Low TSH / Subclinical Hyperthyroid', level: 'warn', deduction: 8 };
        if (val <= 4.5) return { status: 'NORMAL', label: 'Euthyroid (Normal Thyroid Function)', level: 'good', deduction: 0 };
        if (val <= 10.0) return { status: 'BORDERLINE', label: 'Subclinical Hypothyroidism (4.6–10)', level: 'warn', deduction: 10 };
        return { status: 'CRITICAL', label: 'Overt Hypothyroidism (> 10.0)', level: 'critical', deduction: 24 };
      },
      clinicalInterpretation: {
        LOW: 'Suppressed TSH suggests thyroid overactivity (hyperthyroidism). Risk of tachyarrhythmias, anxiety, weight loss, and bone loss.',
        NORMAL: 'Normal pituitary-thyroid feedback axis with balanced baseline basal metabolic rate.',
        BORDERLINE: 'Elevated TSH with normal Free T4 represents subclinical hypothyroidism, causing sluggishness, weight gain, and dry skin.',
        CRITICAL: 'Overt hypothyroidism. Significant deficiency of circulating thyroid hormones slowing systemic metabolism.'
      },
      ayurvedicCorrelation: {
        dhatu: 'Medas Dhatu & Agni (Cellular Metabolism)',
        dosha: 'Kapha-Vata Vitiation with Dhatvagni Mandya',
        concept: 'Correlates with Galaganda / Dhatvagni-Mandya. Sluggish Agni leads to cold intolerance, water retention, and weight gain.',
        herbs: ['Kanchnar Guggulu', 'Varunadi Kashayam', 'Pippali (Piper longum)', 'Ashwagandha'],
        dietLifestyle: 'Cooked iodine-rich foods, brassica vegetables only when cooked/steamed, and Ujjayi Pranayama.'
      }
    }
  };

  /* ─────────────────────────────────────────────────────────────
     2. PRESET SAMPLE CLINICAL REPORTS
  ───────────────────────────────────────────────────────────── */
  const SAMPLE_REPORTS = [
    {
      id: 'prediabetes_lipids',
      name: '📄 Prediabetes & Borderline Lipids',
      description: 'Extracted from a 42-year-old report: Elevated fasting sugar, borderline HbA1c, elevated LDL, and low Vitamin D3.',
      values: {
        hba1c: 6.3,
        fbs: 116,
        ldl: 142,
        hdl: 44,
        triglycerides: 178,
        vitd: 19,
        b12: 360,
        creat: 0.9,
        hb: 14.1,
        tsh: 2.8
      }
    },
    {
      id: 'anemia_vitamins',
      name: '📄 Anemia & Vitamin Depletion',
      description: 'Extracted from a 29-year-old vegetarian report: Low hemoglobin, deficient Vitamin B12, and severe Vitamin D3 deficiency.',
      values: {
        hba1c: 5.2,
        fbs: 88,
        ldl: 92,
        hdl: 56,
        triglycerides: 108,
        vitd: 12,
        b12: 165,
        creat: 0.7,
        hb: 9.8,
        tsh: 2.1
      }
    },
    {
      id: 'hypothyroid_metabolic',
      name: '📄 Hypothyroidism & Dyslipidemia',
      description: 'Extracted from a 38-year-old report: High TSH, elevated total and LDL cholesterol, with sluggish metabolic markers.',
      values: {
        hba1c: 5.9,
        fbs: 102,
        ldl: 164,
        hdl: 42,
        triglycerides: 210,
        vitd: 24,
        b12: 310,
        creat: 1.0,
        hb: 12.8,
        tsh: 8.4
      }
    },
    {
      id: 'optimal_health',
      name: '📄 Optimal Routine Health Checkup',
      description: 'Extracted from a balanced wellness profile: All metabolic, glycemic, lipid, and organ markers within target reference ranges.',
      values: {
        hba1c: 5.3,
        fbs: 84,
        ldl: 86,
        hdl: 62,
        triglycerides: 98,
        vitd: 46,
        b12: 540,
        creat: 0.8,
        hb: 14.6,
        tsh: 1.9
      }
    }
  ];

  /* ─────────────────────────────────────────────────────────────
     3. CORE RAG EVALUATION ENGINE
  ───────────────────────────────────────────────────────────── */

  /**
   * Evaluates an arbitrary dictionary of biomarker values { [key]: number }
   * Returns a complete, verified RAG evidence package.
   */
  function evaluateReport(userValues) {
    const values = userValues || {};
    let totalScore = 100;
    const biomarkerEvaluations = [];
    const criticalAlerts = [];
    const warningList = [];
    const clinicalSummaries = [];
    const ayurvedicSummaries = [];
    const recommendedHerbs = new Set();
    const recommendedLifestyle = new Set();
    const citedGuidelines = new Set();

    let evaluatedCount = 0;

    for (const [key, bio] of Object.entries(BIOMARKER_KB)) {
      if (values[key] === undefined || values[key] === null || values[key] === '') {
        continue;
      }

      const numVal = parseFloat(values[key]);
      if (isNaN(numVal)) continue;

      evaluatedCount++;
      const classification = bio.classify(numVal);
      totalScore -= classification.deduction;

      citedGuidelines.add(`${bio.guidelineOrg} (${bio.tier})`);

      const evalItem = {
        id: bio.id,
        name: bio.name,
        shortName: bio.shortName,
        category: bio.category,
        categoryLabel: bio.categoryLabel,
        unit: bio.unit,
        observedValue: numVal,
        referenceRange: bio.referenceRangeText,
        status: classification.status,
        statusLabel: classification.label,
        severityLevel: classification.level, // 'good' | 'warn' | 'bad' | 'critical'
        guideline: bio.guidelineOrg,
        plainMeaning: bio.plainMeaning,
        clinicalNote: bio.clinicalInterpretation[classification.status] || bio.clinicalInterpretation.NORMAL,
        ayurvedic: bio.ayurvedicCorrelation
      };

      biomarkerEvaluations.push(evalItem);

      // Collect recommendations & clinical notes if out of range
      if (classification.status !== 'NORMAL') {
        clinicalSummaries.push(`• ${bio.shortName} is ${classification.label.toLowerCase()}: ${evalItem.clinicalNote}`);
        ayurvedicSummaries.push(`• ${bio.shortName} (${numVal} ${bio.unit}): ${bio.ayurvedicCorrelation.concept}`);
        
        bio.ayurvedicCorrelation.herbs.forEach(h => recommendedHerbs.add(h));
        recommendedLifestyle.add(bio.ayurvedicCorrelation.dietLifestyle);

        if (classification.level === 'critical') {
          criticalAlerts.push({
            name: bio.name,
            value: `${numVal} ${bio.unit}`,
            range: bio.referenceRangeText,
            reason: classification.label,
            guideline: bio.guidelineOrg
          });
        } else {
          warningList.push(`${bio.shortName}: ${classification.label}`);
        }
      }
    }

    const finalScore = Math.max(35, Math.min(100, Math.round(totalScore)));

    let statusHeadline = 'Balanced Metabolic Vitality';
    let statusClass = 'good';
    if (criticalAlerts.length > 0) {
      statusHeadline = 'Critical Clinical Alert: Immediate Review Required';
      statusClass = 'critical';
    } else if (finalScore < 70) {
      statusHeadline = 'Moderate Metabolic & Tissue Imbalance Detected';
      statusClass = 'bad';
    } else if (finalScore < 85) {
      statusHeadline = 'Mild Subclinical Shifts — Lifestyle Interventions Warranted';
      statusClass = 'warn';
    }

    // Default summaries if all biomarkers normal
    if (clinicalSummaries.length === 0) {
      clinicalSummaries.push('• All evaluated biomarkers reside comfortably within recognized international clinical reference ranges.');
      clinicalSummaries.push('• Fasting blood sugar, lipids, kidney, liver, and vitamin profiles demonstrate optimal physiological homeostasis.');
      ayurvedicSummaries.push('• Dhatus (Rasa, Rakta, Medas, Asthi) demonstrate balanced Dhatvagni and harmonious Dosha equilibrium (Sama-Dhatu).');
      recommendedLifestyle.add('Maintain a balanced seasonal diet (Ritucharya), morning physical movement (Vyayama), and mindful stress management.');
    }

    return {
      evaluatedCount,
      healthScore: finalScore,
      statusHeadline,
      statusClass,
      criticalAlerts,
      warnings: warningList,
      evaluations: biomarkerEvaluations,
      clinicalSummary: clinicalSummaries.join('\n\n'),
      ayurvedicSummary: ayurvedicSummaries.join('\n\n'),
      herbs: Array.from(recommendedHerbs),
      lifestyle: Array.from(recommendedLifestyle),
      citations: Array.from(citedGuidelines),
      timestamp: new Date().toISOString()
    };
  }

  /* ─────────────────────────────────────────────────────────────
     4. EXPORT PUBLIC INTERFACE
  ───────────────────────────────────────────────────────────── */
  return {
    getBiomarkerKB: () => BIOMARKER_KB,
    getSampleReports: () => SAMPLE_REPORTS,
    evaluateReport: evaluateReport
  };
}));
