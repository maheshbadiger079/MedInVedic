/**
 * server/routes/healthcare.js
 * ═══════════════════════════════════════════════════════════════════════════
 * MEDINVEDIC MULTI-SPECIES HEALTHCARE & AYURVEDA ENGINE
 * 
 * Enforces strict, safe separation across:
 * 1. Human Health   (Modern Medicine + Ayurveda + Home Remedies)
 * 2. Animal Health  (Veterinary Medicine + Veterinary Ayurveda + Care)
 * 3. Bird Health    (Avian Medicine + Avian Care + Gentle Nutrition)
 * 
 * CRITICAL SAFETY: Never mix human, veterinary, and avian medicine dosages.
 * Cross-species toxicity checks prevent fatal accidental administrations.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();

// ── TAXONOMY & SPECIES REGISTRY ──────────────────────────────────────────
const HEALTHCARE_TYPES = [
  { id: 'human', label: 'Human Health', icon: '👨‍⚕️', description: 'Modern Pharmaceutical Science + Ancient Ayurvedic Formulations + Home Remedies' },
  { id: 'animal', label: 'Animal Health', icon: '🐕', description: 'Veterinary Medicine + Veterinary Ayurveda + Species-Specific Traditional Care' },
  { id: 'bird', label: 'Bird Health', icon: '🐦', description: 'Avian Medicine + Gentle Avian Care + Safe Environmental Nutrition' }
];

const SPECIES_REGISTRY = {
  human: [
    { id: 'human', name: 'Human (Adult / Child)', icon: '🧑', category: 'human' }
  ],
  animal: [
    { id: 'dog', name: 'Dog', icon: '🐕', category: 'animal' },
    { id: 'cat', name: 'Cat', icon: '🐈', category: 'animal' },
    { id: 'cow', name: 'Cow / Cattle', icon: '🐄', category: 'animal' },
    { id: 'buffalo', name: 'Buffalo', icon: '🐃', category: 'animal' },
    { id: 'goat', name: 'Goat', icon: '🐐', category: 'animal' },
    { id: 'sheep', name: 'Sheep', icon: '🐑', category: 'animal' },
    { id: 'horse', name: 'Horse', icon: '🐎', category: 'animal' },
    { id: 'rabbit', name: 'Rabbit', icon: '🐇', category: 'animal' },
    { id: 'other_animal', name: 'Other Animal', icon: '🐾', category: 'animal' }
  ],
  bird: [
    { id: 'parrot', name: 'Parrot / Macaw', icon: '🦜', category: 'bird' },
    { id: 'pigeon', name: 'Pigeon / Dove', icon: '🕊️', category: 'bird' },
    { id: 'chicken', name: 'Chicken / Poultry', icon: '🐔', category: 'bird' },
    { id: 'duck', name: 'Duck / Waterfowl', icon: '🦆', category: 'bird' },
    { id: 'lovebird', name: 'Lovebird', icon: '🐤', category: 'bird' },
    { id: 'cockatiel', name: 'Cockatiel', icon: '🦜', category: 'bird' },
    { id: 'finch', name: 'Finch / Canary', icon: '🐦', category: 'bird' },
    { id: 'other_bird', name: 'Other Bird', icon: '🪶', category: 'bird' }
  ]
};

// ── MULTI-SPECIES MEDICINES DATABASE ─────────────────────────────────────
const MEDICINES_DB = [
  // ─── 1. HUMAN MEDICINES ───
  {
    id: 'med-hum-001',
    name: 'Paracetamol 500mg (Crocin / Dolo)',
    generic_name: 'Paracetamol (Acetaminophen)',
    active_ingredients: ['Paracetamol 500mg'],
    category: 'OTC Analgesic & Antipyretic',
    healthcare_type: 'human',
    species_compatibility: { human: true, dog: false, cat: false, cow: false, bird: false },
    indications: 'Fever, mild to moderate headaches, muscular aches, and body pain.',
    how_it_works: 'Inhibits central prostaglandin synthesis to elevate pain threshold and modulate hypothalamic thermoregulatory center.',
    warnings: 'Maximum daily dose: 4000mg in adults. Chronic overdose risks fatal hepatotoxicity. Avoid with heavy alcohol consumption.',
    contraindications: 'Severe hepatic impairment, known hypersensitivity to paracetamol.',
    interactions: 'Warfarin (prolonged high doses may increase bleeding risk), Isoniazid, Cholestyramine.',
    evidence_level: 'strong', // strong, limited, traditional, safety_concern
    prescription_required: false,
    source: 'WHO Model List of Essential Medicines 2023',
    source_url: 'https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.02',
    status: 'Approved'
  },
  {
    id: 'med-hum-002',
    name: 'Amoxicillin 500mg',
    generic_name: 'Amoxicillin Trihydrate',
    active_ingredients: ['Amoxicillin 500mg'],
    category: 'Prescription Antibiotic (Beta-lactam)',
    healthcare_type: 'human',
    species_compatibility: { human: true, dog: false, cat: false, cow: false, bird: false },
    indications: 'Bacterial respiratory infections, ENT infections, dental abscesses, UTI.',
    how_it_works: 'Bactericidal; inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins.',
    warnings: 'Must complete full prescribed course. Does not treat viral colds. Discontinue if allergic rash occurs.',
    contraindications: 'Anaphylactic history to penicillins or beta-lactam antibiotics, infectious mononucleosis.',
    interactions: 'Methotrexate, Allopurinol (increased rash risk), Oral contraceptives.',
    evidence_level: 'strong',
    prescription_required: true,
    source: 'ICMR Treatment Guidelines for Antimicrobial Use',
    source_url: 'https://main.icmr.nic.in/',
    status: 'Approved'
  },
  {
    id: 'med-hum-003',
    name: 'Metformin 500mg',
    generic_name: 'Metformin Hydrochloride',
    active_ingredients: ['Metformin 500mg'],
    category: 'Prescription Antidiabetic (Biguanide)',
    healthcare_type: 'human',
    species_compatibility: { human: true, dog: false, cat: false, cow: false, bird: false },
    indications: 'Type 2 Diabetes Mellitus glycemic management; insulin resistance.',
    how_it_works: 'Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity.',
    warnings: 'Take with or after meals to reduce GI disturbance. Monitor renal eGFR annually. Rare risk of lactic acidosis.',
    contraindications: 'eGFR < 30 mL/min/1.73m², acute metabolic acidosis, severe hypoxemia or shock.',
    interactions: 'Iodinated contrast media (withhold 48h prior), Cimetidine.',
    evidence_level: 'strong',
    prescription_required: true,
    source: 'American Diabetes Association (ADA) Standards of Care 2024',
    source_url: 'https://diabetesjournals.org/care',
    status: 'Approved'
  },
  {
    id: 'med-hum-004',
    name: 'Mahasudarshana Ghanvati',
    generic_name: 'Polyherbal Ayurvedic Antipyretic Formulate',
    active_ingredients: ['Swertia chirata (Kiratatikta)', 'Tinospora cordifolia (Guduchi)', 'Triphala', 'Curcuma longa (Haridra)'],
    category: 'Ayurvedic Classical Formulation',
    healthcare_type: 'human',
    species_compatibility: { human: true, dog: false, cat: false, cow: false, bird: false },
    indications: 'Chronic or recurring fevers (Jwara), sluggish liver metabolism, viral convalescence.',
    how_it_works: 'Pacifies Pitta and Kapha doshas, promotes digestion of systemic metabolic toxins (Ama), stimulates natural phagocytosis.',
    warnings: 'Bitter taste; take with warm water. Not a substitute for urgent clinical interventions in bacterial sepsis or dengue shock.',
    contraindications: 'Extreme debility or dehydration without fluid resuscitation.',
    interactions: 'None reported when spaced 1 hour apart from modern allopathic pharmaceuticals.',
    evidence_level: 'traditional',
    prescription_required: false,
    source: 'Ayurvedic Pharmacopoeia of India (API) Part I Vol II',
    source_url: 'https://ayush.gov.in/',
    status: 'Approved'
  },

  // ─── 2. VETERINARY / ANIMAL MEDICINES ───
  {
    id: 'med-vet-001',
    name: 'Carprofen 75mg (Rimadyl / Carodyl)',
    generic_name: 'Carprofen',
    active_ingredients: ['Carprofen 75mg'],
    category: 'Veterinary NSAID (Cox-2 Preferred)',
    healthcare_type: 'animal',
    species_compatibility: { dog: true, cat: false, cow: false, horse: false, bird: false, human: false },
    indications: 'Canine osteoarthritis, post-operative musculoskeletal pain and orthopedic inflammation.',
    how_it_works: 'Reversible inhibition of cyclooxygenase enzymes (Cox-2 preferred) mitigating prostaglandin-mediated pain.',
    warnings: 'STRICTLY FOR CANINE USE ONLY. DO NOT USE IN CATS (causes acute kidney injury). Monitor hepatic and renal enzyme profiles during long-term therapy.',
    contraindications: 'Cats, dogs with GI ulcers, bleeding disorders, preexisting hepatic/renal disease, dehydrated animals.',
    interactions: 'NEVER combine with corticosteroids (e.g. Prednisolone) or other NSAIDs (Meloxicam, Aspirin) — triggers severe GI perforation.',
    evidence_level: 'strong',
    prescription_required: true,
    source: 'Veterinary Medicines Directorate (VMD) & FDA Center for Veterinary Medicine',
    source_url: 'https://www.fda.gov/animal-veterinary',
    status: 'Approved'
  },
  {
    id: 'med-vet-002',
    name: 'Meloxicam 0.5mg/mL Oral Suspension (Melonex / Metacam)',
    generic_name: 'Meloxicam',
    active_ingredients: ['Meloxicam 0.5mg/mL'],
    category: 'Veterinary NSAID',
    healthcare_type: 'animal',
    species_compatibility: { dog: true, cat: true, cow: true, buffalo: true, goat: true, horse: true, bird: false, human: false },
    indications: 'Relief of chronic and acute musculoskeletal pain and inflammation in dogs and cats.',
    how_it_works: 'Inhibits prostaglandin synthesis via selective COX-2 enzyme pathway inhibition.',
    warnings: 'In cats: Extreme caution required. Accurate weight dosing only via veterinary calibrated syringe. Do not overdose. Ensure patient is fully hydrated.',
    contraindications: 'Animals with gastrointestinal ulceration, impaired hepatic, cardiac or renal function, animals under 6 weeks old.',
    interactions: 'Concurrent administration with glucocorticoids, aminoglycosides, or anticoagulants is contraindicated.',
    evidence_level: 'strong',
    prescription_required: true,
    source: 'WSAVA Global Pain Management Guidelines for Dogs and Cats',
    source_url: 'https://wsava.org/',
    status: 'Approved'
  },
  {
    id: 'med-vet-003',
    name: 'Himalaya Liv.52 Pet Liquid',
    generic_name: 'Veterinary Polyherbal Hepatic Stimulant',
    active_ingredients: ['Capparis spinosa (Himsra)', 'Cichorium intybus (Kasani)', 'Solanum nigrum (Kakamachi)', 'Terminalia arjuna'],
    category: 'Veterinary Ayurveda / Herbal Care',
    healthcare_type: 'animal',
    species_compatibility: { dog: true, cat: true, cow: true, buffalo: true, goat: true, sheep: true, horse: false, bird: false, human: false },
    indications: 'Anorexia, supportive therapy in canine hepatic dysfunction, viral hepatitis, debility, toxin recovery.',
    how_it_works: 'Protects hepatic parenchyma against toxins, enhances appetite, promotes hepatocyte regeneration.',
    warnings: 'Supportive care only; does not replace veterinary antibiotics in acute leptospirosis or surgical management for bile duct obstruction.',
    contraindications: 'Complete mechanical biliary obstruction.',
    interactions: 'Safe when administered alongside standard veterinary medications.',
    evidence_level: 'traditional',
    prescription_required: false,
    source: 'Journal of Indian Veterinary Medicine / Himalaya Animal Health Monographs',
    source_url: 'https://himalayawellness.in/',
    status: 'Approved'
  },
  {
    id: 'med-vet-004',
    name: 'Himalaya Scavon Wound Spray',
    generic_name: 'Veterinary Herbal Antibacterial & Maggot Repellent Spray',
    active_ingredients: ['Eucalyptus globulus (Tailapatra)', 'Cedrus deodara (Devadaru)', 'Azadirachta indica (Nimba)'],
    category: 'Veterinary Topical Wound Care',
    healthcare_type: 'animal',
    species_compatibility: { dog: true, cat: false, cow: true, buffalo: true, goat: true, sheep: true, horse: true, bird: false, human: false },
    indications: 'Traumatic cuts, maggot wounds, surgical incisions, foot rot in ruminants.',
    how_it_works: 'Phyto-antimicrobial action, natural insect repellent, accelerates granulation tissue formation.',
    warnings: 'AVOID spraying in eyes or directly on cats (essential oil sensitivity). Do not let animal ingest excessive wet spray.',
    contraindications: 'Felines (cats lack glucuronidation pathway for certain terpene compounds).',
    interactions: 'None known topically.',
    evidence_level: 'traditional',
    prescription_required: false,
    source: 'Indian Journal of Animal Sciences',
    source_url: 'https://icar.org.in/',
    status: 'Approved'
  },

  // ─── 3. AVIAN / BIRD MEDICINES ───
  {
    id: 'med-av-001',
    name: 'Enrofloxacin 10% Avian Oral Drops (Baytril)',
    generic_name: 'Enrofloxacin',
    active_ingredients: ['Enrofloxacin 10mg/mL'],
    category: 'Avian Fluoroquinolone Antibiotic',
    healthcare_type: 'bird',
    species_compatibility: { parrot: true, pigeon: true, chicken: true, duck: true, lovebird: true, cockatiel: true, finch: true, human: false, dog: false, cat: false },
    indications: 'Avian Mycoplasmosis, Pasteurellosis, infectious coryza, bacterial enteritis, respiratory distress in companion & poultry birds.',
    how_it_works: 'Inhibits bacterial DNA-gyrase (type II topoisomerase) stopping bacterial replication.',
    warnings: 'MUST be dosed strictly according to avian gram weight. Incorrect water dosing leads to therapeutic failure or toxicity. May cause cartilage defects in rapidly growing young birds.',
    contraindications: 'Laying birds producing eggs for human consumption without prescribed withdrawal period. Severe renal failure.',
    interactions: 'Do not administer with mineral grit, divalent cations (Calcium, Magnesium) or antacids within 2 hours as they chelate the drug.',
    evidence_level: 'strong',
    prescription_required: true,
    source: 'Association of Avian Veterinarians (AAV) & Avian Medicine Formulary',
    source_url: 'https://www.aav.org/',
    status: 'Approved'
  },
  {
    id: 'med-av-002',
    name: 'Avian Probiotic & Electrolyte Hydration Formula',
    generic_name: 'Avian Enteric Probiotic with Dextrose & Potassium',
    active_ingredients: ['Lactobacillus acidophilus', 'Bifidobacterium bifidum', 'Electrolyte Salts', 'Dextrose'],
    category: 'Avian Supportive Care & Nutrition',
    healthcare_type: 'bird',
    species_compatibility: { parrot: true, pigeon: true, chicken: true, duck: true, lovebird: true, cockatiel: true, finch: true, human: false, dog: false, cat: false },
    indications: 'Heat stress, travel stress, post-antibiotic dysbiosis, crop slow-down, mild dehydration in birds.',
    how_it_works: 'Restores beneficial crop and gut microflora, restores osmotic hydration balance in avian kidneys.',
    warnings: 'Change mixed drinking water every 12 hours to prevent bacterial contamination. If bird is severely hypothermic or prostrated, seek immediate avian emergency vet.',
    contraindications: 'Intestinal impaction or severe crop stasis (sour crop) requiring aspiration.',
    interactions: 'Best administered after completion of antibiotic course.',
    evidence_level: 'strong',
    prescription_required: false,
    source: 'Clinical Avian Medicine (Harrison & Harrison)',
    source_url: 'https://www.avianmedicine.net/',
    status: 'Approved'
  },
  {
    id: 'med-av-003',
    name: 'Avian Gentle Chamomile & Aloe Feather Mist',
    generic_name: 'Herbal Avian Feather Conditioner',
    active_ingredients: ['Matricaria chamomilla extract (0.5%)', 'Aloe barbadensis leaf juice (pure filtered)'],
    category: 'Avian Traditional & Grooming Care',
    healthcare_type: 'bird',
    species_compatibility: { parrot: true, cockatiel: true, lovebird: true, pigeon: true, finch: true, chicken: false, duck: false, human: false, dog: false, cat: false },
    indications: 'Feather plucking caused by dry skin, molting irritation, plumage dust cleanup.',
    how_it_works: 'Soothes dermal inflammation with gentle natural flavonoids, maintains plumage lipid structure without synthetic fragrance.',
    warnings: 'CRITICAL: DO NOT use products containing essential oils (tea tree, eucalyptus, peppermint) on birds — avian respiratory systems are acutely fragile and essential oil vapors can be FATAL. Mist gently from 12 inches away.',
    contraindications: 'Open bleeding skin lesions, active viral feather diseases (PBFD) requiring clinical diagnosis.',
    interactions: 'None known.',
    evidence_level: 'traditional',
    prescription_required: false,
    source: 'BSAVA Manual of Avian Practice',
    source_url: 'https://www.bsava.com/',
    status: 'Approved'
  }
];

// ── CROSS-SPECIES TOXICITY WARNINGS DICTIONARY ───────────────────────────
const CROSS_SPECIES_TOXICITY = [
  {
    substance: 'Paracetamol / Acetaminophen',
    aliases: ['paracetamol', 'crocin', 'dolo', 'calpol', 'acetaminophen', 'tylenol'],
    target_species: ['cat', 'dog'],
    risk_level: 'FATAL / EXTREME EMERGENCY',
    rationale: 'Paracetamol is FATAL to cats even in microscopic doses because cats lack the glucuronyl transferase enzyme, causing methemoglobinemia (suffocation of red blood cells), facial edema, and liver death. In dogs, it causes acute hepatic necrosis and dry eye.'
  },
  {
    substance: 'Ibuprofen & Human NSAIDs',
    aliases: ['ibuprofen', 'brufen', 'combiflam', 'advil', 'motrin', 'aspirin', 'diclofenac', 'voveran'],
    target_species: ['dog', 'cat', 'bird'],
    risk_level: 'SEVERE / LIFE-THREATENING',
    rationale: 'Human NSAIDs cause severe gastric ulceration, intestinal perforation, and acute renal failure in dogs and cats within hours. Diclofenac has famously wiped out 99% of vulture bird populations in South Asia due to catastrophic visceral gout.'
  },
  {
    substance: 'Essential Oils (Tea Tree, Eucalyptus, Peppermint)',
    aliases: ['tea tree', 'eucalyptus', 'peppermint', 'essential oil', 'diffuser'],
    target_species: ['bird', 'cat'],
    risk_level: 'ACUTE TOXICITY / RESPIRATORY COLLAPSE',
    rationale: 'Birds possess a sensitive 9-air-sac respiratory anatomy; aerosolized essential oils or Teflon/PTFE fumes lead to rapid pulmonary hemorrhage and death. Cats lack hepatic metabolic enzymes to clear terpenes and phenols.'
  },
  {
    substance: 'Allium Family (Onion, Garlic, Chives)',
    aliases: ['onion', 'garlic', 'lehsun', 'pyaz', 'chives'],
    target_species: ['dog', 'cat'],
    risk_level: 'TOXIC (Heinz Body Anemia)',
    rationale: 'Contain n-propyl disulfide which oxidizes hemoglobin in red blood cells of dogs and cats, causing hemolytic anemia, weakness, reddish urine, and collapse.'
  }
];

// ── API ROUTES ───────────────────────────────────────────────────────────

/**
 * GET /api/healthcare/species
 * Returns taxonomy of healthcare types & species
 */
