/**
 * rag-knowledge-base.js — MedInVedic RAG Curated Medical Knowledge Base
 * ═══════════════════════════════════════════════════════════════════════
 * Evidence Tiers:
 *   Tier 1 — WHO, CDC, NHS, MoHFW: Authoritative international/national guidelines
 *   Tier 2 — Clinical Pharmacology: Evidence-based drug/therapy monographs
 *   Tier 3 — AYUSH / Traditional: Ayurvedic Pharmacopoeia of India; evidence-limited
 *
 * DISCLAIMER: This knowledge base is for educational/informational use only.
 * It is NOT a substitute for professional medical diagnosis or treatment.
 */

const RAG_KB = [

  // ─────────────────────────────────────────────────
  // FEVER
  // ─────────────────────────────────────────────────
  {
    doc_id: "fever_who_001",
    title: "Fever in Adults: Management Guidelines",
    source: "World Health Organization (WHO) / NHS Clinical Knowledge Summary",
    source_url: "https://www.who.int/emergencies/disease-outbreak-news",
    organization: "WHO / NHS",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["fever", "high temperature", "pyrexia", "hyperthermia"],
    keywords: ["fever", "temperature", "high fever", "pyrexia", "thermometer", "chills", "sweating", "hot", "38 degrees", "39 degrees", "febrile"],
    content: `Fever (pyrexia) is defined as a body temperature above 38°C (100.4°F) measured orally. It is typically a sign that the body is fighting an infection or responding to inflammation.

DIRECT ANSWER: Fever itself is usually a beneficial immune response. Most fevers in adults are caused by viral infections and resolve within a few days with supportive care. A single temperature reading above 38°C is not an emergency in a healthy adult, but fever that is very high (above 39.5°C / 103°F), persistent, or accompanied by alarming symptoms requires prompt medical attention.

WHAT THIS MAY MEAN — COMMON CAUSES:
1. Viral upper respiratory tract infection (most common): Cold, influenza, COVID-19
2. Urinary tract infection (UTI): Especially if associated with burning urination
3. Bacterial throat infection (pharyngitis/tonsillitis): Sore throat, white patches on tonsils
4. Dengue fever: Joint pain, rash, behind-eye pain — especially in tropical regions
5. Typhoid: Prolonged fever with abdominal discomfort
6. Malaria: Cyclical fever with rigors — in endemic areas
Note: Symptoms alone cannot confirm a diagnosis. Testing is required.

WARNING SIGNS — SEEK URGENT CARE:
• Temperature above 39.5°C (103°F) not responding to paracetamol/ibuprofen
• Fever lasting more than 3 days
• Severe headache + stiff neck + light sensitivity (possible meningitis)
• Confusion, altered consciousness, or seizures
• Difficulty breathing, chest pain, or persistent vomiting
• Rash that does not fade when a glass is pressed on it (non-blanching — possible meningococcal disease)
• Fever in immunocompromised individuals or during pregnancy

SELF-CARE (EVIDENCE-BASED SUPPORTIVE MEASURES):
• Rest and stay hydrated — fever causes increased fluid loss. Drink water, oral rehydration solutions, diluted fruit juices, or warm broths.
• Use a lightweight blanket — do not over-wrap (can increase temperature)
• Tepid sponging may provide temporary comfort (not proven to lower core temperature)
• Oral Paracetamol (Acetaminophen) 500–1000mg every 4–6 hours (max 4g/day) is evidence-based first-line fever management for adults
• Ibuprofen 400mg every 6–8 hours with food is an alternative if no contraindications (avoid in kidney disease, peptic ulcer, asthma)
• Do NOT use Aspirin in children or adolescents due to risk of Reye syndrome`,
    disclaimer: "These symptoms can occur with many conditions. Only a clinician with appropriate tests can confirm a diagnosis."
  },

  {
    doc_id: "fever_paracetamol_002",
    title: "Paracetamol (Acetaminophen) — Clinical Monograph",
    source: "British National Formulary (BNF) / WHO Essential Medicines List",
    source_url: "https://bnf.nice.org.uk/drugs/paracetamol/",
    organization: "BNF / WHO",
    tier: 2,
    evidence_level: "Strong",
    medical_topics: ["paracetamol", "acetaminophen", "fever", "pain", "analgesic", "antipyretic"],
    keywords: ["paracetamol", "acetaminophen", "dolo", "crocin", "fever", "pain relief", "headache", "antipyretic", "dosage"],
    content: `PARACETAMOL (Acetaminophen) — Evidence-Based Drug Information

GENERAL INFORMATION: Paracetamol is a widely used analgesic (pain reliever) and antipyretic (fever reducer). It is on the WHO Essential Medicines List and is first-line for fever and mild-to-moderate pain.

MECHANISM: Paracetamol reduces fever by acting on the hypothalamic heat-regulating center. Its exact analgesic mechanism is not fully understood but may involve inhibition of prostaglandin synthesis and central nervous system pathways.

STANDARD ADULT DOSAGE:
• Oral tablets: 500mg–1000mg every 4–6 hours as needed
• Maximum daily dose: 4000mg (4g) per day for healthy adults
• Maximum 3000mg/day for elderly patients, those with liver disease, or heavy alcohol users

IMPORTANT SAFETY INFORMATION:
• Do NOT exceed 4g/day — overdose causes irreversible liver failure (hepatotoxicity)
• Avoid or reduce dose in liver disease (hepatitis, cirrhosis) — consult a clinician
• Alcohol increases liver toxicity risk — avoid heavy alcohol use while taking paracetamol
• Many combination cold/flu medicines already contain paracetamol — read all labels to avoid accidental double-dosing
• Paracetamol does NOT treat the underlying cause of fever (e.g., infection) — it only manages symptoms

INDICATION NOTE: Paracetamol is general information about this medicine. Individualized dosing for your specific situation should be discussed with a qualified healthcare provider.`,
    disclaimer: "This is general medication information. Individual prescribing decisions must be made by a licensed healthcare provider."
  },

  // ─────────────────────────────────────────────────
  // DENGUE
  // ─────────────────────────────────────────────────
  {
    doc_id: "dengue_who_001",
    title: "Dengue Fever: Symptoms, Warning Signs & Clinical Management",
    source: "World Health Organization (WHO) Dengue Guidelines / Ministry of Health & Family Welfare India (MoHFW)",
    source_url: "https://www.who.int/docs/default-source/searo/india/health-topic-pdf/dengue-guidelines.pdf",
    organization: "WHO / MoHFW",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["dengue", "dengue fever", "dengue hemorrhagic fever", "NS1", "aedes"],
    keywords: ["dengue", "dengue fever", "bone breaking fever", "breakbone", "platelet", "platelet count", "rash", "joint pain", "aedes", "mosquito", "NS1 antigen", "dengue test", "hemorrhagic"],
    content: `DENGUE FEVER — WHO Clinical Guidelines Summary

IMPORTANT DISCLAIMER: These symptoms can occur with dengue, but symptoms alone cannot confirm a dengue diagnosis. NS1 antigen testing and/or IgM/IgG antibody testing is required for laboratory confirmation. Only a clinician can diagnose dengue.

WHAT IS DENGUE? Dengue is a mosquito-borne viral disease (DENV 1–4 serotypes) transmitted by Aedes aegypti mosquitoes, primarily in tropical and subtropical climates including India, Southeast Asia, Latin America, and the Caribbean.

TYPICAL SYMPTOMS (Days 1–7):
• Sudden-onset high fever (39–40°C)
• Severe headache, especially behind the eyes (retro-orbital pain)
• Muscle and joint pain ("breakbone fever")
• Nausea and vomiting
• Macular or maculopapular rash (often appearing on days 3–5)
• Mild bleeding (gum bleeding, easy bruising) in some cases

WHO WARNING SIGNS — SEEK EMERGENCY CARE IMMEDIATELY:
• Abdominal pain or tenderness (severe, persistent)
• Persistent vomiting (3+ times in 24 hours)
• Rapid breathing or difficulty breathing
• Bleeding from gums, nose, or in vomit/urine/stool
• Fatigue, restlessness, or sudden drop in temperature after fever period (defervescence warning)
• Platelet count below 100,000/μL (requires medical monitoring)
• Hepatomegaly (enlarged liver > 2cm) detected by clinician

CLINICAL MANAGEMENT (No specific antiviral exists for dengue):
• Supportive care: Rest and aggressive oral rehydration
• Paracetamol only for fever and pain (do NOT use Ibuprofen, Aspirin, or NSAIDs — increases bleeding risk)
• Monitor urine output — decreased urine is a warning sign of plasma leakage
• Regular clinical monitoring of CBC (Complete Blood Count), hematocrit, and platelet count
• Hospitalization required for warning signs, severe dengue, or high-risk patients (infants, elderly, diabetes, pregnancy)

NS1 ANTIGEN TEST: Preferred test in first 5 days of fever.
IgM/IgG Antibody Test: Useful from Day 5 onwards.

PREVENTION: Eliminate standing water (mosquito breeding sites), use mosquito repellents, wear protective clothing, use bed nets.`,
    disclaimer: "Dengue diagnosis requires laboratory testing. Never self-treat severe dengue symptoms — immediate medical attention is critical."
  },

  // ─────────────────────────────────────────────────
  // HEADACHE & MIGRAINE
  // ─────────────────────────────────────────────────
  {
    doc_id: "headache_nhs_001",
    title: "Headache Types and When to Seek Medical Advice",
    source: "NHS Clinical Knowledge Summaries — Headache Management",
    source_url: "https://www.nhs.uk/conditions/headaches/",
    organization: "NHS",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["headache", "migraine", "tension headache", "cluster headache"],
    keywords: ["headache", "head pain", "migraine", "throbbing", "tension", "cluster", "behind eyes", "one side", "vomiting", "light sensitivity", "pulsing"],
    content: `HEADACHE — NHS Clinical Guidance

DIRECT ANSWER: Most headaches are primary headaches (not caused by another medical condition) and include tension-type headaches and migraines. They are usually not dangerous but are distressing and may need appropriate management.

COMMON HEADACHE TYPES:
1. TENSION-TYPE HEADACHE (most common, ~70% of all headaches):
   • Bilateral (both sides) pressing/tightening sensation
   • Mild-to-moderate intensity, not worsened by activity
   • No nausea or light/sound sensitivity (or very mild)
   • Often triggered by stress, dehydration, eye strain, poor posture

2. MIGRAINE (~15% of population):
   • Often unilateral (one side), pulsating
   • Moderate-to-severe intensity — worsens with movement
   • Nausea, vomiting, photophobia (light sensitivity), phonophobia (sound sensitivity)
   • May have aura (visual disturbances, tingling, speech difficulty — preceding headache)
   • Common triggers: stress, menstruation, certain foods (caffeine, alcohol, aged cheese), sleep changes

3. CLUSTER HEADACHE (less common, more in men):
   • Extremely severe, one-sided, behind or around the eye
   • Short duration (15–180 min) but in clusters (multiple per day for weeks)
   • Associated with red/watery eye, nasal congestion on same side
   • Requires specialist assessment

EVIDENCE-BASED SELF-CARE:
• Tension headache: Paracetamol 500–1000mg or Ibuprofen 400mg (as appropriate)
• Rest in a quiet, dark room for migraines
• Stay well hydrated — dehydration is a major trigger
• Cold compress or ice pack on the forehead
• Identifying and avoiding personal triggers

WARNING SIGNS — SEEK IMMEDIATE EMERGENCY CARE:
🚨 "THUNDERCLAP" headache — sudden severe headache that reaches maximum intensity within seconds (worst headache of life) — could indicate subarachnoid hemorrhage
🚨 Headache with fever, neck stiffness, light sensitivity — possible meningitis
🚨 Headache with confusion, weakness, vision changes, slurred speech, facial drooping — possible stroke
🚨 Headache after head injury — possible intracranial bleeding
🚨 Headache that progressively worsens over days/weeks in someone with cancer or HIV
🚨 New severe headache in anyone over 50 years old with no prior headache history`,
    disclaimer: "These symptoms can occur with many conditions. Sudden or severe headache with neurological symptoms requires immediate emergency assessment."
  },

  // ─────────────────────────────────────────────────
  // ABDOMINAL PAIN
  // ─────────────────────────────────────────────────
  {
    doc_id: "abdominal_pain_nhs_001",
    title: "Abdominal Pain: Common Causes and Management",
    source: "NHS Clinical Knowledge Summaries / CDC Health Topics",
    source_url: "https://www.nhs.uk/conditions/stomach-ache/",
    organization: "NHS / CDC",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["abdominal pain", "stomach pain", "belly pain", "cramps", "gastritis"],
    keywords: ["stomach ache", "stomach pain", "abdominal pain", "belly", "abdomen", "tummy", "cramps", "bloating", "nausea", "gastric", "upper abdomen", "lower abdomen"],
    content: `ABDOMINAL PAIN — NHS/CDC Guidance

DIRECT ANSWER: Abdominal pain has many causes, most of which are benign (gastroenteritis, indigestion, gas, menstrual cramps). However, some causes are medical emergencies and require immediate attention. Location and character of pain can provide important clues.

COMMON CAUSES BY LOCATION:
• Upper central (epigastric): Gastritis, GERD (acid reflux), peptic ulcer, pancreatitis (severe left-radiation)
• Upper right (right hypochondrium): Gallbladder disease, liver issues
• Upper left: Splenic issues, gastric causes
• Central/umbilical: Gastroenteritis, appendicitis (early), irritable bowel syndrome (IBS)
• Lower right (iliac fossa): Appendicitis (classically), ovarian cyst (right), ectopic pregnancy (women)
• Lower left: Constipation, diverticulitis, ovarian issues
• Lower central: Urinary bladder issues, gynecological causes
• Diffuse (whole abdomen): Gastroenteritis, peritonitis (surgical emergency), IBS

EVIDENCE-BASED SELF-CARE FOR MILD ABDOMINAL PAIN:
• Indigestion/gastritis: Antacids (calcium carbonate, aluminium hydroxide) or Omeprazole 20mg for persistent symptoms
• Gastroenteritis: Rest, oral rehydration (ORS), bland BRAT diet (Banana, Rice, Apple, Toast)
• Gas/bloating: Simethicone, gentle abdominal massage, warm compress
• Constipation: Increased fluid + fiber + physical activity; consider lactulose syrup

WARNING SIGNS — SEEK EMERGENCY CARE IMMEDIATELY:
🚨 Sudden severe, constant abdominal pain — especially if it steadily worsens
🚨 Rigid, board-like abdomen (board-like rigidity) — possible peritonitis
🚨 Pain with signs of shock: rapid heart rate, low blood pressure, pale/clammy skin, confusion
🚨 Pain radiating to the back (possible aortic aneurysm, pancreatitis, kidney stone)
🚨 Vomiting blood or passing blood in stool
🚨 Severe abdominal pain in any pregnant woman — possible ectopic pregnancy or placental abruption
🚨 Right lower quadrant pain with fever and rebound tenderness — possible appendicitis`,
    disclaimer: "Abdominal pain with accompanying severe symptoms is a medical emergency. Do not delay care."
  },

  // ─────────────────────────────────────────────────
  // SORE THROAT
  // ─────────────────────────────────────────────────
  {
    doc_id: "sore_throat_nhs_001",
    title: "Sore Throat: Causes, Self-care and When to See a Doctor",
    source: "NHS Clinical Knowledge Summaries — Sore Throat",
    source_url: "https://www.nhs.uk/conditions/sore-throat/",
    organization: "NHS",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["sore throat", "pharyngitis", "tonsillitis", "throat infection", "strep throat"],
    keywords: ["sore throat", "throat pain", "painful swallowing", "strep", "tonsillitis", "pharyngitis", "white patches", "swollen tonsils", "scratchy throat"],
    content: `SORE THROAT — NHS Clinical Knowledge Summary

DIRECT ANSWER: Most sore throats are caused by viral infections and get better on their own within a week. Antibiotics are only needed if a bacterial infection (e.g., Group A Streptococcus) is confirmed or strongly suspected, as they are ineffective against viruses and carry risks.

COMMON CAUSES:
• Viral pharyngitis (~70–80% of cases): Common cold viruses (rhinovirus, adenovirus), influenza, COVID-19, infectious mononucleosis (EBV)
• Bacterial pharyngitis (~20–30%): Most commonly Group A Streptococcus (GAS) — "strep throat"
• Other: Allergies, dry air, acid reflux, irritants (smoke)

BACTERIAL VS VIRAL: CLINICAL CLUES (Centor Criteria):
Features suggesting bacterial infection (higher points = higher probability):
• Tonsillar exudate (white/yellow patches on tonsils)
• Tender anterior cervical lymph nodes
• Fever above 38°C
• Absence of cough (cough more common in viral)
Scoring helps decide if rapid strep test or throat culture is warranted.

EVIDENCE-BASED SELF-CARE (VALID FOR ALL CAUSES):
• Salt water gargle: Half teaspoon salt in 250ml warm water — soothes inflammation
• Honey and warm liquids: Evidence suggests honey (1–2 tsp) has mild antibacterial and soothing properties
• Paracetamol or Ibuprofen: For pain and fever relief
• Stay hydrated: Ice cold drinks, ice pops, and cold foods may temporarily soothe throat
• Lozenges with benzocaine or menthol: Temporary local relief

WARNING SIGNS — SEEK URGENT MEDICAL CARE:
🚨 Drooling or inability to swallow saliva (possible peritonsillar abscess or epiglottitis)
🚨 Severe difficulty breathing or stridor (high-pitched breathing)
🚨 Muffled, "hot potato" voice and severe unilateral swelling — peritonsillar abscess
🚨 Stiff neck, high fever, altered consciousness
🚨 Sore throat lasting more than 2 weeks — needs investigation for other causes`,
    disclaimer: "Antibiotics should only be taken when prescribed by a healthcare provider after proper assessment."
  },

  // ─────────────────────────────────────────────────
  // BACK PAIN
  // ─────────────────────────────────────────────────
  {
    doc_id: "back_pain_nhs_001",
    title: "Low Back Pain: Evidence-based Assessment & Management",
    source: "NHS / NICE Guidelines (NG59) on Low Back Pain and Sciatica",
    source_url: "https://www.nice.org.uk/guidance/ng59",
    organization: "NHS / NICE",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["back pain", "low back pain", "lumbar pain", "sciatica", "backache"],
    keywords: ["back pain", "backache", "lower back", "lumbar", "spine", "sciatica", "disc", "slip disc", "nerve pain", "radiating", "posture"],
    content: `LOW BACK PAIN — NICE Guideline NG59 Summary

DIRECT ANSWER: Low back pain is very common and most cases (>90%) are non-specific — meaning no serious underlying cause. The majority improve significantly within 4–6 weeks. Staying active (not bed rest) is the cornerstone of management.

TYPES OF BACK PAIN:
1. Non-specific low back pain (~90%): No identifiable structural cause. Often related to muscle strain, poor posture, sedentary lifestyle, or occupational factors.
2. Radiculopathy / Sciatica: Pain radiating down the leg, often to below the knee. Caused by nerve root compression (e.g., herniated disc at L4-L5 or L5-S1).
3. Specific cause (<10%): Fracture, infection, malignancy, ankylosing spondylitis.

EVIDENCE-BASED MANAGEMENT (NICE NG59):
• Stay active — avoid bed rest (strong recommendation)
• Paracetamol: Modest benefit for acute episodes; safe for most patients
• NSAIDs (Ibuprofen 400mg TDS with food): More effective than paracetamol for non-specific LBP — short-term use
• Topical diclofenac or ibuprofen gel: Effective for localized pain with fewer systemic effects
• Heat therapy: Warm compress or hot water bottle provides short-term pain relief
• Exercise therapy: Yoga, pilates, aerobic activity — recommended for chronic LBP (>3 months)
• Physiotherapy / manual therapy: Beneficial especially for sub-acute and chronic LBP

RED FLAGS — POTENTIAL SERIOUS CAUSE (SEEK URGENT MEDICAL ASSESSMENT):
🚨 Saddle anaesthesia (numbness around genitals, inner thighs) or bowel/bladder dysfunction — possible cauda equina syndrome (surgical emergency)
🚨 Significant trauma history (fall, accident) — possible fracture
🚨 Back pain in patients over 50 with unexplained weight loss — possible malignancy
🚨 Fever with back pain — possible spinal infection (discitis, epidural abscess)
🚨 Pain worse lying down or at night, not relieved by position change — possible sinister cause`,
    disclaimer: "Persistent or worsening back pain, or back pain with neurological symptoms, requires professional medical evaluation."
  },

  // ─────────────────────────────────────────────────
  // COLD & COUGH
  // ─────────────────────────────────────────────────
  {
    doc_id: "cold_cough_nhs_001",
    title: "Common Cold and Cough: Evidence-Based Self-Care",
    source: "NHS / CDC / Cochrane Review Summary",
    source_url: "https://www.nhs.uk/conditions/common-cold/",
    organization: "NHS / CDC",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["cold", "common cold", "cough", "rhinitis", "URTI", "upper respiratory infection"],
    keywords: ["cold", "common cold", "runny nose", "blocked nose", "stuffy nose", "cough", "sneezing", "sore throat", "body aches", "congestion", "phlegm", "mucus"],
    content: `COMMON COLD — NHS / CDC / Cochrane Evidence Summary

DIRECT ANSWER: The common cold is caused by viruses (most commonly rhinovirus) and has no cure. Antibiotics are NOT effective and should not be used. Symptoms typically last 7–10 days with supportive management.

TYPICAL SYMPTOMS:
• Runny or blocked nose (initially clear, may become yellow-green after a few days)
• Sneezing, sore throat, mild cough
• General malaise and mild fatigue
• Low-grade fever (more common in children)
• Symptoms peak around days 2–3

EVIDENCE-BASED SELF-CARE (Cochrane Review-supported):
• Hydration: Drink plenty of fluids — warm liquids may help soothe symptoms
• Honey (adults and children >1 year): Evidence from Cochrane reviews shows honey reduces cough frequency and severity at night. Give 2 tsp before bed. Do NOT give honey to children under 1 year (risk of botulism).
• Saline nasal irrigation / saline drops: Reduces nasal congestion — evidence-supported
• Steam inhalation: May provide temporary symptom relief (no strong evidence of efficacy but safe)
• Paracetamol or Ibuprofen: For fever and discomfort
• Zinc acetate/gluconate lozenges (started within 24h of symptoms): Cochrane review shows zinc may reduce cold duration by about 1 day
• Vitamin C supplementation: Evidence is mixed; routine supplementation does not prevent colds but may slightly reduce duration if taken regularly

WHAT IS NOT EFFECTIVE:
• Antibiotics — NO benefit against viruses; cause antibiotic resistance
• Most OTC decongestants and cough syrups — limited evidence of significant benefit
• Echinacea — Cochrane review: inconsistent, insufficient evidence

WARNING SIGNS — SEE A DOCTOR:
• High fever (>39°C) lasting more than 3 days
• Symptoms worsening after initial improvement (possible secondary bacterial infection)
• Difficulty breathing, chest pain
• Facial pain with green/yellow nasal discharge lasting >10 days (possible sinusitis)
• Severe headache, stiff neck`,
    disclaimer: "If you are unsure whether your symptoms are from a cold or something more serious, consult a healthcare provider."
  },

  // ─────────────────────────────────────────────────
  // GINGER & NAUSEA — HERBAL (TIER 3)
  // ─────────────────────────────────────────────────
  {
    doc_id: "ginger_herbal_003",
    title: "Ginger (Zingiber officinale) for Nausea — Evidence Review",
    source: "Cochrane Review Summary / Ayurvedic Pharmacopoeia of India / NCCIH",
    source_url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD011562/full",
    organization: "Cochrane / AYUSH / NCCIH",
    tier: 3,
    evidence_level: "Moderate (Specific Uses)",
    medical_topics: ["ginger", "nausea", "vomiting", "morning sickness", "herbal", "ayurvedic"],
    keywords: ["ginger", "adrak", "nausea", "vomiting", "morning sickness", "motion sickness", "herbal remedy", "anti-nausea"],
    content: `GINGER (Zingiber officinale) — Evidence-Based Herbal Monograph

IMPORTANT: This information covers herbal/traditional evidence. "Natural" does not automatically mean safe or effective for all people. Evidence quality varies. Consult a healthcare provider before using ginger therapeutically during pregnancy or with medications.

EVIDENCE SUMMARY:
• Nausea & Vomiting of Pregnancy (Morning Sickness): Multiple randomized controlled trials and a Cochrane Review suggest ginger (1g/day divided doses) is more effective than placebo for reducing nausea in the first trimester. It is considered one of the safer non-pharmacological options. Evidence Level: Moderate.
• Postoperative Nausea: Some trials suggest benefit; results inconsistent. Evidence Level: Limited.
• Chemotherapy-Induced Nausea: Mixed results in trials; ginger as adjunct may help in some patients. Evidence Level: Limited.
• Motion Sickness: Some evidence for mild benefit. Evidence Level: Weak.
• General Digestive Aid: Traditional Ayurvedic use (Deepana-Pachana — digestive stimulant); limited modern RCT evidence. Evidence Level: Traditional.

AYURVEDIC CONTEXT:
In Ayurveda, fresh ginger (Ardraka) and dry ginger (Shunthi) are considered among the most important herbs — warming, digestive (Deepana), carminative (Anulomana), and used in Vata-Kapha conditions. Shunthi is included in Trikatu (three-spice formula with black pepper and pippali) for respiratory support.

TRADITIONAL PREPARATION:
• Fresh ginger tea: 1–2cm fresh ginger sliced, steeped in 250ml boiling water for 5–10 min. Add honey. 1–3 cups/day.
• Ginger powder: 0.5–1g dried ginger powder 2–3 times daily for nausea

EVIDENCE LIMITATIONS:
• Most trials have small sample sizes and short duration
• Standardization of ginger preparations varies — active compounds (gingerols, shogaols) differ between products
• Not sufficient evidence to replace standard antiemetic medications (e.g., ondansetron) in severe nausea/vomiting

SAFETY & INTERACTIONS:
• Generally recognized as safe (GRAS) at culinary amounts
• Higher doses (>4g/day) may cause heartburn, digestive irritation
• Possible mild antiplatelet effects — use with caution with blood thinners (warfarin, aspirin, clopidogrel)
• Consult a doctor before using ginger supplements during pregnancy beyond dietary amounts`,
    disclaimer: "Herbal remedies have evidence limitations. Ginger supplements are not a replacement for prescribed antiemetics. Consult your doctor, especially in pregnancy."
  },

  // ─────────────────────────────────────────────────
  // TURMERIC / CURCUMIN — HERBAL (TIER 3)
  // ─────────────────────────────────────────────────
  {
    doc_id: "turmeric_herbal_004",
    title: "Turmeric (Curcuma longa) / Curcumin — Evidence & Safety Review",
    source: "NCCIH / Cochrane Summary / Ayurvedic Pharmacopoeia of India",
    source_url: "https://www.nccih.nih.gov/health/turmeric",
    organization: "NCCIH / AYUSH",
    tier: 3,
    evidence_level: "Limited-Moderate (Anti-inflammatory)",
    medical_topics: ["turmeric", "curcumin", "anti-inflammatory", "herbal", "ayurvedic", "joint pain"],
    keywords: ["turmeric", "haldi", "curcumin", "anti-inflammatory", "joint pain", "arthritis", "golden milk", "haldi doodh", "herbal"],
    content: `TURMERIC (Curcuma longa) / CURCUMIN — Evidence-Based Overview

IMPORTANT EVIDENCE LIMITATION: While turmeric/curcumin is widely studied, many trials have methodological limitations. NCCIH states: "Results from small, early studies have been promising, but larger clinical trials are needed before any conclusions can be made about turmeric's effects on specific health conditions."

ACTIVE COMPOUND: Curcumin (~2–8% of turmeric by weight) is the primary bioactive constituent. Curcumin has very poor bioavailability — only ~1% absorbed orally. Combining with piperine (black pepper — 5–20mg) increases absorption by up to 2000%.

EVIDENCE REVIEW BY CONDITION:
• Osteoarthritis: Several small-to-medium RCTs show curcumin (500–1000mg/day with piperine) reduces pain and stiffness comparably to low-dose ibuprofen with fewer GI side effects. Evidence Level: Moderate (promising but not definitive).
• Inflammatory Bowel Disease (Crohn's/Ulcerative Colitis): Some evidence as adjunct therapy. Evidence Level: Limited.
• Metabolic Syndrome & Diabetes: Preclinical evidence strong; human trials limited. Evidence Level: Weak.
• Cancer Prevention: No sufficient evidence from human trials. NCCIH explicitly states: "There is not enough reliable evidence to recommend curcumin for any health condition."

AYURVEDIC CONTEXT:
Haridra (turmeric) is one of Ayurveda's most revered herbs — tridoshic (balances Vata, Pitta, Kapha), wound-healing (Ropana), anti-inflammatory (Shothahara), skin-purifying. Haldi Doodh (Golden Milk — turmeric in warm milk with black pepper and ghee) is a traditional preparation documented in classical texts.

SAFETY:
• Dietary amounts in food are considered safe
• High-dose curcumin supplements (>8g/day): May cause GI upset, nausea
• Possible antiplatelet and anticoagulant effects at high doses — caution with blood thinners
• Avoid high-dose curcumin supplements in gallbladder disease, bile duct obstruction
• Limited safety data for high-dose use in pregnancy`,
    disclaimer: "Turmeric in food is generally safe. Curcumin supplements have limited clinical evidence. They are not a substitute for prescribed anti-inflammatory medications."
  },

  // ─────────────────────────────────────────────────
  // ASHWAGANDHA — HERBAL (TIER 3)
  // ─────────────────────────────────────────────────
  {
    doc_id: "ashwagandha_herbal_005",
    title: "Ashwagandha (Withania somnifera) — Clinical Evidence & Safety",
    source: "NCCIH / Journal of Evidence-Based Complementary & Alternative Medicine / AYUSH",
    source_url: "https://www.nccih.nih.gov/health/ashwagandha",
    organization: "NCCIH / AYUSH",
    tier: 3,
    evidence_level: "Limited-Moderate (Stress/Anxiety)",
    medical_topics: ["ashwagandha", "withania", "adaptogen", "stress", "anxiety", "sleep", "herbal", "ayurvedic"],
    keywords: ["ashwagandha", "withania somnifera", "ashwagandha ksm-66", "stress relief", "anxiety", "adaptogen", "cortisol", "sleep", "energy"],
    content: `ASHWAGANDHA (Withania somnifera) — Clinical Evidence Summary

IMPORTANT: This is an evidence-limited herbal overview. Ashwagandha should not replace evidence-based treatments for anxiety disorders or other medical conditions. Consult a healthcare provider before starting any supplement.

AYURVEDIC CLASSIFICATION: Ashwagandha is one of Ayurveda's premier Rasayana (rejuvenating) herbs — considered a Balya (strength-promoting) and Vrishya (vitality-boosting) herb used for Vata disorders.

ACTIVE CONSTITUENTS: Withanolides (steroidal lactones), alkaloids, saponins, iron. KSM-66® is a standardized root extract with higher withanolide concentration.

EVIDENCE REVIEW:
• Stress and Anxiety: A 2019 randomized, double-blind trial (n=60) published in Medicine showed KSM-66 significantly reduced stress, anxiety scores, and serum cortisol vs. placebo. Multiple similar trials corroborate this. Evidence Level: Moderate.
• Sleep Quality: RCTs show ashwagandha root extract (600mg/day for 8 weeks) improved sleep onset, quality, and morning alertness in adults with insomnia. Evidence Level: Moderate (specific extracts, specific doses).
• Athletic Performance: Some evidence for improved VO2 max and muscle strength in physically active adults. Evidence Level: Limited.
• Thyroid Function: Preliminary evidence that ashwagandha may increase T3 and T4 levels — caution in thyroid disorders. Evidence Level: Very Limited.

STANDARD DOSAGE RANGE IN STUDIES: 300–600mg standardized extract (KSM-66 or Sensoril) once or twice daily.

SAFETY & INTERACTIONS (IMPORTANT):
• Generally well tolerated at studied doses (300–600mg extract)
• Possible side effects: GI upset, diarrhea at high doses; rare liver injury cases reported in literature
• Thyroid interaction: May increase thyroid hormone levels — avoid in hyperthyroidism; use cautiously in hypothyroidism on levothyroxine
• Immunosuppressant interaction: May stimulate immune system — caution in autoimmune conditions (lupus, MS, rheumatoid arthritis)
• Pregnancy: Avoid — may cause uterine contractions (Abortifacient properties in high doses)
• "Natural" does not mean safe for everyone — individual response and interactions vary`,
    disclaimer: "Ashwagandha supplements have limited but promising evidence for stress. They are not a replacement for evidence-based mental health treatment."
  },

  // ─────────────────────────────────────────────────
  // CHEST PAIN (EMERGENCY)
  // ─────────────────────────────────────────────────
  {
    doc_id: "chest_pain_emergency_001",
    title: "Chest Pain: Emergency Assessment & Cardiac Symptoms",
    source: "American Heart Association (AHA) / NHS Emergency Guidance / WHO",
    source_url: "https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack",
    organization: "AHA / NHS / WHO",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["chest pain", "heart attack", "angina", "cardiac", "myocardial infarction", "emergency"],
    keywords: ["chest pain", "chest tightness", "heart attack", "angina", "palpitations", "cardiac", "left arm pain", "jaw pain", "shortness of breath", "heart", "infarction"],
    content: `⚠️ CHEST PAIN — POTENTIAL EMERGENCY

CRITICAL SAFETY NOTICE: Chest pain can be a sign of a life-threatening condition. If you or someone nearby is experiencing chest pain RIGHT NOW, especially with any of the symptoms below, CALL EMERGENCY SERVICES IMMEDIATELY (India: 112 or 1066 for Ambulance).

HEART ATTACK WARNING SIGNS (AHA Guidelines):
The following symptoms together constitute a medical emergency requiring immediate activation of emergency medical services:
• Chest discomfort: Uncomfortable pressure, squeezing, fullness, or pain in the center of the chest lasting more than a few minutes, or that goes away and comes back
• Radiating pain: Discomfort or pain spreading to the shoulders, neck, jaw, back, or arms (especially left arm)
• Shortness of breath: With or without chest discomfort
• Other signs: Cold sweat, nausea, vomiting, light-headedness, sense of impending doom

IMPORTANT: Women may experience atypical symptoms — nausea, fatigue, jaw pain, or upper back pain WITHOUT classic chest pressure. These deserve the same urgent response.

IF SUSPECTED HEART ATTACK:
1. Call emergency services immediately (112 in India)
2. Sit the person down and keep them still and calm
3. Loosen any tight clothing
4. If available and not allergic and not contraindicated, chew (not swallow) Aspirin 325mg (per first-aid guidance — not a substitute for emergency care)
4. Do NOT drive yourself to the hospital
5. Be prepared to perform CPR if the person becomes unconscious and stops breathing normally

OTHER CAUSES OF CHEST PAIN (requires professional evaluation):
• Angina (stable): Chest pain on exertion, relieved by rest — still needs urgent same-day assessment
• GERD/Acid reflux: Burning sensation, often after meals, worse lying down
• Costochondritis: Chest wall tenderness that worsens with touch/movement
• Anxiety/Panic attack: Associated with rapid heartbeat, breathing difficulty, tingling
• Pulmonary embolism: Sudden chest pain + shortness of breath + leg swelling/pain — EMERGENCY

BOTTOM LINE: Do not attempt to self-diagnose chest pain. Any new, unexplained, or severe chest pain warrants immediate medical evaluation.`,
    disclaimer: "Chest pain is a potential medical emergency. Call 112 (India) immediately. Do not delay seeking care."
  },

  // ─────────────────────────────────────────────────
  // DIABETES TYPE 2
  // ─────────────────────────────────────────────────
  {
    doc_id: "diabetes_who_001",
    title: "Type 2 Diabetes: Prevention, Management & Monitoring",
    source: "World Health Organization (WHO) / Indian Council of Medical Research (ICMR)",
    source_url: "https://www.who.int/news-room/fact-sheets/detail/diabetes",
    organization: "WHO / ICMR",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["diabetes", "type 2 diabetes", "blood sugar", "hyperglycemia", "insulin resistance"],
    keywords: ["diabetes", "blood sugar", "glucose", "type 2", "insulin", "hba1c", "hyperglycemia", "sugar level", "diabetic"],
    content: `TYPE 2 DIABETES MELLITUS — WHO / ICMR Guidelines Summary

DIRECT ANSWER: Type 2 diabetes is a chronic metabolic condition characterized by elevated blood glucose due to insulin resistance and relative insulin deficiency. It is manageable but not curable. Lifestyle modification is the cornerstone of prevention and management.

DIAGNOSIS: Diagnosis requires specific laboratory criteria (not symptoms alone):
• Fasting Plasma Glucose (FPG) ≥126 mg/dL (7.0 mmol/L)
• Random Plasma Glucose ≥200 mg/dL with symptoms
• HbA1c ≥6.5% (48 mmol/mol)
• OGTT 2-hour glucose ≥200 mg/dL

COMMON SYMPTOMS (symptoms alone do not diagnose diabetes):
Polyuria (frequent urination), polydipsia (excessive thirst), polyphagia (increased hunger), unexplained weight loss, fatigue, blurred vision, slow-healing wounds, recurrent infections.

MANAGEMENT APPROACH (stepwise):
1. Lifestyle Modification: Essential for all patients — dietary changes (reduce refined carbohydrates, increase fiber, limit sugary drinks), 150 min/week moderate exercise, weight loss (5–10% body weight significantly improves glycaemic control)
2. Metformin: First-line oral medication if lifestyle changes alone are insufficient. Weight-neutral, cardiovascular neutral-to-beneficial, low hypoglycemia risk.
3. Additional agents: SGLT-2 inhibitors, GLP-1 receptor agonists, DPP-4 inhibitors — added based on individual cardiovascular risk, kidney function, weight goals (prescribing decision by clinician)
4. Insulin: For advanced disease or uncontrolled hyperglycemia

MONITORING:
• HbA1c: Every 3–6 months (target usually <7% but individualized)
• Blood pressure, lipids, kidney function annually
• Eye examination (retinopathy screening), foot examination annually

COMPLICATION PREVENTION:
• Blood pressure control (<140/90 mmHg)
• Statin therapy if cardiovascular risk elevated
• ACE inhibitor/ARB for diabetic kidney disease
• Regular foot care to prevent diabetic foot`,
    disclaimer: "Diabetes diagnosis and management requires professional medical supervision. Do not self-adjust medications."
  },

  // ─────────────────────────────────────────────────
  // HIGH BLOOD PRESSURE
  // ─────────────────────────────────────────────────
  {
    doc_id: "hypertension_who_001",
    title: "Hypertension (High Blood Pressure): Prevention and Management",
    source: "WHO / Indian Society of Hypertension / ICMR",
    source_url: "https://www.who.int/news-room/fact-sheets/detail/hypertension",
    organization: "WHO / ISH",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["hypertension", "blood pressure", "high blood pressure", "systolic", "diastolic"],
    keywords: ["blood pressure", "hypertension", "BP", "high BP", "systolic", "diastolic", "prehypertension", "antihypertensive", "mm hg"],
    content: `HYPERTENSION (HIGH BLOOD PRESSURE) — WHO Guidelines

DIRECT ANSWER: Hypertension is defined as consistently elevated blood pressure of 140/90 mmHg or above. It is a major risk factor for heart attack, stroke, kidney disease, and vision loss. Most people with hypertension have no symptoms — hence it is called "the silent killer." Regular blood pressure monitoring is essential.

CLASSIFICATION (WHO/2018 ESC/ESH):
• Normal: <120/80 mmHg
• Elevated: 120–129/<80 mmHg (prehypertension)
• Grade 1 Hypertension: 130–139/80–89 mmHg
• Grade 2 Hypertension: ≥140/90 mmHg
• Hypertensive Crisis: ≥180/120 mmHg — emergency

LIFESTYLE MODIFICATIONS (FIRST-LINE FOR ALL GRADES):
• DASH diet: Reduce sodium (<2.3g/day ideal), increase fruits, vegetables, low-fat dairy, reduce saturated fat
• Physical activity: 150 min moderate-intensity aerobic exercise per week
• Weight reduction: Every 1kg reduction in weight lowers systolic BP by ~1 mmHg
• Alcohol restriction: Men <14 units/week, Women <8 units/week
• Stop smoking: Smoking significantly increases cardiovascular risk in hypertension
• Stress management: While evidence is limited, stress management complements treatment

ANTIHYPERTENSIVE MEDICATION (prescribed by clinician):
First-line classes: ACE inhibitors, ARBs, calcium channel blockers, thiazide diuretics
• Never stop blood pressure medications without consulting your doctor — rebound hypertension can be dangerous

HYPERTENSIVE EMERGENCY (seek immediate emergency care):
Blood pressure ≥180/120 mmHg WITH any of: severe headache, confusion, vision changes, chest pain, shortness of breath, signs of stroke, acute kidney injury.`,
    disclaimer: "Hypertension management requires regular monitoring by a healthcare provider. Do not adjust medications without medical supervision."
  },

  // ─────────────────────────────────────────────────
  // ALLERGY / ANAPHYLAXIS (EMERGENCY)
  // ─────────────────────────────────────────────────
  {
    doc_id: "anaphylaxis_emergency_001",
    title: "Anaphylaxis: Recognition and Emergency Management",
    source: "World Allergy Organization (WAO) / NHS / AHA",
    source_url: "https://www.worldallergy.org/education-and-programs/education/allergic-disease-resource-center/professionals/anaphylaxis",
    organization: "WAO / NHS",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["anaphylaxis", "severe allergy", "allergic reaction", "epinephrine", "adrenaline"],
    keywords: ["anaphylaxis", "severe allergic reaction", "hives", "swelling throat", "difficulty breathing", "allergy", "epinephrine", "adrenaline", "adrenaline pen", "bee sting", "food allergy"],
    content: `⚠️ ANAPHYLAXIS — LIFE-THREATENING EMERGENCY

ANAPHYLAXIS IS A MEDICAL EMERGENCY. If you suspect anaphylaxis, call emergency services (112 in India) IMMEDIATELY.

RECOGNITION — Anaphylaxis typically involves symptoms from 2 or more body systems:
• SKIN: Hives (urticaria), flushing, swelling (angioedema) — especially face, lips, tongue, throat
• RESPIRATORY: Wheezing, difficulty breathing, stridor (high-pitched breathing), throat tightness
• CARDIOVASCULAR: Rapid or irregular heartbeat, drop in blood pressure, dizziness, collapse
• GASTROINTESTINAL: Severe abdominal cramping, nausea, vomiting
• NEUROLOGICAL: Confusion, anxiety, sense of doom, loss of consciousness

COMMON TRIGGERS: Foods (nuts, shellfish, milk, eggs, wheat), medications (penicillin, NSAIDs), insect stings (bee, wasp), latex, exercise (rare).

TIME-CRITICAL: Anaphylaxis can progress to circulatory collapse and death within minutes.

EMERGENCY MANAGEMENT (lay first-aider):
1. Call 112 immediately
2. If person has a prescribed epinephrine auto-injector (EpiPen), use it into the outer mid-thigh IMMEDIATELY
3. Position: Lie person flat with legs raised (unless breathing is compromised — then allow to sit up)
4. Second dose of epinephrine can be given after 5–15 min if no improvement
5. Be prepared to perform CPR if needed
6. Go to emergency department even if symptoms improve — biphasic reactions can occur hours later

AFTER ANAPHYLAXIS:
• All patients should be evaluated by a specialist allergist
• Carry epinephrine auto-injector at all times
• Wear a medical alert bracelet
• Avoid identified triggers`,
    disclaimer: "Anaphylaxis is a life-threatening emergency requiring immediate medical care. Epinephrine (adrenaline) injection is the first-line treatment, not antihistamines alone."
  },

  // ─────────────────────────────────────────────────
  // STROKE (EMERGENCY)
  // ─────────────────────────────────────────────────
  {
    doc_id: "stroke_emergency_001",
    title: "Stroke Recognition and Emergency Response (FAST Protocol)",
    source: "World Stroke Organization (WSO) / AHA / NHS",
    source_url: "https://www.world-stroke.org/",
    organization: "WSO / AHA / NHS",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["stroke", "TIA", "cerebrovascular accident", "brain attack", "FAST"],
    keywords: ["stroke", "brain attack", "FAST", "facial drooping", "arm weakness", "speech difficulty", "sudden weakness", "sudden confusion", "loss of vision", "TIA", "mini stroke"],
    content: `⚠️ STROKE — TIME-CRITICAL EMERGENCY

CALL 112 IMMEDIATELY IF YOU SUSPECT A STROKE. "Time is brain" — for every minute a stroke is untreated, approximately 1.9 million neurons die.

FAST ACRONYM (WHO-recommended stroke recognition):
• F — FACE: Ask the person to smile. Does one side of the face droop?
• A — ARMS: Ask the person to raise both arms. Does one arm drift downward?
• S — SPEECH: Ask the person to repeat a simple phrase. Is their speech slurred or strange?
• T — TIME: If you observe ANY of these signs, call 112 immediately. Note the time symptoms started.

ADDITIONAL STROKE SYMPTOMS:
• Sudden numbness or weakness in face, arm, or leg (especially one side of body)
• Sudden confusion or trouble understanding speech
• Sudden trouble seeing in one or both eyes
• Sudden severe headache with no known cause ("thunderclap" headache)
• Sudden dizziness, loss of balance, or loss of coordination

TIA (Transient Ischemic Attack / "Mini-Stroke"):
TIA symptoms are the same as stroke but typically resolve within 24 hours. TIA is a medical emergency requiring urgent evaluation — it is a strong warning sign of impending stroke (risk highest in the next 48 hours). Seek emergency care immediately.

DO NOT:
• Do NOT give the person anything to eat or drink
• Do NOT give aspirin without medical advice (type of stroke matters — hemorrhagic stroke worsens with aspirin)
• Do NOT wait to see if symptoms improve

RISK FACTORS: Hypertension (most important modifiable risk factor), atrial fibrillation, diabetes, smoking, obesity, physical inactivity, hyperlipidemia.`,
    disclaimer: "Stroke symptoms require immediate emergency response. Call 112 without delay."
  },

  // ─────────────────────────────────────────────────
  // GENERAL WELLNESS / IMMUNITY
  // ─────────────────────────────────────────────────
  {
    doc_id: "immunity_wellness_001",
    title: "Immune System Support: Evidence-Based Lifestyle Factors",
    source: "Harvard T.H. Chan School of Public Health / WHO / NHS",
    source_url: "https://www.hsph.harvard.edu/nutritionsource/nutrition-and-immunity/",
    organization: "Harvard Health / WHO / NHS",
    tier: 1,
    evidence_level: "Strong (Lifestyle factors); Moderate (Specific supplements)",
    medical_topics: ["immunity", "immune health", "wellness", "immune system", "immune boost"],
    keywords: ["immunity", "immune boost", "immune system", "boost immunity", "immune health", "resistance", "supplements", "vitamin c", "zinc", "vitamin d", "probiotics"],
    content: `IMMUNE HEALTH — Evidence-Based Approach (Harvard Health / WHO)

IMPORTANT FRAMING: Harvard Health states: "The idea of boosting your immunity is enticing, but the ability to do so has proved elusive for several reasons." The immune system is a complex, finely balanced system — "boosting" it is not straightforward and, in autoimmune conditions, can be harmful.

EVIDENCE-BASED LIFESTYLE FACTORS (STRONGEST EVIDENCE):
1. Adequate sleep: 7–9 hours for adults. Sleep deprivation impairs cytokine production and reduces vaccine efficacy. Evidence Level: Strong.
2. Regular moderate exercise: 150 min/week moderate aerobic exercise reduces susceptibility to respiratory infections. Avoid overtraining (excessive intense exercise can transiently suppress immunity). Evidence Level: Strong.
3. Nutritious diet: Varied diet rich in fruits, vegetables, whole grains, lean proteins provides essential micronutrients. No single "superfood" has been proven to boost immunity. Evidence Level: Strong.
4. Stress management: Chronic stress suppresses immune function via cortisol pathways. Evidence Level: Strong.
5. Not smoking: Smoking damages lung immunity and mucosal defenses. Evidence Level: Strong.
6. Limiting alcohol: Heavy alcohol impairs immune response. Evidence Level: Strong.

SPECIFIC SUPPLEMENTS — EVIDENCE SUMMARY:
• Vitamin C: Does not prevent colds in most people; may modestly reduce duration if regularly supplemented. Therapeutic benefit in people with severe deficiency. Evidence Level: Moderate (limited scope).
• Vitamin D: Deficiency is associated with increased respiratory infections. Supplementation in deficient individuals may reduce risk. 400–800 IU/day for most adults. Blood level testing recommended before high-dose supplementation. Evidence Level: Moderate.
• Zinc: May reduce cold duration if taken as lozenges within 24h of symptom onset. Important for immune function when deficient. Evidence Level: Moderate (specific context).
• Probiotics: Limited, inconsistent evidence for immune effects. May benefit gut microbiome. Evidence Level: Limited.

AYURVEDIC SUPPORT (Tier 3 — Traditional, Limited Modern Evidence):
• Chyawanprash: Amla-based classical formulation; animal studies suggest immunomodulatory effects; large human RCTs lacking. Traditional seasonal use.
• Giloy (Tinospora cordifolia): Some immunomodulatory evidence in vitro and animal studies; limited human RCT data.`,
  },

  // ─────────────────────────────────────────────────
  // GERD / ACID REFLUX & ACIDITY
  // ─────────────────────────────────────────────────
  {
    doc_id: "gerd_acg_001",
    title: "Gastroesophageal Reflux Disease (GERD) & Acidity: Clinical Guidance",
    source: "American College of Gastroenterology (ACG) / NHS Guidelines",
    source_url: "https://gi.org/guidelines/gerd/",
    organization: "ACG / NHS",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["acidity", "gerd", "acid reflux", "heartburn", "gastritis", "indigestion"],
    keywords: ["acidity", "acid reflux", "gerd", "heartburn", "burning chest", "stomach acid", "omeprazole", "pantoprazole", "antacid", "digestion", "sour burps", "regurgitation"],
    content: `GERD & ACID REFLUX — ACG / NHS Clinical Summary

DIRECT ANSWER: Heartburn and acid reflux occur when stomach acid flows back into the esophagus. Occasional acidity is common, but persistent symptoms occurring more than twice a week may indicate Gastroesophageal Reflux Disease (GERD), which requires structured medical management to prevent esophageal inflammation.

WHAT THIS MAY MEAN — COMMON CAUSES:
1. Dietary triggers: Spicy, oily foods, citrus, tomatoes, chocolate, caffeine, alcohol
2. Mechanical factors: Lying down immediately after eating, obesity, tight clothing
3. Hiatal hernia or lower esophageal sphincter (LES) relaxation
4. Medications: NSAIDs (ibuprofen, aspirin), certain blood pressure drugs
5. H. pylori infection or chronic gastritis

WARNING SIGNS — RED FLAGS (SEEK IMMEDIATE MEDICAL EVALUATION):
🚨 Difficulty swallowing (dysphagia) or painful swallowing (odynophagia)
🚨 Persistent vomiting, vomiting blood, or "coffee-ground" vomitus
🚨 Black, tarry stools (melena — sign of upper GI bleeding)
🚨 Unexplained weight loss or severe anemia/fatigue
🚨 Chest pain radiating to left arm or jaw (rule out cardiac causes immediately)
🚨 Symptoms persisting despite 4–8 weeks of acid suppression therapy

EVIDENCE-BASED SELF-CARE & MEDICATIONS:
• Lifestyle & Positional Therapy: Elevate the head of the bed by 15–20 cm (not just pillows). Avoid eating within 3 hours of sleeping. Eat smaller, frequent meals.
• Antacids (Calcium Carbonate, Magnesium/Aluminium Hydroxide): Provide rapid but short-term symptomatic relief.
• H2 Blockers (Famotidine 20mg): Reduce acid production for 8–12 hours.
• Proton Pump Inhibitors (PPIs - Omeprazole 20mg, Pantoprazole 40mg): First-line evidence-based therapy for mucosal healing. Best taken 30–60 minutes before the first meal of the day.
• AYURVEDIC TRADITIONAL PERSPECTIVE (Tier 3): Amla (Indian Gooseberry) and Licorice (Yashtimadhu) are traditionally used for Pitta cooling and mucosal soothing; evidence from small trials suggests mild supportive benefit. Do NOT discontinue prescribed PPIs without consulting your doctor.`,
    disclaimer: "Severe or progressive acid reflux with swallowing difficulty requires endoscopic evaluation by a gastroenterologist."
  },

  // ─────────────────────────────────────────────────
  // ASTHMA & BRONCHIAL SPASM
  // ─────────────────────────────────────────────────
  {
    doc_id: "asthma_gina_001",
    title: "Asthma: Global Strategy for Asthma Management & Prevention",
    source: "Global Initiative for Asthma (GINA) / WHO Guidelines",
    source_url: "https://ginasthma.org/",
    organization: "GINA / WHO",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["asthma", "wheezing", "bronchospasm", "inhaler", "shortness of breath"],
    keywords: ["asthma", "wheezing", "short of breath", "chest tightness", "inhaler", "salbutamol", "albuterol", "budesonide", "asthma attack", "cough at night"],
    content: `ASTHMA — GINA / WHO Clinical Guidelines Summary

DIRECT ANSWER: Asthma is a chronic inflammatory disorder of the airways characterized by recurrent episodes of wheezing, breathlessness, chest tightness, and nighttime or early morning coughing. With appropriate inhaled maintenance and rescue therapy, normal active life is achievable.

CLINICAL FEATURES & TRIGGERS:
• Variable expiratory airflow limitation and bronchial hyperresponsiveness
• Common triggers: Respiratory viral infections, allergens (dust mites, pollen, pet dander), tobacco smoke, cold dry air, physical exercise, air pollution

WARNING SIGNS — SEVERE ASTHMA ATTACK (CALL 112 / EMERGENCY):
🚨 Severe breathlessness: Unable to speak full sentences in one breath
🚨 Respiratory distress: Nostril flaring, chest wall retractions, bluish lips or fingernails (cyanosis)
🚨 "Silent chest": Wheezing stops because air movement is too low — critical sign of impending respiratory failure
🚨 Peak flow rate <50% of personal best or predicted normal
🚨 Reliever inhaler (Salbutamol) fails to provide relief or needs to be taken more frequently than every 2–3 hours

EVIDENCE-BASED PHARMACOTHERAPY (GINA 2023+ Standards):
• Controller Therapy: Inhaled Corticosteroids (ICS) e.g., Budesonide or Fluticasone — reduces underlying airway inflammation. GINA no longer recommends SABA (Salbutamol) alone without concomitant ICS.
• Reliever Therapy: Low-dose ICS-formoterol or Salbutamol inhaler for acute symptom relief.
• Inhaler Technique: Use a spacer device with metered-dose inhalers (MDIs) to maximize lung deposition and minimize oral candidiasis (rinse mouth after ICS).

AYURVEDIC PERSPECTIVE (Tier 3): Traditional herbs like Vasa (Adhatoda vasica) and Pippali (Piper longum) possess bronchodilatory phytochemicals; they are complementary only and must NEVER replace emergency rescue inhalers during acute bronchospasm.`,
    disclaimer: "Asthma is a potentially life-threatening respiratory condition. Always maintain an up-to-date Asthma Action Plan with your pulmonologist."
  },

  // ─────────────────────────────────────────────────
  // URINARY TRACT INFECTION (UTI)
  // ─────────────────────────────────────────────────
  {
    doc_id: "uti_cdc_001",
    title: "Urinary Tract Infection (UTI) in Adults: Clinical Overview",
    source: "Centers for Disease Control and Prevention (CDC) / NHS",
    source_url: "https://www.cdc.gov/antibiotic-use/uti.html",
    organization: "CDC / NHS",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["uti", "urinary tract infection", "burning urination", "dysuria", "bladder infection", "cystitis"],
    keywords: ["uti", "urinary tract infection", "burning pee", "dysuria", "frequent urination", "bladder infection", "cystitis", "cloudy urine", "foul smelling urine"],
    content: `URINARY TRACT INFECTION (UTI) — CDC / NHS Guidelines Summary

DIRECT ANSWER: A UTI occurs when bacteria (most commonly Escherichia coli) enter the urinary tract. Lower UTIs (cystitis/bladder infection) are very common, especially in women. Bacterial UTIs generally require a targeted course of antibiotics prescribed after clinical evaluation to prevent kidney involvement (pyelonephritis).

COMMON SYMPTOMS:
• Dysuria: Burning or sharp stinging pain during urination
• Frequency & Urgency: Feeling an urgent need to urinate frequently, often passing only small volumes
• Turbid or strong-smelling urine, sometimes containing microscopic or visible blood (hematuria)
• Mild lower pelvic or suprapubic aching

RED FLAGS — UPPER UTI / PYELONEPHRITIS (SEEK URGENT MEDICAL ATTENTION):
🚨 High fever (>38.5°C) with chills or shaking rigors
🚨 Flank pain or loin tenderness (pain in back/side just under ribs)
🚨 Nausea, persistent vomiting, or systemic dizziness/confusion
🚨 UTI symptoms in men, pregnant women, children, or immunocompromised patients (always considered complicated UTIs)

EVIDENCE-BASED MANAGEMENT:
• Medical Treatment: Antibiotic therapy (e.g., Nitrofurantoin, Fosfomycin, or Trimethoprim as per local sensitivity guidelines) prescribed by a physician. Complete the full course.
• Supportive Hydration: Drink plenty of water (2–2.5L/day) to help flush bacteria mechanically from the bladder.
• Pain Relief: Paracetamol for lower pelvic pain. Alkalizing sachets (potassium citrate) can provide temporary symptomatic relief from burning.
• Cranberry / D-Mannose (Tier 2/3): Evidence shows modest prevention of recurrent UTIs; insufficient evidence to cure an active, established bacterial infection.`,
    disclaimer: "Untreated UTIs can ascend to cause serious kidney infections. Medical testing (urinalysis/culture) is recommended."
  },

  // ─────────────────────────────────────────────────
  // ALLERGIC RHINITIS & SEASONAL ALLERGIES
  // ─────────────────────────────────────────────────
  {
    doc_id: "rhinitis_bsaci_001",
    title: "Allergic Rhinitis: Diagnosis and Evidence-Based Management",
    source: "British Society for Allergy and Clinical Immunology (BSACI) / WHO ARIA Guidelines",
    source_url: "https://www.bsaci.org/guidelines/allergic-rhinitis/",
    organization: "BSACI / WHO",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["allergy", "allergic rhinitis", "hay fever", "sneezing", "nasal allergy"],
    keywords: ["allergy", "allergic rhinitis", "hay fever", "sneezing", "cetirizine", "fexofenadine", "nasal spray", "itchy eyes", "watery eyes", "dust allergy"],
    content: `ALLERGIC RHINITIS — BSACI / WHO ARIA Guidelines Summary

DIRECT ANSWER: Allergic rhinitis is an IgE-mediated inflammation of the nasal mucosa triggered by airborne allergens such as pollen (hay fever), house dust mites, pet dander, or mold. It is non-infectious, highly treatable, and distinct from the viral common cold.

KEY DIFFERENCES (Allergy vs. Viral Cold):
• Allergic Rhinitis: Itchy nose/palate, itchy watery eyes, clear thin nasal discharge, paroxysms of repetitive sneezing, no fever, symptoms persist as long as allergen exposure continues.
• Viral Cold: Sore throat initially, thick colored mucus after 2–3 days, general body ache, mild fever, self-resolves in 7–10 days.

EVIDENCE-BASED PHARMACOTHERAPY:
• Second-Generation Oral Antihistamines (Cetirizine 10mg, Fexofenadine 120/180mg, Loratadine 10mg): First-line oral treatment. Non-sedating compared to older first-generation agents (chlorpheniramine).
• Intranasal Corticosteroids (Fluticasone, Mometasone): Most effective single therapy for moderate-to-severe or persistent rhinitis. Requires consistent daily use for optimal anti-inflammatory barrier.
• Saline Nasal Irrigation: Isotonic saline spray or Neti pot mechanically clears mucus and allergens.

WARNING SIGNS:
🚨 Facial swelling, wheezing, or difficulty breathing (possible anaphylaxis)
🚨 Unilateral nasal obstruction with bloody discharge (warrants ENT specialist evaluation)
🚨 Severe sinus pressure and purulent nasal discharge lasting >10 days (secondary bacterial rhinosinusitis)`,
    disclaimer: "Chronic or severe nasal symptoms should be assessed by an allergist or ENT specialist for targeted allergen management."
  },

  // ─────────────────────────────────────────────────
  // JOINT PAIN & OSTEOARTHRITIS
  // ─────────────────────────────────────────────────
  {
    doc_id: "osteoarthritis_nice_001",
    title: "Osteoarthritis & Joint Pain: Assessment and Management",
    source: "NICE Guideline (NG226) / American College of Rheumatology (ACR)",
    source_url: "https://www.nice.org.uk/guidance/ng226",
    organization: "NICE / ACR",
    tier: 1,
    evidence_level: "Strong",
    medical_topics: ["joint pain", "osteoarthritis", "knee pain", "arthritis", "joint stiffness"],
    keywords: ["joint pain", "osteoarthritis", "arthritis", "knee pain", "hip pain", "swollen joint", "joint stiffness", "curcumin", "shallaki", "glucosamine"],
    content: `OSTEOARTHRITIS & JOINT PAIN — NICE (NG226) & ACR Guidelines

DIRECT ANSWER: Osteoarthritis is a chronic degenerative joint condition involving breakdown of articular cartilage, bone remodeling, and mild synovitis. It most frequently affects knees, hips, and hands. Exercise and muscle strengthening are the foundation of treatment.

CLINICAL FEATURES:
• Activity-related joint pain that worsens toward the end of the day and eases with rest
• Morning stiffness lasting less than 30 minutes (stiffness >1 hour suggests inflammatory arthritis like Rheumatoid Arthritis)
• Joint crepitus (grating sensation) and functional limitation

CORE EVIDENCE-BASED MANAGEMENT (NICE NG226):
1. Therapeutic Exercise: Tailored strength training (quadriceps strengthening for knee OA) and low-impact aerobic exercise (cycling, swimming, walking).
2. Weight Management: Weight reduction significantly reduces mechanical compressive load across knee and hip joints.
3. Topical NSAIDs (Diclofenac / Ibuprofen gel): Recommended first-line pharmacotherapy before oral NSAIDs due to lower systemic gastrointestinal and cardiovascular risks.
4. Oral NSAIDs (Ibuprofen, Naproxen): Used intermittently at lowest effective dose with a Proton Pump Inhibitor (PPI) in patients without renal/cardiac contraindications.

AYURVEDIC EVIDENCE PROFILE (Tier 3):
• Shallaki (Boswellia serrata) & Curcumin (Curcuma longa): Clinical trials show standardized extracts of Boswellia and Curcumin possess 5-LOX and COX-2 inhibitory properties, reducing inflammatory markers with moderate pain relief in knee OA.
• Janu Basti & Ayurvedic Oils: Traditional palliative warmth therapy; provide temporary symptomatic comfort.

RED FLAGS (SEEK URGENT MEDICAL CARE):
🚨 Hot, red, acutely swollen, exquisitely tender joint with inability to bear weight and fever (suspected Septic Arthritis — surgical emergency)
🚨 Multiple symmetrical small joint swelling in hands lasting >6 weeks (possible Rheumatoid Arthritis)`,
    disclaimer: "Acutely inflamed, hot, or red joints require prompt clinical examination to exclude septic or inflammatory arthritis."
  },

  // ─────────────────────────────────────────────────
  // DRUG-DRUG & HERB-DRUG INTERACTION MATRIX
  // ─────────────────────────────────────────────────
  {
    doc_id: "drug_interactions_matrix_001",
    title: "Clinical Drug-Drug & Herb-Drug Interaction Matrix",
    source: "British National Formulary (BNF) / Medscape Clinical Reference / Stockley's Drug Interactions",
    source_url: "https://bnf.nice.org.uk/interactions/",
    organization: "BNF / Medscape",
    tier: 2,
    evidence_level: "Strong",
    medical_topics: ["drug interaction", "herb drug interaction", "contraindication", "medicine safety"],
    keywords: ["drug interaction", "herb drug", "aspirin ibuprofen", "paracetamol alcohol", "ashwagandha thyroid", "turmeric warfarin", "metformin contrast"],
    content: `CLINICAL DRUG & HERB INTERACTION MATRIX — Reference Guide

CRITICAL CLINICAL INTERACTIONS:

1. ASPIRIN + IBUPROFEN / OTHER NSAIDs (Severity: Major):
   • Mechanism: Competing COX-1 inhibition. Ibuprofen can block the cardioprotective antiplatelet effect of low-dose aspirin and significantly increases the risk of gastrointestinal ulceration and major bleeding.
   • Recommendation: Avoid concurrent use or take Aspirin at least 30 minutes before Ibuprofen.

2. PARACETAMOL + REGULAR ALCOHOL CONSUMPTION (Severity: Moderate to Major):
   • Mechanism: Chronic ethanol induces hepatic CYP2E1 enzymes, converting more paracetamol into the toxic metabolite NAPQI, depleting glutathione and dramatically increasing acute liver injury risk.
   • Recommendation: Avoid heavy alcohol. Never exceed 2–3g/day of paracetamol if alcohol is consumed.

3. ASHWAGANDHA + LEVOTHYROXINE / THYROID DRUGS (Severity: Moderate):
   • Mechanism: Ashwagandha (Withania somnifera) has demonstrated thyroid-stimulating properties in preclinical and small clinical trials, potentially raising serum T3 and T4 levels additively.
   • Recommendation: Monitor TSH and thyroid levels closely; consult an endocrinologist before combining.

4. TURMERIC / CURCUMIN SUPPLEMENTS + WARFARIN / BLOOD THINNERS (Severity: Moderate):
   • Mechanism: High-dose curcumin extract possesses mild antiplatelet and antithrombotic properties, potentially enhancing anticoagulant effects and bleeding risk.
   • Recommendation: Culinary turmeric is safe; avoid high-dose concentrated curcumin extract capsules while taking Warfarin, Apixaban, or Clopidogrel.

5. METFORMIN + IODINATED RADIOCONTRAST DYES (Severity: Major):
   • Mechanism: Contrast media can cause acute renal impairment, precipitating systemic metformin accumulation and life-threatening lactic acidosis.
   • Recommendation: Discontinue Metformin at the time of contrast CT imaging and withhold for 48 hours until normal renal function is verified by serum creatinine.`,
    disclaimer: "Always inform all your healthcare providers and pharmacists of all prescription drugs, OTC medicines, and herbal supplements you are taking."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Authority Tier Weights for Reranking
// ─────────────────────────────────────────────────────────────────────────────
const RAG_TIER_WEIGHTS = {
  1: 1.0,   // WHO, CDC, NHS, MoHFW, AHA, NICE, GINA, ACG — Highest authority
  2: 0.85,  // BNF, Cochrane, Clinical Pharmacology
  3: 0.65   // AYUSH, NCCIH (Herbal), Traditional Pharmacopoeias — Evidence-limited
};

const RAG_EVIDENCE_WEIGHTS = {
  "Strong": 1.0,
  "Moderate": 0.8,
  "Limited-Moderate": 0.65,
  "Limited": 0.5,
  "Traditional": 0.4,
  "Weak": 0.3,
  "Very Limited": 0.25
};

window.RAG_KB = RAG_KB;
window.RAG_TIER_WEIGHTS = RAG_TIER_WEIGHTS;
window.RAG_EVIDENCE_WEIGHTS = RAG_EVIDENCE_WEIGHTS;

