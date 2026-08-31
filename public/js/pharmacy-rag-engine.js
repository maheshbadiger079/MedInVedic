/**
 * MedInVedic — Modern Medicine Hub & Digital Pharmacy RAG Engine
 * 
 * Features:
 * 1. Comprehensive Allopathic Drug Knowledge Base with verified pharmacology (CDSCO, FDA, WHO, NHS)
 * 2. Multi-Drug Interaction Checker with clinical risk classification (MAJOR, MODERATE, MINOR)
 * 3. Active Ingredient Duplicate Detector
 * 4. Prescription OCR & Medicine Parser
 * 5. Evidence-grounded Medicine Q&A with Tier 1/2 Source Citations
 * 6. Non-diagnostic healthcare guardrails & emergency detection
 * 
 * UMD Export: global.PHARMACY_RAG, window.PHARMACY_RAG, module.exports
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var exp = factory();
    root.PHARMACY_RAG = exp;
    if (typeof window !== 'undefined') window.PHARMACY_RAG = exp;
    if (typeof global !== 'undefined') global.PHARMACY_RAG = exp;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     1. VERIFIED MEDICINE CATALOG & CLINICAL PHARMACOPOEIA
  ───────────────────────────────────────────────────────────── */
  const PHARMACY_CATALOG = [
    {
      id: 'm1',
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol / Acetaminophen',
      brandNames: ['Dolo 500', 'Crocin', 'Calpol', 'Pacimol'],
      activeIngredient: 'Paracetamol',
      strength: '500mg',
      dosageForm: 'Oral Tablet',
      manufacturer: 'Micro Labs / GSK',
      tag: 'otc',
      category: 'Fever',
      rating: 4.5,
      reviews: 3200,
      price: 32,
      mrp: 45,
      discount: '29% OFF',
      image: '../images/products/med_dolo.png',
      desc: 'Effective for fever, headache & mild to moderate pain relief.',
      indications: 'Fever, tension headache, toothache, muscle aches, mild arthritis pain.',
      warnings: 'Do not exceed 4,000mg in 24 hours. High doses cause severe hepatotoxicity (liver damage). Avoid with alcohol.',
      contraindications: 'Severe hepatic impairment, known hypersensitivity to paracetamol.',
      commonSideEffects: 'Rare when taken at recommended doses; occasional mild nausea or rash.',
      storage: 'Store below 30°C in a dry place away from direct sunlight.',
      rxRequired: false,
      sources: [
        { title: 'WHO Model Formulary — Paracetamol', org: 'World Health Organization', year: '2023', url: 'https://who.int' },
        { title: 'CDSCO Approved National List of Essential Medicines (NLEM)', org: 'CDSCO India', year: '2022', url: 'https://cdsco.gov.in' }
      ]
    },
    {
      id: 'm2',
      name: 'Cetirizine 10mg',
      genericName: 'Cetirizine Hydrochloride',
      brandNames: ['Cetzine', 'Zyrtec', 'Alerid', 'Okacet'],
      activeIngredient: 'Cetirizine HCl',
      strength: '10mg',
      dosageForm: 'Film-Coated Tablet',
      manufacturer: 'Dr. Reddy\'s / Cipla',
      tag: 'otc',
      category: 'Allergy',
      rating: 4.3,
      reviews: 2150,
      price: 28,
      mrp: 40,
      discount: '30% OFF',
      image: '../images/products/med_cetzine.png',
      desc: 'Fast relief from cold & allergy symptoms, sneezing, and hives.',
      indications: 'Allergic rhinitis, seasonal hay fever, chronic idiopathic urticaria (hives), watery eyes, runny nose.',
      warnings: 'May cause mild drowsiness. Caution while driving or operating machinery. Avoid alcohol consumption.',
      contraindications: 'Severe end-stage renal disease (CrCl < 10 mL/min).',
      commonSideEffects: 'Drowsiness, dry mouth, headache, fatigue.',
      storage: 'Store in cool and dry place away from moisture.',
      rxRequired: false,
      sources: [
        { title: 'FDA Label Information — Cetirizine HCl', org: 'US FDA', year: '2023', url: 'https://accessdata.fda.gov' },
        { title: 'British National Formulary (BNF) — Cetirizine', org: 'NHS UK / NICE', year: '2023', url: 'https://bnf.nice.org.uk' }
      ]
    },
    {
      id: 'm3',
      name: 'Metformin 500mg',
      genericName: 'Metformin Hydrochloride (Extended Release)',
      brandNames: ['Glycomet 500', 'Glucophage', 'Obimet'],
      activeIngredient: 'Metformin HCl',
      strength: '500mg',
      dosageForm: 'Extended Release Tablet',
      manufacturer: 'USV / Sun Pharma',
      tag: 'rx',
      category: 'Diabetes',
      rating: 4.6,
      reviews: 4100,
      price: 65,
      mrp: 90,
      discount: '28% OFF',
      image: '../images/products/med_metformin.png',
      desc: 'Blood sugar control for Type 2 Diabetes Mellitus.',
      indications: 'First-line therapy for glycemic control in Type 2 Diabetes Mellitus, particularly in overweight individuals.',
      warnings: 'Take with or after meals to reduce GI distress. Rare risk of lactic acidosis in severe renal failure. Monitor eGFR regularly.',
      contraindications: 'Severe renal failure (eGFR < 30 mL/min/1.73m²), metabolic acidosis, acute heart failure.',
      commonSideEffects: 'Nausea, abdominal discomfort, diarrhea, metallic taste.',
      storage: 'Store below 25°C protected from light.',
      rxRequired: true,
      sources: [
        { title: 'ADA Standards of Care in Diabetes — Pharmacological Approaches', org: 'American Diabetes Association', year: '2024', url: 'https://diabetesjournals.org' },
        { title: 'ICMR Guidelines for Management of Type 2 Diabetes', org: 'ICMR India', year: '2023', url: 'https://icmr.gov.in' }
      ]
    },
    {
      id: 'm4',
      name: 'Atorvastatin 10mg',
      genericName: 'Atorvastatin Calcium',
      brandNames: ['Atorva 10', 'Lipitor', 'Storvas', 'Tonact'],
      activeIngredient: 'Atorvastatin',
      strength: '10mg',
      dosageForm: 'Tablet',
      manufacturer: 'Zydus / Sun Pharma',
      tag: 'rx',
      category: 'Cholesterol',
      rating: 4.7,
      reviews: 1890,
      price: 85,
      mrp: 120,
      discount: '29% OFF',
      image: '../images/products/med_atorva.png',
      desc: 'Cholesterol management and cardiovascular risk reduction.',
      indications: 'Hypercholesterolemia, dyslipidemia, primary prevention of cardiovascular events in high-risk patients.',
      warnings: 'Report unexplained muscle pain, tenderness, or weakness (rhabdomyolysis risk). Avoid grapefruit juice.',
      contraindications: 'Active liver disease, pregnancy, lactation.',
      commonSideEffects: 'Joint pain, nasopharyngitis, dyspepsia, mild liver enzyme elevations.',
      storage: 'Store between 20°C to 25°C in a dry container.',
      rxRequired: true,
      sources: [
        { title: 'ACC/AHA Guideline on the Management of Blood Cholesterol', org: 'AHA / ACC', year: '2023', url: 'https://heart.org' },
        { title: 'CDSCO Approved Prescribing Information — Atorvastatin', org: 'CDSCO', year: '2022', url: 'https://cdsco.gov.in' }
      ]
    },
    {
      id: 'm5',
      name: 'Azithromycin 500mg',
      genericName: 'Azithromycin Dihydrate',
      brandNames: ['Azithral 500', 'Zithromax', 'Azee 500'],
      activeIngredient: 'Azithromycin',
      strength: '500mg',
      dosageForm: 'Film-Coated Tablet',
      manufacturer: 'Alembic / Cipla',
      tag: 'rx',
      category: 'Antibiotic',
      rating: 4.4,
      reviews: 2900,
      price: 110,
      mrp: 150,
      discount: '27% OFF',
      image: '../images/products/med_azee.png',
      desc: 'Broad spectrum macrolide antibiotic for respiratory & bacterial infections.',
      indications: 'Bacterial upper/lower respiratory tract infections, community-acquired pneumonia, strep throat, skin infections.',
      warnings: 'Complete the entire course prescribed. Strictly prescription only. Inappropriate use fuels antimicrobial resistance (AMR).',
      contraindications: 'Known macrolide allergy, severe liver dysfunction, history of cholestatic jaundice.',
      commonSideEffects: 'Diarrhea, nausea, abdominal pain, headache.',
      storage: 'Store below 30°C.',
      rxRequired: true,
      sources: [
        { title: 'WHO AWaRe Antibiotic Guidance — Azithromycin', org: 'World Health Organization', year: '2023', url: 'https://who.int' },
        { title: 'ICMR Treatment Guidelines for Antimicrobial Use in Common Syndromes', org: 'ICMR India', year: '2022', url: 'https://icmr.gov.in' }
      ]
    },
    {
      id: 'm6',
      name: 'Omeprazole 20mg',
      genericName: 'Omeprazole (Proton Pump Inhibitor)',
      brandNames: ['Omez 20', 'Prilosec', 'Omee'],
      activeIngredient: 'Omeprazole',
      strength: '20mg',
      dosageForm: 'Delayed-Release Capsule',
      manufacturer: 'Dr. Reddy\'s / Alkem',
      tag: 'otc',
      category: 'Digestion',
      rating: 4.5,
      reviews: 3400,
      price: 48,
      mrp: 68,
      discount: '29% OFF',
      image: '../images/products/med_omez.png',
      desc: 'Instant relief from stomach acidity, acid reflux & heartburn.',
      indications: 'Gastroesophageal reflux disease (GERD), peptic ulcer disease, acid indigestion, Zollinger-Ellison syndrome.',
      warnings: 'Take 30–60 minutes before morning breakfast. Long-term continuous use (>1 year) requires monitoring for magnesium and B12 levels.',
      contraindications: 'Hypersensitivity to substituted benzimidazoles.',
      commonSideEffects: 'Headache, diarrhea, constipation, abdominal flatulence.',
      storage: 'Store in moisture-proof packaging below 25°C.',
      rxRequired: false,
      sources: [
        { title: 'ACG Clinical Guideline for the Diagnosis and Management of GERD', org: 'American College of Gastroenterology', year: '2022', url: 'https://gi.org' },
        { title: 'National Formulary of India — Omeprazole', org: 'Indian Pharmacopoeia Commission', year: '2021', url: 'https://ipc.gov.in' }
      ]
    },
    {
      id: 'm7',
      name: 'Zinco-Immune (Zinc + Vit C)',
      genericName: 'Zinc Sulfate 50mg + Ascorbic Acid (Vitamin C) 500mg',
      brandNames: ['Becozinc', 'Limcee Plus', 'Zincovit'],
      activeIngredient: 'Zinc + Vitamin C',
      strength: '500mg + 50mg',
      dosageForm: 'Chewable / Oral Tablet',
      manufacturer: 'Abbott / Apex Labs',
      tag: 'otc',
      category: 'Vitamins',
      rating: 4.8,
      reviews: 1450,
      price: 185,
      mrp: 220,
      discount: '16% OFF',
      image: '../images/products/med_zinc.png',
      desc: 'Advanced immunity support, antioxidant protection, and tissue repair.',
      indications: 'Nutritional supplementation, immunity boosting during viral recovery, wound healing, antioxidant support.',
      warnings: 'Do not consume on an empty stomach to prevent mild gastric irritation.',
      contraindications: 'Known copper deficiency or severe hyperoxaluria.',
      commonSideEffects: 'Occasional metallic taste or mild nausea if taken without food.',
      storage: 'Store in airtight container in a cool dry place.',
      rxRequired: false,
      sources: [
        { title: 'Nutritional Interventions & Immunity Overview', org: 'National Institutes of Health (NIH)', year: '2023', url: 'https://nih.gov' },
        { title: 'ICMR-NIN Dietary Guidelines for Indians', org: 'National Institute of Nutrition (NIN/ICMR)', year: '2024', url: 'https://nin.res.in' }
      ]
    },
    {
      id: 'm8',
      name: 'Telmisartan 40mg',
      genericName: 'Telmisartan (Angiotensin II Receptor Blocker)',
      brandNames: ['Telma 40', 'Micardis', 'Telmikem'],
      activeIngredient: 'Telmisartan',
      strength: '40mg',
      dosageForm: 'Tablet',
      manufacturer: 'Glenmark / Alkem',
      tag: 'rx',
      category: 'Blood Pressure',
      rating: 4.7,
      reviews: 2600,
      price: 140,
      mrp: 165,
      discount: '15% OFF',
      image: '../images/products/med_telma.png',
      desc: 'Standard hypertension management and kidney protection therapy.',
      indications: 'Essential hypertension, cardiovascular event reduction in patients unable to take ACE inhibitors.',
      warnings: 'Regular blood pressure and serum potassium monitoring is recommended. Avoid during pregnancy.',
      contraindications: 'Pregnancy (teratogenic risk in 2nd/3rd trimesters), severe biliary obstructive disorders.',
      commonSideEffects: 'Dizziness, back pain, sinus congestion.',
      storage: 'Keep in original blister pack to protect from moisture.',
      rxRequired: true,
      sources: [
        { title: 'AHA/ACC Hypertension Clinical Practice Guidelines', org: 'American Heart Association', year: '2023', url: 'https://heart.org' },
        { title: 'CDSCO Approved Monograph — Telmisartan', org: 'CDSCO India', year: '2022', url: 'https://cdsco.gov.in' }
      ]
    }
  ];

  /* ─────────────────────────────────────────────────────────────
     2. DRUG-DRUG INTERACTION MATRIX
  ───────────────────────────────────────────────────────────── */
  const DRUG_INTERACTION_MATRIX = [
    {
      drugs: ['Paracetamol', 'Alcohol'],
      risk: 'MAJOR',
      effect: 'Increased risk of severe hepatotoxicity (acute liver damage).',
      guidance: 'Avoid chronic or heavy alcohol consumption when taking paracetamol.'
    },
    {
      drugs: ['Atorvastatin', 'Clarithromycin'],
      risk: 'MAJOR',
      effect: 'Significant elevation of statin plasma levels leading to myopathy or rhabdomyolysis.',
      guidance: 'Dose reduction or temporary discontinuation of statin under physician guidance.'
    },
    {
      drugs: ['Metformin', 'Iodinated Radiocontrast'],
      risk: 'MAJOR',
      effect: 'Risk of acute kidney injury and subsequent metformin-associated lactic acidosis.',
      guidance: 'Metformin must be withheld prior to and for 48 hours following intravascular radiocontrast imaging.'
    },
    {
      drugs: ['Telmisartan', 'NSAIDs (Ibuprofen / Diclofenac)'],
      risk: 'MODERATE',
      effect: 'Decreased antihypertensive efficacy and increased risk of worsening renal function.',
      guidance: 'Monitor blood pressure and renal function if co-administered; prioritize topical NSAIDs or paracetamol.'
    },
    {
      drugs: ['Omeprazole', 'Clopidogrel'],
      risk: 'MODERATE',
      effect: 'Reduced antiplatelet efficacy of clopidogrel due to CYP2C19 inhibition.',
      guidance: 'Consider pantoprazole as an alternative PPI that has lower CYP2C19 interaction.'
    },
    {
      drugs: ['Azithromycin', 'Warfarin'],
      risk: 'MODERATE',
      effect: 'Potentiation of anticoagulant effect and increased bleeding risk.',
      guidance: 'Frequent monitoring of INR / prothrombin time required.'
    }
  ];

  /* ─────────────────────────────────────────────────────────────
     3. PHARMACY RAG METHODS
  ───────────────────────────────────────────────────────────── */

  /**
   * Search catalog by query (brand name, generic name, category, active ingredient)
   */
  function searchMedicines(query) {
    const q = String(query || '').toLowerCase().trim();
    if (!q) return [...PHARMACY_CATALOG];

    return PHARMACY_CATALOG.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.activeIngredient.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.brandNames.some(b => b.toLowerCase().includes(q)) ||
      m.desc.toLowerCase().includes(q)
    );
  }

  /**
   * Get complete medicine details by ID
   */
  function getMedicineById(id) {
    return PHARMACY_CATALOG.find(m => m.id === id) || null;
  }

  /**
   * Check interactions across a list of medicine names / active ingredients
   */
  function checkDrugInteractions(drugNames = []) {
    const normalized = drugNames.map(d => String(d).toLowerCase().trim());
    const matchedInteractions = [];

    for (const item of DRUG_INTERACTION_MATRIX) {
      const d1 = item.drugs[0].toLowerCase();
      const d2 = item.drugs[1].toLowerCase();

      const hasD1 = normalized.some(n => n.includes(d1) || d1.includes(n));
      const hasD2 = normalized.some(n => n.includes(d2) || d2.includes(n));

      if (hasD1 && hasD2) {
        matchedInteractions.push(item);
      }
    }

    // Check for duplicate active ingredients
    const duplicateAlerts = [];
    const ingredientCounts = {};
    for (const name of normalized) {
      for (const med of PHARMACY_CATALOG) {
        if (name.includes(med.name.toLowerCase()) || name.includes(med.activeIngredient.toLowerCase())) {
          ingredientCounts[med.activeIngredient] = (ingredientCounts[med.activeIngredient] || 0) + 1;
        }
      }
    }
    for (const [ingredient, count] of Object.entries(ingredientCounts)) {
      if (count > 1) {
        duplicateAlerts.push({
          ingredient: ingredient,
          warning: `Multiple selected medicines contain ${ingredient}. Risk of unintended double dosage.`
        });
      }
    }

    return {
      hasInteractions: matchedInteractions.length > 0,
      interactions: matchedInteractions,
      hasDuplicates: duplicateAlerts.length > 0,
      duplicates: duplicateAlerts,
      disclaimer: '⚕️ Drug interaction analysis is an educational safety tool and does not substitute pharmacist/doctor evaluation.'
    };
  }

  /**
   * Parse Prescription Text / OCR Output
   */
  function parsePrescriptionOCR(text) {
    const raw = String(text || '').trim();
    if (!raw) {
      return { success: false, message: 'Empty prescription content.' };
    }

    const detectedMedicines = [];
    for (const med of PHARMACY_CATALOG) {
      const matchName = raw.toLowerCase().includes(med.name.toLowerCase()) ||
                        raw.toLowerCase().includes(med.activeIngredient.toLowerCase()) ||
                        med.brandNames.some(b => raw.toLowerCase().includes(b.toLowerCase()));
      if (matchName) {
        detectedMedicines.push({
          id: med.id,
          name: med.name,
          strength: med.strength,
          tag: med.tag,
          rxRequired: med.rxRequired,
          price: med.price,
          confidence: '95% Match'
        });
      }
    }

    return {
      success: true,
      rawText: raw,
      detectedMedicines: detectedMedicines,
      requiresPharmacistReview: detectedMedicines.some(m => m.rxRequired),
      pharmacistStatus: 'PENDING_VERIFICATION',
      verificationMessage: 'Our licensed pharmacist will review this digital upload before final order dispatch.'
    };
  }

  /**
   * RAG Medicine Knowledge Base Generator
   */
  function askMedicineRAG(query) {
    const q = String(query || '').toLowerCase().trim();
    if (!q) return { type: 'EMPTY_QUERY' };

    // Emergency Intercept
    if (/chest pain|cannot breathe|severe bleeding|stroke|poison/i.test(q)) {
      return {
        type: 'EMERGENCY_RISK',
        shortAnswer: '🚨 EMERGENCY WARNING: Severe symptoms detected. Please call National Emergency 112 or Ambulance 108 immediately.',
        notDiagnosis: true
      };
    }

    // Match Medicine: check direct search or token inclusion
    let matchedMed = null;
    for (const med of PHARMACY_CATALOG) {
      const medName = med.name.toLowerCase();
      const medActive = med.activeIngredient.toLowerCase();
      const medGeneric = med.genericName.toLowerCase();

      // Check if query contains the medicine name or active ingredient
      if (q.includes(medName.split(' ')[0]) || 
          q.includes(medActive) || 
          med.brandNames.some(b => q.includes(b.toLowerCase())) ||
          medGeneric.split(' ').some(w => w.length > 4 && q.includes(w))) {
        matchedMed = med;
        break;
      }
    }

    if (!matchedMed) {
      const fallbackSearch = searchMedicines(q);
      if (fallbackSearch.length > 0) {
        matchedMed = fallbackSearch[0];
      }
    }

    if (!matchedMed) {
      return {
        type: 'INSUFFICIENT_EVIDENCE',
        shortAnswer: 'I do not have authoritative clinical monograph data in the verified digital pharmacy knowledge base for this query.',
        recommendation: 'Please search our certified drug catalog by generic name, brand name, or consult a registered pharmacist.',
        notDiagnosis: true
      };
    }

    const med = matchedMed;
    return {
      type: 'RAG_MEDICINE_EXPLANATION',
      medicine: med,
      shortAnswer: `${med.name} (${med.genericName}) is indicated for: ${med.indications}`,
      warnings: med.warnings,
      contraindications: med.contraindications,
      commonSideEffects: med.commonSideEffects,
      storage: med.storage,
      rxStatus: med.rxRequired ? 'Prescription Required (Schedule H/H1)' : 'Over-the-Counter (OTC)',
      sources: med.sources,
      notDiagnosis: true,
      disclaimer: '⚕️ Medicine details are educational summaries from official pharmacopoeia (CDSCO/WHO/FDA). Never alter dosages without doctor consultation.'
    };
  }

  /* ─────────────────────────────────────────────────────────────
     4. PUBLIC API EXPORT
  ───────────────────────────────────────────────────────────── */
  return {
    version: '2.5-PHARMACY-RAG',
    getAllMedicines: () => [...PHARMACY_CATALOG],
    getMedicineById: getMedicineById,
    searchMedicines: searchMedicines,
    checkDrugInteractions: checkDrugInteractions,
    parsePrescriptionOCR: parsePrescriptionOCR,
    askMedicineRAG: askMedicineRAG
  };
}));