router.get('/species', (req, res) => {
  res.json({
    success: true,
    healthcare_types: HEALTHCARE_TYPES,
    species: SPECIES_REGISTRY
  });
});

/**
 * GET /api/healthcare/medicines
 * Returns medicines strictly filtered by healthcare_type and optional species
 */
router.get('/medicines', (req, res) => {
  const { healthcare_type, species, category, search } = req.query;

  let filtered = [...MEDICINES_DB];

  if (healthcare_type) {
    filtered = filtered.filter(m => m.healthcare_type.toLowerCase() === healthcare_type.toLowerCase());
  }

  if (species && species !== 'all') {
    const spKey = species.toLowerCase();
    filtered = filtered.filter(m => m.species_compatibility && m.species_compatibility[spKey] === true);
  }

  if (category && category !== 'all') {
    filtered = filtered.filter(m => m.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.generic_name.toLowerCase().includes(q) ||
      m.indications.toLowerCase().includes(q) ||
      m.active_ingredients.some(ai => ai.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: filtered.length,
    medicines: filtered
  });
});

/**
 * POST /api/healthcare/safety-check
 * Evaluates whether a proposed human medicine or ingredient is toxic to an animal or bird
 */
router.post('/safety-check', (req, res) => {
  const { query, species } = req.body;
  if (!query || !species) {
    return res.status(400).json({ success: false, error: 'Query and species are required.' });
  }

  const q = query.toLowerCase();
  const sp = species.toLowerCase();

  // Find matching toxicity alert
  const matched = CROSS_SPECIES_TOXICITY.find(item => {
    const matchesSpecies = item.target_species.includes(sp);
    const matchesSubstance = item.aliases.some(alias => q.includes(alias));
    return matchesSpecies && matchesSubstance;
  });

  if (matched) {
    return res.json({
      success: true,
      safe: false,
      risk_level: matched.risk_level,
      warning: `⚠️ DANGER FOR ${sp.toUpperCase()}: ${matched.substance} is NOT SAFE.`,
      rationale: matched.rationale,
      action: 'DO NOT ADMINISTER. Contact a licensed veterinarian immediately.'
    });
  }

  // Cross-check with human medicines being requested for non-humans
  if (sp !== 'human') {
    const matchesHumanMed = MEDICINES_DB.find(m => 
      m.healthcare_type === 'human' && 
      (m.name.toLowerCase().includes(q) || m.generic_name.toLowerCase().includes(q))
    );

    if (matchesHumanMed) {
      const isExplicitlySafe = matchesHumanMed.species_compatibility && matchesHumanMed.species_compatibility[sp] === true;
      if (!isExplicitlySafe) {
        return res.json({
          success: true,
          safe: false,
          risk_level: 'CAUTION: Human Medicine for ' + sp.toUpperCase(),
          warning: `⚠️ Never give human medicine dosages of "${matchesHumanMed.name}" to a ${sp}.`,
          rationale: 'Animals and birds have vastly different metabolic pathways, renal clearance rates, and receptor sensitivities. Human formulations frequently contain inactive binders or dosages fatal to pets.',
          action: 'Consult a qualified veterinarian for species-appropriate veterinary alternatives.'
        });
      }
    }
  }

  res.json({
    success: true,
    safe: true,
    message: `No immediate toxic contraindication found in safety database for ${sp}. Always verify dosage with a qualified healthcare or veterinary professional.`
  });
});

/**
 * POST /api/healthcare/search
 * Multi-species smart search with required species classification
 */
router.post('/search', (req, res) => {
  const { query, healthcare_type, species } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ success: false, error: 'Search query is required.' });
  }

  // Safety first: Check cross-species toxicity if species is specified
  let safetyAlert = null;
  if (species && species !== 'human') {
    const q = query.toLowerCase();
    const sp = species.toLowerCase();
    const matched = CROSS_SPECIES_TOXICITY.find(item => 
      item.target_species.includes(sp) && item.aliases.some(alias => q.includes(alias))
    );
    if (matched) {
      safetyAlert = {
        substance: matched.substance,
        risk_level: matched.risk_level,
        rationale: matched.rationale
      };
    }
  }

  // Filter medicines
  let results = [...MEDICINES_DB];

  if (healthcare_type && healthcare_type !== 'all') {
    results = results.filter(m => m.healthcare_type.toLowerCase() === healthcare_type.toLowerCase());
  }

  if (species && species !== 'all') {
    const sp = species.toLowerCase();
    results = results.filter(m => m.species_compatibility && m.species_compatibility[sp] === true);
  }

  const q = query.toLowerCase().trim();
  results = results.filter(m => 
    m.name.toLowerCase().includes(q) ||
    m.generic_name.toLowerCase().includes(q) ||
    m.indications.toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q)
  );

  res.json({
    success: true,
    query,
    healthcare_type: healthcare_type || 'all',
    species: species || 'all',
    safety_alert: safetyAlert,
    total: results.length,
    results
  });
});

module.exports = router;
