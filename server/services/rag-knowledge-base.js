/**
 * server/services/rag-knowledge-base.js
 * MedInVedic RAG Knowledge Base
 * ─────────────────────────────────────────────────────────────────
 * Structured document chunks covering all 20 Health Hub domains:
 * - Lab report interpretation, drug interactions, symptom triage,
 *   Ayurvedic protocols, ICMR nutrition guidelines, preventive care,
 *   Indian medicine catalog, emergency escalation rules.
 *
 * Each chunk: { id, domain, title, content, tags[], source, tier }
 * Retrieval: keyword cosine-like overlap scoring (no external deps).
 * ─────────────────────────────────────────────────────────────────
 */

const KNOWLEDGE_BASE = [

  // ── LAB REPORTS & BIOMARKERS ──────────────────────────────────────
  {
    id: 'lab_glucose_001',
    domain: 'lab_report',
    title: 'Fasting Plasma Glucose Interpretation',
    content: `Fasting Plasma Glucose (FPG) reference ranges: Normal 70–99 mg/dL. Impaired Fasting Glycaemia (Prediabetes) 100–125 mg/dL. Diabetes ≥126 mg/dL (confirmed on two separate occasions per ADA 2024). Postprandial glucose (2-hour OGTT): Normal <140 mg/dL, Prediabetes 140–199 mg/dL, Diabetes ≥200 mg/dL. Action: FPG 100–125 warrants dietary counselling, lifestyle modification, HbA1c measurement, and physician review. Ayurvedic perspective: Elevated glucose correlates with Medovaha Srotas imbalance and Kapha-Pitta Vikara. Recommended: reduced Madhura (sweet) Rasa, Triphala, Gymnema sylvestre (Gudmar), Karela (Bitter Gourd) supplementation alongside conventional management.`,
    tags: ['glucose', 'blood sugar', 'diabetes', 'prediabetes', 'FPG', 'HbA1c', 'fasting'],
    source: 'ADA Standards of Care 2024; ICMR Clinical Guidelines on Diabetes 2023; Charaka Samhita Sutrasthana Ch. 21',
    tier: 'Gold Standard Clinical'
  },
  {
    id: 'lab_hb_001',
    domain: 'lab_report',
    title: 'Hemoglobin and Anemia Interpretation',
    content: `Hemoglobin reference ranges (WHO 2023): Men ≥13 g/dL, Women ≥12 g/dL, Pregnant Women ≥11 g/dL, Children 6–14 yrs ≥11.5 g/dL. Mild Anemia: Hb 10–11.9 (women)/10–12.9 (men). Moderate Anemia: Hb 7–9.9. Severe Anemia: Hb <7 g/dL. Iron-deficiency anemia is the most common cause in India (NFHS-5: 57% women). Investigate with serum ferritin, TIBC, peripheral blood smear. Management: oral iron (ferrous sulfate 200 mg TDS), vitamin C co-supplementation, dietary iron (green leafy vegetables, jaggery, ragi). Ayurveda: correlates with Pandu Roga. Recommended: Punarnava Mandur, Lauha Bhasma, Amalaki, iron-rich diet.`,
    tags: ['hemoglobin', 'anemia', 'iron', 'Hb', 'CBC', 'blood count'],
    source: 'WHO Haemoglobin Concentrations for Anaemia Diagnosis 2023; ICMR NIN Guidelines',
    tier: 'WHO Standard'
  },
  {
    id: 'lab_cholesterol_001',
    domain: 'lab_report',
    title: 'Lipid Profile Interpretation',
    content: `Lipid panel reference ranges (ACC/AHA 2023; ICMR India): Total Cholesterol: Desirable <200 mg/dL, Borderline 200–239 mg/dL, High ≥240 mg/dL. LDL-C: Optimal <100 mg/dL (high-risk <70 mg/dL), Near Optimal 100–129, Borderline High 130–159, High 160–189, Very High ≥190. HDL-C: Low (risk) <40 (men) / <50 (women), Protective ≥60 mg/dL. Triglycerides: Normal <150 mg/dL, Borderline 150–199, High 200–499, Very High ≥500. Cardiovascular risk: calculated using Framingham or ASCVD 10-year risk score. Ayurvedic correlation: Ama accumulation and Rasa-Rakta Dushti. Recommended: Arjuna bark extract, Guggulu (Commiphora mukul), reduced saturated fat intake.`,
    tags: ['cholesterol', 'lipid', 'LDL', 'HDL', 'triglycerides', 'cardiovascular', 'lipid profile'],
    source: 'ACC/AHA 2023 Cholesterol Guidelines; ICMR CVD Prevention Guidelines',
    tier: 'Gold Standard Clinical'
  },
  {
    id: 'lab_kidney_001',
    domain: 'lab_report',
    title: 'Kidney Function Tests (KFT/RFT)',
    content: `Kidney Function Tests reference ranges: Serum Creatinine: Men 0.7–1.3 mg/dL, Women 0.5–1.1 mg/dL. BUN (Blood Urea Nitrogen) 7–20 mg/dL. Uric Acid: Men 3.4–7.0 mg/dL, Women 2.4–6.0 mg/dL. eGFR ≥90 mL/min/1.73m² (normal), 60–89 (mild reduction), 30–59 (moderate, CKD Stage 3), 15–29 (severe), <15 (kidney failure). Elevated creatinine may indicate dehydration, kidney disease, or muscle breakdown. Consult nephrologist for eGFR <60 persisting >3 months. Ayurveda: Mutravaha Srotas imbalance. Gokshura (Tribulus terrestris), Punarnava, adequate hydration (2–3L/day).`,
    tags: ['creatinine', 'kidney', 'renal', 'urea', 'BUN', 'uric acid', 'eGFR', 'KFT', 'RFT'],
    source: 'KDIGO 2023 CKD Guidelines; Harrison\'s Internal Medicine 21st Ed.',
    tier: 'Gold Standard Clinical'
  },
  {
    id: 'lab_thyroid_001',
    domain: 'lab_report',
    title: 'Thyroid Function Test Interpretation',
    content: `Thyroid Function: TSH (Thyroid Stimulating Hormone) normal range 0.4–4.0 mIU/L. Free T4 (FT4) 0.8–1.8 ng/dL. Free T3 (FT3) 2.3–4.1 pg/mL. Hypothyroidism: TSH >4.0 with low FT4 — symptoms: fatigue, weight gain, cold intolerance, constipation. Hyperthyroidism: TSH <0.4 with high FT4 — symptoms: weight loss, palpitations, heat intolerance, tremor. Subclinical hypothyroidism: elevated TSH, normal FT4 — monitor or treat based on clinical context. India has high prevalence of iodine deficiency and autoimmune thyroid disease. Ayurveda: Galaganda (goitre) linked to Kapha-Vata imbalance; Kanchanar Guggulu, Punarnava commonly used. Always consult endocrinologist before altering thyroid medications.`,
    tags: ['thyroid', 'TSH', 'T3', 'T4', 'hypothyroid', 'hyperthyroid', 'TFT'],
    source: 'ATA Guidelines 2023; Lancet Diabetes & Endocrinology; ICMR Thyroid Consensus',
    tier: 'Gold Standard Clinical'
  },
  {
    id: 'lab_liver_001',
    domain: 'lab_report',
    title: 'Liver Function Tests (LFT)',
    content: `Liver Function Tests: SGPT/ALT normal 7–40 U/L (Men up to 56 U/L per EASL 2023). SGOT/AST normal 10–40 U/L. Alkaline Phosphatase (ALP) 44–147 U/L. Total Bilirubin 0.2–1.2 mg/dL, Direct 0–0.3 mg/dL. Albumin 3.5–5.0 g/dL. Elevated transaminases (>3x ULN) warrant investigation for viral hepatitis (B, C), fatty liver (NAFLD/NASH), alcohol use, or drug hepatotoxicity. ALP elevation with elevated GGT suggests biliary obstruction or cholestasis. Bilirubin >3 mg/dL causes clinical jaundice. Ayurveda: Yakrit Roga (hepatic disease) managed with Arogyavardhini Vati, Bhumi Amla (Phyllanthus niruri), Kutki (Picrorhiza kurroa). Consult gastroenterologist for persistent LFT elevation.`,
    tags: ['liver', 'SGPT', 'SGOT', 'ALT', 'AST', 'bilirubin', 'LFT', 'hepatitis', 'jaundice', 'albumin'],
    source: 'EASL Clinical Practice Guidelines 2023; Harrison\'s Principles',
    tier: 'Gold Standard Clinical'
  },

  // ── DRUG INTERACTIONS ─────────────────────────────────────────────
  {
    id: 'drug_int_001',
    domain: 'drug_interaction',
    title: 'Warfarin Drug Interactions',
    content: `Warfarin (anticoagulant) has numerous clinically significant interactions. HIGH RISK interactions requiring dose adjustment or monitoring: NSAIDs (aspirin, ibuprofen) — increase bleeding risk significantly. Antibiotics (metronidazole, ciprofloxacin, clarithromycin) — inhibit CYP2C9, increase INR. Antifungals (fluconazole) — potentiate anticoagulation. Amiodarone — increases warfarin effect substantially. Rifampicin — induces CYP2C9, reduces warfarin effect. Herb-drug: St. John's Wort reduces warfarin (CYP3A4 induction). Ginkgo biloba, high-dose vitamin E, and garlic supplements increase bleeding risk. Vitamin K-rich foods (spinach, kale) antagonize warfarin — maintain consistent intake. Monitor INR regularly. Consult treating cardiologist before any new medication.`,
    tags: ['warfarin', 'anticoagulant', 'blood thinner', 'INR', 'bleeding', 'drug interaction'],
    source: 'British National Formulary (BNF) 2024; Drugs.com Interaction Database; Stockley\'s Drug Interactions 12th Ed.',
    tier: 'Clinical Pharmacology Reference'
  },
  {
    id: 'drug_int_002',
    domain: 'drug_interaction',
    title: 'Metformin Drug Interactions',
    content: `Metformin (type 2 diabetes first-line drug) interactions: Contrast media (iodinated) — hold metformin 48h before/after contrast procedures (risk of lactic acidosis). Alcohol — increases lactic acidosis risk. Cimetidine — increases metformin plasma levels. Topiramate, zonisamide — may increase lactic acidosis risk. ACE inhibitors — may enhance glucose-lowering effect (hypoglycemia risk). Furosemide — may increase metformin levels. Metformin reduces vitamin B12 absorption (check B12 annually in long-term users). Herb interactions: Gymnema sylvestre, Karela (bitter gourd), Fenugreek (methi) — additive glucose-lowering, monitor for hypoglycemia. Safe in combination with most antihypertensives. Contraindicated in eGFR <30 mL/min.`,
    tags: ['metformin', 'diabetes', 'glucophage', 'blood sugar', 'drug interaction', 'glycomet'],
    source: 'American Diabetes Association 2024; BNF 2024; CDSCO Prescribing Guide',
    tier: 'Clinical Pharmacology Reference'
  },
  {
    id: 'drug_int_003',
    domain: 'drug_interaction',
    title: 'Amlodipine Drug Interactions',
    content: `Amlodipine (calcium channel blocker, antihypertensive) interactions: Simvastatin — amlodipine increases simvastatin levels by 77% (cap simvastatin at 20 mg/day). Cyclosporine — amlodipine increases cyclosporine levels. CYP3A4 inhibitors (clarithromycin, ketoconazole, grapefruit juice) — increase amlodipine plasma levels, enhanced hypotension. CYP3A4 inducers (rifampicin, carbamazepine) — reduce amlodipine efficacy. NSAIDs — may attenuate antihypertensive effect and worsen kidney function. Herb interactions: Licorice (Yashtimadhu) may increase blood pressure when used in excess. Arjuna (Terminalia arjuna) has additive cardiac effects — monitor with amlodipine. Generally safe with most diuretics and ACE inhibitors. Do not stop amlodipine abruptly (rebound hypertension risk).`,
    tags: ['amlodipine', 'amlong', 'calcium channel blocker', 'hypertension', 'blood pressure', 'drug interaction'],
    source: 'BNF 2024; Stockley\'s Drug Interactions; JNC 8 Guidelines',
    tier: 'Clinical Pharmacology Reference'
  },
  {
    id: 'drug_int_004',
    domain: 'drug_interaction',
    title: 'Herb-Drug Interactions: Ashwagandha',
    content: `Ashwagandha (Withania somnifera) — clinically documented interactions: Thyroid medications (levothyroxine) — Ashwagandha may increase thyroid hormone levels; monitor TSH every 3 months. Immunosuppressants (cyclosporine, tacrolimus) — Ashwagandha's immunostimulant effect may reduce immunosuppressant efficacy. Sedatives, benzodiazepines, CNS depressants — additive sedation risk. Antidiabetic drugs — additive glucose-lowering effect, monitor blood sugar. Antihypertensives — additive blood pressure lowering. Anticoagulants — theoretical increased bleeding risk. Contraindicated in: pregnancy (uterine stimulant), active autoimmune diseases, thyroid disorders (without physician supervision). Evidence level: Level B clinical studies available for adaptogenic and thyroid effects. Standard dose KSM-66: 300–600 mg/day of root extract.`,
    tags: ['ashwagandha', 'withania', 'herb drug interaction', 'ayurvedic', 'adaptogen'],
    source: 'AYUSH Ministry Herb-Drug Interaction Database 2023; Journal of Ethnopharmacology',
    tier: 'AYUSH Validated Protocol'
  },
  {
    id: 'drug_int_005',
    domain: 'drug_interaction',
    title: 'Atorvastatin Drug Interactions',
    content: `Atorvastatin (statin, cholesterol-lowering) interactions: CYP3A4 inhibitors (itraconazole, clarithromycin, ritonavir, grapefruit juice) — significantly increase statin plasma levels, raising rhabdomyolysis risk. Gemfibrozil — increase statin levels; combination generally avoided. Niacin — increase myopathy risk, especially at high doses. Colchicine — increases myopathy risk. Antacids (Maalox) — may reduce atorvastatin absorption by 35% (space by 2 hours). Digoxin — atorvastatin increases digoxin levels by 20%. Herb interactions: Red yeast rice contains natural statins — avoid combining (additive toxicity). Coenzyme Q10 depletion is common with statins — supplementation may help with myalgia. Monitor: CK (creatine kinase) if unexplained muscle pain; LFT at baseline and 12 weeks.`,
    tags: ['atorvastatin', 'lipitor', 'statin', 'cholesterol', 'drug interaction', 'myopathy'],
    source: 'BNF 2024; ACC/AHA Statin Safety Guidelines 2023',
    tier: 'Clinical Pharmacology Reference'
  },

  // ── SYMPTOM TRIAGE ────────────────────────────────────────────────
  {
    id: 'symptom_emergency_001',
    domain: 'symptom_triage',
    title: 'Emergency Red Flag Symptoms',
    content: `IMMEDIATE EMERGENCY (Call 112 / 108): Chest pain or pressure — especially crushing, radiating to left arm/jaw (possible myocardial infarction). Sudden severe headache ("thunderclap") — may indicate subarachnoid haemorrhage. Facial drooping + arm weakness + slurred speech (FAST stroke criteria). Difficulty breathing, stridor, or complete choking. Loss of consciousness or unresponsiveness. Anaphylaxis: throat swelling, hives, shock after exposure to allergen. Vomiting blood or coughing up blood. Seizures lasting >5 minutes (status epilepticus). Severe abdominal pain with rigid abdomen. High fever (>40°C) with stiff neck and light sensitivity (meningitis). Pregnancy: heavy vaginal bleeding, severe headache with vision changes (eclampsia risk). ALL of the above require immediate emergency department evaluation — do not delay for home management.`,
    tags: ['emergency', 'chest pain', 'stroke', 'heart attack', 'unconscious', 'breathing', 'seizure', '112', '108'],
    source: 'National Health Mission Emergency Protocols; AHA ACLS Guidelines 2023',
    tier: 'Emergency Medical Protocol'
  },
  {
    id: 'symptom_fever_001',
    domain: 'symptom_triage',
    title: 'Fever Assessment and Management',
    content: `Fever classification: Low-grade fever 37.5–38.0°C. Moderate fever 38.1–39.0°C. High fever 39.1–40.0°C. Hyperpyrexia >40.0°C (medical emergency). Common causes in India: Viral infections (influenza, COVID-19, dengue), malaria (P. vivax/falciparum — especially in monsoon, evaluate with rapid test), typhoid (Widal test, blood culture), urinary tract infection. Warning signs requiring urgent care: Fever >3 days without improvement, fever with rash (dengue: petechiae/rash), fever with bleeding manifestations (dengue haemorrhagic fever), fever with altered consciousness, rigors and chills recurring cyclically (malaria pattern), fever in children <3 months (always urgent). Management: Paracetamol 500–1000 mg Q6H (adults), adequate oral hydration 3–4 L/day, rest. Ayurveda: Jwara (fever) management with Giloy (Tinospora cordifolia), Tulsi (Ocimum sanctum), Sudarshan Ghana Vati.`,
    tags: ['fever', 'temperature', 'dengue', 'malaria', 'typhoid', 'viral fever', 'jwara'],
    source: 'NVBDCP India Dengue/Malaria Protocol; IAP Fever Guidelines',
    tier: 'National Health Protocol'
  },
  {
    id: 'symptom_headache_001',
    domain: 'symptom_triage',
    title: 'Headache Evaluation',
    content: `Headache types and triage: URGENT (same-day evaluation): New severe headache ("worst of life"), headache with fever + stiff neck, headache with vision changes/papilloedema, headache after head trauma, headache with focal neurological deficits. Migraine (episodic, throbbing, unilateral, photophobia): acute treatment — triptans (sumatriptan), NSAIDs, antiemetics. Preventive: propranolol, amitriptyline, topiramate. Tension-type headache (bilateral, pressure/tightening, no nausea): paracetamol, ibuprofen, relaxation therapy. Cervicogenic headache: physiotherapy, posture correction. Red flags (SNOOP4): Systemic signs, Neurological symptoms, Onset sudden, Older age >50, Position-related, Progressive, Pregnancy. Ayurveda: Shirashoola — Tila oil Nasya (nasalization), Brahmi Ghrita, Sirodhara therapy for chronic migraine.`,
    tags: ['headache', 'migraine', 'tension headache', 'cluster headache', 'shirashoola'],
    source: 'International Headache Society ICHD-3; Neurology India Guidelines',
    tier: 'Specialist Clinical Reference'
  },

  // ── NUTRITION & DIET ──────────────────────────────────────────────
  {
    id: 'nutrition_icmr_001',
    domain: 'nutrition',
    title: 'ICMR-NIN Dietary Reference Intakes for Indians',
    content: `ICMR-NIN Dietary Guidelines for Indians 2024 — Recommended Dietary Allowances (RDA): Calories: Men 2730 kcal/day (moderate activity), Women 2090 kcal/day. Protein: 0.83 g/kg body weight/day (WHO/ICMR 2024). Fat: 20–30% of total calories; saturated fat <10%. Carbohydrates: 50–60% total calories; prefer complex carbs. Fibre: 25–30 g/day. Key micronutrients: Iron (men 17 mg, women 21 mg/day). Calcium 600–800 mg. Vitamin D 600 IU (15 mcg). Folate 200 mcg (400 mcg in pregnancy). Vitamin B12 1 mcg/day. India-specific: 57% Indians are deficient in vitamin D (outdoor exposure + dietary supplementation needed). Address B12 deficiency in vegetarians. Promote millets (ragi, jowar, bajra) — nutritional superiority over polished rice/wheat.`,
    tags: ['nutrition', 'ICMR', 'diet', 'calories', 'protein', 'vitamins', 'minerals', 'Indian diet', 'RDA'],
    source: 'ICMR-NIN Dietary Guidelines for Indians 2024',
    tier: 'National Nutrition Authority'
  },
  {
    id: 'nutrition_south_indian_001',
    domain: 'nutrition',
    title: 'South Indian Balanced Meal Plan',
    content: `South Indian Balanced Daily Meal Plan (ICMR-aligned): Breakfast (600–700 kcal): Steamed ragi idli (3 pieces, 180g) — 210 kcal, 6g protein, 38g carbs. Sambar with drumstick/tomato — 80 kcal. Coconut chutney (1 tbsp) — 45 kcal. Green tea / Herbal decoction (no sugar). Lunch (700–800 kcal): Hand-pounded red rice or brown rice (1.5 cups cooked) — 330 kcal. Toor dal sambar — 120 kcal, 8g protein. Vegetable poriyal (beans, cabbage, carrot) — 60 kcal, 3g fibre. Buttermilk with cumin (1 glass) — 40 kcal. Dinner (500–600 kcal): Ragi mudde or 2 multigrain rotis — 250 kcal. Ridge gourd (turai) kootu with moong dal — 120 kcal, 7g protein. Warm turmeric milk (haldi doodh) — 120 kcal. Snacks (200–300 kcal): Boiled sprouted moong (1 cup), roasted peanuts (20g), seasonal fruits. Total estimated: 2000–2200 kcal. Protein 65–75g. Fibre 28g.`,
    tags: ['south indian diet', 'Tamil', 'Karnataka', 'Kerala', 'Andhra', 'ragi', 'idli', 'sambar', 'meal plan'],
    source: 'ICMR-NIN 2024; National Institute of Nutrition Regional Dietary Patterns',
    tier: 'National Nutrition Authority'
  },
  {
    id: 'nutrition_north_indian_001',
    domain: 'nutrition',
    title: 'North Indian Balanced Meal Plan',
    content: `North Indian Balanced Daily Meal Plan (ICMR-aligned): Breakfast (550–650 kcal): Moong dal cheela (2 pieces) — 200 kcal, 12g protein. Mint-coriander chutney — 20 kcal. Low-fat yoghurt raita (100g) — 60 kcal. Masala chai (no sugar or jaggery-sweetened). Lunch (700–800 kcal): 2 whole wheat rotis (70g) — 200 kcal. Rajma or black chana curry (1 cup) — 210 kcal, 12g protein, 7g fibre. Bottle gourd (lauki) sabzi — 55 kcal. Fresh salad (cucumber, onion, lemon) — 35 kcal. Dal tadka with ghee tempering — 140 kcal. Dinner (450–550 kcal): 1 multigrain phulka. Yellow moong dal with cumin-hing tadka — 145 kcal, 8g protein. Sautéed French beans with mustard seeds — 60 kcal. Chamomile or Triphala herbal tea. Snacks: Roasted chana (30g), seasonal fruit (1 medium). Total: 1900–2100 kcal, Protein 70–80g.`,
    tags: ['north indian diet', 'roti', 'rajma', 'dal', 'Punjab', 'UP', 'Delhi', 'meal plan'],
    source: 'ICMR-NIN 2024; Regional Indian Dietary Guidelines',
    tier: 'National Nutrition Authority'
  },
  {
    id: 'nutrition_ayurvedic_001',
    domain: 'nutrition',
    title: 'Ayurvedic Sattvic Diet Principles',
    content: `Ayurvedic Sattvic (Sattvik) Diet principles (Charaka Samhita, Sutrasthana Ch. 5, 27): Promote: fresh whole foods cooked with love and awareness, warm cooked meals, easily digestible grains (white rice, oats, wheat), natural sweet foods (fruits, sweet root vegetables), milk products (cow's milk, ghee), nuts and seeds. Avoid: processed/packaged foods, leftover/reheated food (Viruddha Anna), excessive sour/pungent/salty tastes, stimulants (excessive coffee, alcohol). Kitchari (equal parts rice + moong dal + ghee + turmeric + cumin): foundational cleansing meal, balances all three doshas. CCF Tea (cumin + coriander + fennel): digestive, carminative, improves Agni. Timings: breakfast at sunrise, largest meal at noon (Pitta peak), light dinner before 8 PM. Seasonal eating (Ritucharya): align diet with 6 Indian seasons. Dosha-specific advice: Vata — warm, oily, sweet/sour/salty; Pitta — cool, bitter/sweet/astringent; Kapha — light, pungent/bitter/astringent.`,
    tags: ['ayurvedic diet', 'sattvic', 'kitchari', 'dosha', 'vata', 'pitta', 'kapha', 'CCF tea', 'agni'],
    source: 'Charaka Samhita Sutrasthana Ch. 5 & 27; Ashtanga Hridayam; Ministry of AYUSH Guidelines',
    tier: 'AYUSH Validated Protocol'
  },

  // ── MEDICINE CATALOG & AYURVEDA ───────────────────────────────────
  {
    id: 'med_catalog_001',
    domain: 'medicine_catalog',
    title: 'Common OTC Medicines in India',
    content: `Common OTC and prescription medicines: Paracetamol (Calpol, Dolo 650) — analgesic/antipyretic, 325–650 mg per dose, max 4g/day (adults), avoid in liver disease. Ibuprofen (Brufen, Combiflam) — NSAID, 200–400 mg TDS with food, avoid in renal impairment, peptic ulcers, pregnancy third trimester. Cetirizine (Zyrtec, Cetzine) — antihistamine for allergies, 10 mg OD, causes drowsiness. Pantoprazole (Pantop, Pan-D) — PPI for acidity/GERD, 40 mg before breakfast, do not crush. Domperidone (Domstal) — antiemetic, 10 mg TDS before meals. Azithromycin (Zithromax) — macrolide antibiotic, 500 mg OD x 3 days (Schedule H, requires Rx). Metronidazole (Flagyl) — antiprotozoal/antibiotic for GI infections, 400 mg TID. Omeprazole (Omez) — PPI 20 mg, take 30 min before food. All Schedule H1/X drugs require valid registered medical practitioner prescription.`,
    tags: ['paracetamol', 'ibuprofen', 'antibiotic', 'OTC', 'medicine', 'azithromycin', 'pantoprazole', 'omeprazole'],
    source: 'CDSCO Drug Database 2024; DGHS India; BNF India',
    tier: 'Regulatory Reference'
  },
  {
    id: 'med_ayurveda_001',
    domain: 'medicine_catalog',
    title: 'Common Ayurvedic Formulations',
    content: `Key AYUSH-certified Ayurvedic formulations: Triphala Churna (Amalaki + Bibhitaki + Haritaki) — rasayana, digestive, mild laxative, antioxidant, 1 tsp with warm water at bedtime. Chyawanprash — immunomodulator, rich in Vitamin C (Amalaki), 1–2 tsp daily. Ashwagandha (KSM-66, 300–600 mg) — adaptogen, reduces cortisol 28% (double-blind RCT), improves sleep quality. Brahmi (Bacopa monnieri, 300 mg) — cognitive enhancer, memory, anxiety. Guduchi/Giloy (Tinospora cordifolia) — immunomodulator, antipyretic, anti-inflammatory; effective in dengue, Swine flu. Shatavari (Asparagus racemosus) — female reproductive tonic, galactagogue. Arjuna Bark (Terminalia arjuna) — cardiotonic, reduces LDL, Angina support alongside cardiologist care. Neem (Azadirachta indica) — antibacterial, antidiabetic, skin health. Trikatu (Ginger + Black pepper + Long pepper) — digestive stimulant, improves bioavailability of other herbs.`,
    tags: ['ayurveda', 'triphala', 'ashwagandha', 'brahmi', 'giloy', 'chyawanprash', 'AYUSH', 'herbal'],
    source: 'Ministry of AYUSH National Formulary of Ayurvedic Medicine (NFAM) 2016; Pharmacopoeia of India',
    tier: 'AYUSH Validated Protocol'
  },

  // ── PREVENTIVE HEALTH & SCREENINGS ───────────────────────────────
  {
    id: 'preventive_001',
    domain: 'preventive_health',
    title: 'Preventive Health Screenings by Age (India)',
    content: `ICMR/WHO Recommended Preventive Screenings for Indians: Age 18–30: BP check annually, BMI assessment, dental check 6-monthly, eye test every 2 years, STI screening if indicated. Age 30–40: + Fasting glucose every 3 years, lipid profile every 5 years, pap smear (women, 3-yearly), breast self-exam monthly + clinical exam annually, HBsAg/anti-HCV (one-time). Age 40–50: + Annual lipid profile, FPG/HbA1c annually (if family history), mammography every 2 years (women 40–74), colonoscopy every 10 years (or sigmoidoscopy every 5 years) from 45. Age 50+: + Annual prostate PSA screening (men, discuss with physician), DEXA bone density scan (women post-menopause), yearly ophthalmology (glaucoma/cataract), annual influenza vaccination, pneumococcal vaccine.`,
    tags: ['preventive', 'screening', 'mammogram', 'colonoscopy', 'BP', 'cholesterol', 'cancer screening', 'annual check'],
    source: 'ICMR Preventive Oncology Guidelines; WHO Health Screening Recommendations; NHM India',
    tier: 'National Health Protocol'
  },
  {
    id: 'vaccine_001',
    domain: 'preventive_health',
    title: 'Adult Vaccination Schedule India',
    content: `Adult Vaccination Schedule for India (IAP/NHM 2024): Annual Influenza vaccine: recommended for all adults >50, healthcare workers, pregnant women, immunocompromised. COVID-19 boosters as per GOI advisories. Hepatitis B (3-dose series) if not vaccinated previously — essential for healthcare workers. Typhoid: conjugate vaccine (Typbar-TCV) every 3 years if travelling to endemic areas. Tdap/Td: Tetanus booster every 10 years. Pneumococcal (PPSV23): adults >65 and immunocompromised. HPV vaccine (Gardasil 4/9): recommended up to age 45 for women; prevents cervical cancer. Meningococcal: pilgrims to Hajj/Umra, close contacts of meningitis cases. Travel vaccines: Yellow fever (mandatory for Africa/Latin America); Japanese Encephalitis (endemic areas). Record all vaccinations in digital health record.`,
    tags: ['vaccine', 'vaccination', 'immunization', 'flu shot', 'hepatitis B', 'typhoid', 'HPV', 'tetanus'],
    source: 'IAP Adult Immunization Guidelines 2024; GOI NHM Immunization Programme',
    tier: 'National Health Protocol'
  },

  // ── EMERGENCY CARD ────────────────────────────────────────────────
  {
    id: 'emergency_001',
    domain: 'emergency',
    title: 'Emergency Medical Card Information Guide',
    content: `Emergency Medical Card should contain: Full name, Date of birth, Blood group, Rh factor. Critical allergies (drugs, foods, latex, contrast media). Chronic conditions (diabetes, hypertension, heart disease, epilepsy, asthma, CKD, HIV). Current medications with dosages (especially anticoagulants, insulin, antiepileptics, cardiac drugs). Emergency contacts (primary + secondary with relationship and phone). Treating physician contact. Health insurance details (insurer, policy number, cashless hospital list). Advance directives or DNR status if applicable. Nearest preferred hospital. Language preference for care. Organ donor status. QR code should link to minimal essential information only — not full medical records. Revoke sharing token immediately after emergency consultation is over.`,
    tags: ['emergency card', 'blood group', 'allergy', 'emergency contact', 'medical ID', 'ICE'],
    source: 'NABH Emergency Care Standards; Red Cross Emergency Medical ID Guidelines',
    tier: 'Safety Protocol'
  },

  // ── HEALTH EXPENSE ───────────────────────────────────────────────
  {
    id: 'expense_80d_001',
    domain: 'health_expense',
    title: 'Section 80D Health Insurance Tax Deduction (India)',
    content: `Section 80D Income Tax Act India — Deduction limits (FY 2023-24, AY 2024-25): Individual + Family (self, spouse, dependent children): Up to ₹25,000 premium paid. If self/family + parents (both <60 years): ₹25,000 + ₹25,000 = ₹50,000. If self/family + parents (one/both Senior Citizens ≥60 years): ₹25,000 + ₹50,000 = ₹75,000. If self is also Senior Citizen: ₹50,000 + ₹50,000 = ₹1,00,000. Preventive health check-up: Additional ₹5,000 included within limits above. Eligible expenses: Health insurance premiums, CGHS contribution, preventive check-up costs. Not eligible: Life insurance premiums, hospital bills (only insurance premiums). Payment: Must be by mode other than cash (net banking, UPI, cheque). Keep all insurance receipts and health check-up bills for audit.`,
    tags: ['80D', 'tax', 'health insurance', 'income tax', 'deduction', 'medical expenses', 'Section 80D'],
    source: 'Income Tax Act 1961, Section 80D; CBDT Circular 2024',
    tier: 'Government Regulatory'
  },

  // ── DIGITAL HEALTH LOCKER ─────────────────────────────────────────
  {
    id: 'locker_ayushman_001',
    domain: 'health_locker',
    title: 'Ayushman Bharat Health Account (ABHA) and Digital Health Records',
    content: `Ayushman Bharat Health Account (ABHA) — National Digital Health Mission (NDHM): ABHA ID (14-digit) is your unique health identifier linked to Aadhaar or mobile. Benefits: Access health records from any ABDM-linked hospital/lab. PHR (Personal Health Record) apps: ABDM-compliant apps can store prescriptions, lab reports, discharge summaries. Health Information Exchange: Share records with treating doctors securely via token-based consent. Key rights: Right to access your own health data, right to consent before sharing, right to revoke access at any time. Categories of health records: OPD visits, Prescriptions, Lab reports, Diagnostic imaging (X-ray, CT, MRI), Discharge summaries, Vaccination records, Wellness records. Stored under DPDP Act 2023 protection. Log every document access for audit trail (who accessed, when, IP address).`,
    tags: ['ABHA', 'health record', 'digital health', 'NDHM', 'PHR', 'Ayushman Bharat', 'health locker'],
    source: 'Ministry of Health & Family Welfare; NDHM ABDM Framework 2023; DPDP Act 2023',
    tier: 'Government Digital Health Initiative'
  },

  // ── VOICE ASSISTANT Q&A ──────────────────────────────────────────
  {
    id: 'voice_001',
    domain: 'voice_assistant',
    title: 'Common Health Questions and Evidence-Based Answers',
    content: `Frequently asked health questions with grounded answers: Q: What is normal blood pressure? A: Optimal: <120/80 mmHg. Elevated: 120–129/<80. Stage 1 Hypertension: 130–139/80–89. Stage 2: ≥140/≥90. Hypertensive crisis: >180/>120 (seek emergency care). Q: How much water should I drink? A: General recommendation: 2–3 litres/day for adults (ICMR: ~35 mL/kg body weight). Increase in heat, fever, exercise, kidney stones. Q: What is BMI? A: Body Mass Index = weight(kg) / height(m)². For Indians (WHO Asia-Pacific cutoffs): <18.5 underweight, 18.5–22.9 normal, 23–24.9 overweight, ≥25 obese. Q: When should I see a doctor for a cough? A: Cough persisting >3 weeks, bloody sputum (haemoptysis), weight loss, night sweats — urgently rule out tuberculosis (India has highest TB burden globally). Q: Can I take two pain relievers together? A: Paracetamol + ibuprofen can be safely alternated (staggered doses) for short-term pain; do not combine two NSAIDs. Never exceed maximum daily doses.`,
    tags: ['blood pressure', 'water intake', 'BMI', 'cough', 'pain reliever', 'common questions'],
    source: 'ICMR Clinical Guidelines; WHO; AHA/ACC Hypertension Guidelines 2023',
    tier: 'Clinical Reference'
  }
];

/**
 * Retrieve top-K most relevant knowledge chunks for a query.
 * Uses TF-IDF-style keyword overlap scoring.
 */
function retrieveChunks(query, topK = 4, domain = null) {
  const queryWords = tokenize(query);

  let pool = domain ? KNOWLEDGE_BASE.filter(c => c.domain === domain) : KNOWLEDGE_BASE;

  const scored = pool.map(chunk => {
    const chunkWords = tokenize(chunk.title + ' ' + chunk.content + ' ' + chunk.tags.join(' '));
    const overlap = queryWords.filter(w => chunkWords.includes(w)).length;
    // Boost for title matches
    const titleBoost = queryWords.filter(w => tokenize(chunk.title).includes(w)).length * 2;
    // Boost for tag matches
    const tagBoost = chunk.tags.filter(t => queryWords.some(w => t.toLowerCase().includes(w))).length * 1.5;
    return { chunk, score: overlap + titleBoost + tagBoost };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  'the','and','for','with','that','this','from','have','are','was','were','been',
  'will','can','may','should','does','did','but','not','any','all','per','has',
  'its','our','your','their','also','each','into','what','when','how','which'
]);

/**
 * Format retrieved chunks as a structured context string for the LLM.
 */
function buildContext(chunks) {
  if (!chunks.length) return 'No specific knowledge base entries found for this query.';
  return chunks.map((c, i) =>
    `[Source ${i + 1}] ${c.title}\n${c.content}\nReference: ${c.source} (${c.tier})`
  ).join('\n\n---\n\n');
}

/**
 * Build structured citations from retrieved chunks.
 */
function buildCitations(chunks) {
  return chunks.map((c, i) => ({
    index: i + 1,
    title: c.title,
    source: c.source,
    tier: c.tier,
    domain: c.domain
  }));
}

module.exports = { KNOWLEDGE_BASE, retrieveChunks, buildContext, buildCitations };
