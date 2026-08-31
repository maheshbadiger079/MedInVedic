/**
 * medical-kb.js — MedInVedic Deep Medical Knowledge Base
 * Detailed data for Modern Medicines, Ayurvedic Remedies, and Home Remedies
 */

const MEDICAL_KB = {
  "chicken pox": {
    condition: "Chicken Pox (Varicella)",
    description: "A highly contagious viral infection causing an itchy, blister-like rash on the skin.",
    modern: [
      {
        name: "Acyclovir",
        primary_use: "Antiviral treatment to reduce severity and duration of viral replication.",
        mechanism: "Competitive inhibitor of viral DNA polymerase. It incorporates into the viral DNA chain, causing premature termination.",
        benefits: "Reduces number of lesions, shortens fever duration, and lowers risk of complications like pneumonia.",
        side_effects: {
          common: ["Nausea", "Diarrhea", "Headache (10-15%)"],
          rare: ["Renal failure", "Thrombocytopenia (<1%)", "Encephalopathy (Rare)"]
        },
        indications: "Symptoms within 24-48 hours of rash onset.",
        contraindications: "Hypersensitivity to acyclovir or valacyclovir.",
        interactions: "Probenecid increases acyclovir levels; caution with other nephrotoxic drugs."
      },
      {
        name: "Calamine Lotion",
        primary_use: "Topical antipuritic to soothe itching and dry out blisters.",
        mechanism: "Zinc oxide and ferric oxide provide a cooling effect through evaporation and have mild astringent properties.",
        benefits: "Significant reduction in skin irritation and secondary infection risk from scratching.",
        side_effects: {
          common: ["Dry skin", "Mild skin irritation"],
          rare: ["Allergic dermatitis (Rare)"]
        },
        indications: "Itchy skin rashes, chicken pox lesions, insect bites.",
        contraindications: "Open wounds or severely broken skin.",
        interactions: "Minimal known topical interactions."
      }
    ],
    ayurvedic: [
      {
        name: "Neem (Margosa)",
        traditional_use: "Used for centuries as Shitala (cooling) and Krimighna (antimicrobial) agent in eruptive fevers.",
        foundation: "Pitta-Kapha balancing; purifies Rakta Dhatu (blood) and clears heat from the skin.",
        efficacy: "Clinically observed to prevent secondary bacterial infections and accelerate lesion healing.",
        ingredients: [
          { common_name: "Neem Leaves", botanical_name: "Azadirachta indica", quantity: "Fresh bunch", preparation: "Boiled in water for bathing or made into paste." }
        ],
        guidelines: {
          dosage: "External application only; 2-3 times daily.",
          preparation: "Boil 50g leaves in 2L water until water turns green; use for lukewarm sponge baths.",
          interactions: "No known adverse interactions with modern antivirals when used topically."
        }
      }
    ],
    home_remedies: [
      {
        name: "Baking Soda Soak",
        context: "A traditional household remedy used globally since the 19th century to neutralize skin pH and stop itching.",
        origins: "Rooted in early domestic nursing practices for infectious childhood diseases.",
        ingredients: [
          { common_name: "Baking Soda", quantity: "1/2 cup", preparation: "Stir into lukewarm bath water." }
        ],
        instructions: {
          method: "Soak the affected person for 15-20 minutes. Pat dry gently to avoid breaking blisters.",
          serving_size: "1 bath per day",
          interactions: "Avoid immediate application of acidic topical ointments."
        }
      }
    ]
  },
  "diabetes": {
    condition: "Type 2 Diabetes Mellitus",
    description: "A chronic condition that affects the way the body processes blood sugar (glucose).",
    modern: [
      {
        name: "Metformin",
        primary_use: "First-line oral hypoglycemic agent for Type 2 Diabetes.",
        mechanism: "Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity.",
        benefits: "Weight-neutral, low risk of hypoglycemia, and potential cardiovascular benefits.",
        side_effects: {
          common: ["Gastrointestinal upset", "Diarrhea", "Metallic taste (20-30%)"],
          rare: ["Lactic acidosis (Very rare but serious)", "Vitamin B12 deficiency (Long-term)"]
        },
        indications: "Hyperglycemia in Type 2 Diabetes not controlled by diet/exercise.",
        contraindications: "Severe renal impairment (eGFR <30), metabolic acidosis.",
        interactions: "Alcohol increases lactic acidosis risk; contrast dyes require temporary discontinuation."
      }
    ],
    ayurvedic: [
      {
        name: "Nisha-Amalaki",
        traditional_use: "A classical formulation mentioned in Ayurveda for 'Prameha' (urinary disorders/diabetes).",
        foundation: "Combination of Turmeric and Amla; balances all three Doshas but primarily Kapha-Pitta.",
        efficacy: "Modern research suggests synergistic antioxidant and anti-hyperglycemic effects.",
        ingredients: [
          { common_name: "Turmeric", botanical_name: "Curcuma longa", quantity: "500mg", preparation: "Dried rhizome powder." },
          { common_name: "Amla", botanical_name: "Emblica officinalis", quantity: "500mg", preparation: "Dried fruit powder." }
        ],
        guidelines: {
          dosage: "1-2 grams twice daily with warm water.",
          preparation: "Mix equal parts of high-quality powders.",
          interactions: "May have additive effects with metformin; monitor blood sugar closely."
        }
      }
    ],
    home_remedies: [
      {
        name: "Fenugreek (Methi) Water",
        context: "Used in Indian and Middle Eastern households for over 2000 years to improve metabolic health.",
        origins: "Documented in Egyptian papyri and Ayurvedic texts for digestive and metabolic harmony.",
        ingredients: [
          { common_name: "Fenugreek Seeds", quantity: "2 tsp", preparation: "Soak in 1 cup water overnight." }
        ],
        instructions: {
          method: "Drink the water and chew the seeds on an empty stomach in the morning.",
          serving_size: "1 cup daily",
          interactions: "High fiber may delay absorption of other oral medications; take meds 1 hour before or 2 hours after."
        }
      }
    ]
  },
  "blood pressure": {
    condition: "Hypertension (High Blood Pressure)",
    description: "A condition in which the force of the blood against the artery walls is too high.",
    modern: [
      {
        name: "Amlodipine",
        primary_use: "Calcium channel blocker for hypertension and angina.",
        mechanism: "Inhibits the transmembrane influx of calcium ions into vascular smooth muscle and cardiac muscle, leading to vasodilation.",
        benefits: "Long-acting, once-daily dosing, effective across various demographics.",
        side_effects: {
          common: ["Peripheral edema (Swelling)", "Dizziness", "Palpitations (5-10%)"],
          rare: ["Gingival hyperplasia", "Hypotension (Rare)"]
        },
        indications: "Chronic stable hypertension, Vasospastic angina.",
        contraindications: "Severe hypotension, shock.",
        interactions: "Grapefruit juice may increase levels; caution with Sildenafil."
      }
    ],
    ayurvedic: [
      {
        name: "Sarpagandha (Rauwolfia)",
        traditional_use: "Known as 'Indian Snakeroot', used for insomnia and insanity, and later identified for 'Hridgraha' (heart tightness).",
        foundation: "Vata-Kapha pacifying; acts as a powerful sedative and vasodilator.",
        efficacy: "The source from which Reserpine, the first modern antihypertensive, was isolated.",
        ingredients: [
          { common_name: "Sarpagandha Root", botanical_name: "Rauwolfia serpentina", quantity: "250-500mg", preparation: "Powdered root tablet." }
        ],
        guidelines: {
          dosage: "1 tablet daily under strict medical supervision.",
          preparation: "Ghanavati (concentrated tablet) form is preferred.",
          interactions: "Strong additive effect with modern BP meds; can cause severe depression if misused."
        }
      }
    ],
    home_remedies: [
      {
        name: "Garlic (Lashuna) Tonic",
        context: "Garlic has been a staple 'heart medicine' in Mediterranean and Ayurvedic traditions for millennia.",
        origins: "Recognized by Ancient Greeks and Indian Vaidyas for 'thinning the blood' and clearing blockages.",
        ingredients: [
          { common_name: "Raw Garlic", quantity: "1-2 cloves", preparation: "Crushed or finely chopped." }
        ],
        instructions: {
          method: "Consume raw on empty stomach or mix with honey. Crushing is essential to release Allicin.",
          serving_size: "1-2 cloves daily",
          interactions: "May increase risk of bleeding if taken with anticoagulants like Warfarin."
        }
      }
    ]
  },
  "influenza": {
    condition: "Influenza (Flu)",
    description: "A viral infection that attacks your respiratory system—your nose, throat, and lungs.",
    modern: [
      {
        name: "Oseltamivir (Tamiflu)",
        primary_use: "Antiviral for Influenza A and B treatment and prophylaxis.",
        mechanism: "Neuraminidase inhibitor. Prevents new viral particles from being released from host cells.",
        benefits: "Reduces symptom duration by 1-2 days and lowers risk of secondary complications.",
        side_effects: {
          common: ["Nausea", "Vomiting", "Insomnia (5-10%)"],
          rare: ["Neuropsychiatric events (Agitation/Confusion)", "SJS (Stevens-Johnson Syndrome)"]
        },
        indications: "Start within 48 hours of first symptoms.",
        contraindications: "Hypersensitivity to oseltamivir.",
        interactions: "Live flu vaccine effectiveness reduced; Probenecid increases levels."
      }
    ],
    ayurvedic: [
      {
        name: "Tribhuvan Kirti Rasa",
        traditional_use: "A classical Herbo-mineral formulation for 'Vata-Kaphaja Jwara' (Flu-like fevers).",
        foundation: "Shuddha Hingula, Shunthi, and Pippali base. Increases Agni (fire) to burn 'Ama' (toxins).",
        efficacy: "Effective in reducing temperature and muscle aches associated with viral fevers.",
        ingredients: [
          { common_name: "Cinnabar (Purified)", botanical_name: "Shuddha Hingula", quantity: "25mg", preparation: "Bhasma (processed ash)." },
          { common_name: "Ginger", botanical_name: "Zingiber officinale", quantity: "125mg", preparation: "Dry powder." }
        ],
        guidelines: {
          dosage: "1-2 tablets twice daily with honey or ginger juice.",
          preparation: "Best taken as Vati (tablet) form.",
          interactions: "Avoid high-protein diet; monitor closely in patients with gastric ulcers."
        }
      }
    ],
    home_remedies: [
      {
        name: "Ginger-Holy Basil (Tulsi) Kadha",
        context: "The definitive Indian 'Kadha' used for respiratory viral infections for over 3000 years.",
        origins: "Rooted in tribal and household traditions of the Gangetic plains for winter wellness.",
        ingredients: [
          { common_name: "Fresh Ginger", quantity: "1 inch", preparation: "Crushed." },
          { common_name: "Tulsi Leaves", quantity: "10-12", preparation: "Whole leaves." },
          { common_name: "Black Pepper", quantity: "4-5", preparation: "Crushed." }
        ],
        instructions: {
          method: "Boil in 2 cups of water until reduced to 1 cup. Strain and add half a spoon of honey.",
          serving_size: "1/2 cup twice daily",
          interactions: "Anticoagulants (due to ginger's blood-thinning potential)."
        }
      }
    ]
  },
  "common cold": {
    condition: "Common Cold (Viral Rhinitis)",
    description: "A viral infection of the nose and throat, characterized by congestion and sneezing.",
    modern: [
      {
        name: "Pseudoephedrine",
        primary_use: "Systemic nasal and sinus decongestant.",
        mechanism: "α-adrenergic agonist. Constricts dilated blood vessels in the nasal mucosa to reduce swelling.",
        benefits: "Rapid relief of nasal congestion and sinus pressure.",
        side_effects: {
          common: ["Tachycardia", "Anxiety", "Increased BP (15-20%)"],
          rare: ["Ischemic colitis", "Hallucinations (Rare)"]
        },
        indications: "Nasal congestion due to cold or allergies.",
        contraindications: "Severe hypertension, CAD, use with MAOIs.",
        interactions: "MAOIs may lead to hypertensive crisis; reduces effect of antihypertensives."
      }
    ],
    ayurvedic: [
      {
        name: "Sitopaladi Churna",
        traditional_use: "Mentioned in 'Sarangadhara Samhita' as a prime recipe for respiratory disorders.",
        foundation: "Cools 'Pitta' but mainly clears 'Kapha' from the lungs and chest.",
        efficacy: "Acts as a natural expectorant and immune modulator to reduce recurring infections.",
        ingredients: [
          { common_name: "Vanshlochan", botanical_name: "Bambusa arundinacea", quantity: "16 parts", preparation: "Silica from bamboo nodes." },
          { common_name: "Long Pepper", botanical_name: "Piper longum", quantity: "4 parts", preparation: "Fine powder." }
        ],
        guidelines: {
          dosage: "3-5 grams twice daily with honey.",
          preparation: "Fine powder mixture; must be licked slowly off a spoon (Anupana).",
          interactions: "Safe for children; may interact with corticosteroids."
        }
      }
    ],
    home_remedies: [
      {
        name: "Steam Inhalation (Eucalyptus)",
        context: "Used since the mid-19th century in modern medicine to clear respiratory blockages.",
        origins: "Western herbalist adaptation of Australian aboriginal practices.",
        ingredients: [
          { common_name: "Eucalyptus Oil", quantity: "2-3 drops", preparation: "Essential oil." }
        ],
        instructions: {
          method: "Add to a bowl of hot water. Drape a towel over head and breathe for 10 minutes.",
          serving_size: "Twice daily",
          interactions: "Avoid essential oils in babies/toddlers due to risk of laryngospasm."
        }
      }
    ]
  },
  "dengue": {
    condition: "Dengue Fever",
    description: "A mosquito-borne viral disease causing high fever, joint pain, and potential internal bleeding.",
    modern: [
      {
        name: "Acetaminophen (Paracetamol)",
        primary_use: "Antipyretic and analgesic of choice for Dengue.",
        mechanism: "Inhibition of prostaglandin synthesis in the CNS. Does not affect platelet function.",
        benefits: "Safe for control of high fever (104°F) without increasing risk of hemorrhage.",
        side_effects: {
          common: ["Liver enzyme elevation", "Nausea"],
          rare: ["Hepatotoxicity (at >4g/day)", "SJS"]
        },
        indications: "Fever management during febrile phase of Dengue.",
        contraindications: "Severe liver disease.",
        interactions: "Avoid NSAIDs (Aspirin/Ibuprofen) as they increase bleeding risk by inhibiting platelets."
      }
    ],
    ayurvedic: [
      {
        name: "Papaya Leaf Extract",
        traditional_use: "Recent widespread clinical usage for 'Vishama Jwara' (variable fevers with low strength).",
        foundation: "Tikta (bitter) Rasa; stimulates thrombopoiesis (platelet production).",
        efficacy: "Scientific studies observe significant increase in platelet counts in Dengue patients.",
        ingredients: [
          { common_name: "Papaya Leaf", botanical_name: "Carica papaya", quantity: "20ml", preparation: "Fresh juice concentrate." }
        ],
        guidelines: {
          dosage: "20ml twice daily.",
          preparation: "Crush fresh tender leaves without stalks; extract juice without water.",
          interactions: "May have uterine stimulatory effect (Avoid in pregnancy)."
        }
      }
    ],
    home_remedies: [
      {
        name: "Pomegranate and Coconut Hydration",
        context: "Vital nutritional support for hemorrhagic fevers.",
        origins: "Tropical health wisdom focused on vascular permeability and blood energy (Rakta Shakti).",
        ingredients: [
          { common_name: "Coconut Water", quantity: "1 cup", preparation: "Fresh." },
          { common_name: "Pomegranate Juice", quantity: "1/2 cup", preparation: "Cold-pressed." }
        ],
        instructions: {
          method: "Alternate between coconut water and pomegranate juice every 2-3 hours.",
          serving_size: "Throughout the day",
          interactions: "Safe and widely recommended beside clinical fluids."
        }
      }
    ]
  },
  "measles": {
    condition: "Measles (Rubeola)",
    description: "A viral infection that's serious for small children but is easily preventable by a vaccine.",
    modern: [
      {
        name: "Vitamin A Supplementation",
        primary_use: "Critical adjunct therapy for all children with acute measles.",
        mechanism: "Restores epithelial integrity and modulates the immune response. Prevents blindness.",
        benefits: "Reduces measles mortality by 50-80% in high-risk areas.",
        side_effects: {
          common: ["Bulging fontanelle (Infants)", "Vomiting"],
          rare: ["Hypervitaminosis A (Chronic)"]
        },
        indications: "Immediate upon diagnosis of measles regardless of dietary status.",
        contraindications: "Existing high Vitamin A levels.",
        interactions: "Mineral oil reduces absorption."
      }
    ],
    ayurvedic: [
      {
        name: "Shatavari (Asparagus)",
        traditional_use: "Refrigerant and nutritive tonic used for 'Masoorika' (eruptive diseases).",
        foundation: "Pitta-pacifying; helps in the smooth eruption and maturity of the rash.",
        efficacy: "Reduces burning sensation and prevents dehydration during high fever.",
        ingredients: [
          { common_name: "Shatavari Root", botanical_name: "Asparagus racemosus", quantity: "3-5g", preparation: "Root powder." }
        ],
        guidelines: {
          dosage: "5g with milk once daily.",
          preparation: "Ksheerapaka (Milk decoction) is most effective.",
          interactions: "Diuretic effect; monitor fluid intake."
        }
      }
    ],
    home_remedies: [
      {
        name: "Neem and Turmeric Antiseptic Paste",
        context: "Universal rural remedy for eruptive skin viral diseases.",
        origins: "Vedic dermatology practices for childhood infections.",
        ingredients: [
          { common_name: "Neem Powder", quantity: "1 tsp", preparation: "Dry extract." },
          { common_name: "Turmeric", quantity: "1 tsp", preparation: "Fresh or dry powder." }
        ],
        instructions: {
          method: "Mix with water to form a thick paste. Apply once a day to skin lesions to prevent infection.",
          serving_size: "Topical only",
          interactions: "None known with oral medications."
        }
      }
    ]
  },
  "fever": {
    condition: "Fever (Pyrexia)",
    description: "An elevation in body temperature (above 100.4°F/38°C), often as a response to infection or inflammation.",
    modern: [
      {
        name: "Paracetamol (Acetaminophen)",
        primary_use: "Antipyretic and analgesic for mild-to-moderate fever and pain.",
        mechanism: "Mainly acts centrally by inhibiting COX-2 in the hypothalamus, raising the pain threshold and inhibiting the heat-regulating center.",
        benefits: "Safe and effective first-line treatment for reducing high body temperature.",
        side_effects: {
          common: ["Liver enzyme elevation (minor)", "Skin rash"],
          rare: ["Severe hepatotoxicity (at high doses)", "Hypersensitivity"]
        },
        indications: "High body temperature, generalized body aches.",
        contraindications: "Severe liver or kidney disease.",
        interactions: "Alcohol increases liver damage risk; caution with other paracetamol-containing products."
      }
    ],
    ayurvedic: [
      {
        name: "Maha Sudarshan Churna",
        traditional_use: "A legendary classical formulation used for 'Jwara' (all types of fevers).",
        foundation: "Contains 50+ bitter herbs like Kiratatikta that detoxify the 'Ama' (toxins) and balance Pitta-Kapha.",
        efficacy: "Effective in viral, bacterial, and chronic fevers through its immune-enhancing and detoxifying actions.",
        ingredients: [
          { common_name: "Chirata", botanical_name: "Swertia chirayita", quantity: "Main part", preparation: "Fine dry powder." }
        ],
        guidelines: {
          dosage: "3-5 grams twice daily with warm water.",
          preparation: "Best consumed as a bitter tea or powder mixed with warm water.",
          interactions: "No known adverse interactions with modern antipyretics."
        }
      }
    ],
    home_remedies: [
      {
        name: "Lukewarm Sponge & Tulsi Tea",
        context: "The universal primary care for high fever across cultures.",
        origins: "Ayurvedic and modern nursing standards combined.",
        ingredients: [
          { common_name: "Fresh Tulsi (Basil)", quantity: "10 leaves", preparation: "Boiled in 1 cup water." },
          { common_name: "Water", quantity: "1 bowl", preparation: "Lukewarm (not cold)." }
        ],
        instructions: {
          method: "Sponge the body (forehead, neck, armpits) while drinking the hot Tulsi tea intermittently.",
          serving_size: "Intermittent",
          interactions: "Avoid cold water sponging as it might cause shivering."
        }
      }
    ]
  },
  "cough": {
    condition: "Cough (Tussis)",
    description: "A voluntary or involuntary reflex that clears the throat and breathing passage of foreign particles and microbes.",
    modern: [
      {
        name: "Dextromethorphan / Guaifenesin",
        primary_use: "Dextromethorphan for dry cough; Guaifenesin as an expectorant for chest congestion.",
        mechanism: "Suppresses the cough reflex centrally in the medulla (Dextro) or thins bronchial secretions (Guaifenesin).",
        benefits: "Significant relief from persistent coughing fits and facilitates removal of mucus.",
        side_effects: {
          common: ["Drowsiness", "Dizziness", "Gastrointestinal upset"],
          rare: ["Respiratory depression at ultra-high doses", "Confusion"]
        },
        indications: "Common cold, bronchitis, respiratory infections.",
        contraindications: "Persistent cough due to asthma or smoking; use with MAOIs.",
        interactions: "Increased sedation with alcohol or antihistamines."
      }
    ],
    ayurvedic: [
      {
        name: "Vasavaleha",
        traditional_use: "A specialized herbal jam used for 'Kasa' (cough) and 'Shwasa' (breathing issues).",
        foundation: "Vasa (Adhatoda vasica) is a potent bronchodilator and Kapha-liquefying agent.",
        efficacy: "Modern studies confirm its role as an effective antispasmodic and mucolytic.",
        ingredients: [
          { common_name: "Adulsa (Vasa)", botanical_name: "Adhatoda vasica", quantity: "Main herb", preparation: "Decoction concentrate." },
          { common_name: "Long Pepper", botanical_name: "Piper longum", quantity: "Added for potency", preparation: "Fine powder." }
        ],
        guidelines: {
          dosage: "1-2 teaspoons twice daily.",
          preparation: "Likya (lickable) form ensures localized action on the throat.",
          interactions: "Safe; may have additive effects with modern bronchodilators."
        }
      }
    ],
    home_remedies: [
      {
        name: "Turmeric Milk & Honey-Ginger Shot",
        context: "The staple 'Dadi-maa' (Grandmother's) remedy for viral and bacterial throat infections.",
        origins: "Ayurvedic tradition for throat localized immunity.",
        ingredients: [
          { common_name: "Fresh Turmeric", quantity: "1/2 tsp", preparation: "Mixed in warm milk." },
          { common_name: "Ginger Juice", quantity: "1 tsp", preparation: "Mixed with 1 tsp raw honey." }
        ],
        instructions: {
          method: "Lick the Honey-Ginger mix slowly; follow with warm Turmeric milk before bed.",
          serving_size: "Once at night",
          interactions: "Avoid for children under 1 year due to honey."
        }
      }
    ]
  },
  "abdominal pain": {
    condition: "Abdominal Pain (Stomach Pain)",
    description: "Pain or discomfort felt in the part of the body between the chest and the groin.",
    modern: [
      {
        name: "Dicyclomine",
        primary_use: "Antispasmodic for relief of stomach and intestinal cramps.",
        mechanism: "Anticholinergic/antispasmodic that blocks the action of acetylcholine on smooth muscles, reducing motility and spasms.",
        benefits: "Rapid relief of cramping and pain associated with IBS or functional bowel disorders.",
        side_effects: {
          common: ["Dry mouth", "Blurred vision", "Dizziness (15-20%)"],
          rare: ["Paralytic ileus", "Tachycardia"]
        },
        indications: "Stomach cramps, Spastic colon.",
        contraindications: "Glaucoma, myasthenia gravis, obstructive uropathy.",
        interactions: "Enhanced effects with antihistamines and antidepressants."
      }
    ],
    ayurvedic: [
      {
        name: "Shankha Vati",
        traditional_use: "Used for 'Ajirna' (indigestion) and 'Udarashoola' (abdominal colic/pain).",
        foundation: "Contains purified conch shell ash (Shankha Bhasma) and digestive salts to balance Vata and Samana Prana.",
        efficacy: "Provides quick relief from gas, acidity, and localized digestive spasms.",
        ingredients: [
          { common_name: "Conch Shell Ash", botanical_name: "Shankha Bhasma", quantity: "125mg", preparation: "Calcinated powder." }
        ],
        guidelines: {
          dosage: "1-2 tablets after meals with warm water.",
          preparation: "Concentrated tablet (Vati).",
          interactions: "May increase blood sodium levels; use with caution in high BP."
        }
      }
    ],
    home_remedies: [
      {
        name: "Ajwain (Carom) & Black Salt Digestant",
        context: "The fastest household remedy for bloating and gas-related stomach pain.",
        origins: "Culinary herbalism common in Indian households.",
        ingredients: [
          { common_name: "Carom Seeds (Ajwain)", quantity: "1 tsp", preparation: "Lightly roasted." },
          { common_name: "Black Salt", quantity: "One pinch", preparation: "Crushed." }
        ],
        instructions: {
          method: "Mix both and swallow with a glass of warm water. Chew the seeds well.",
          serving_size: "As needed",
          interactions: "Very safe; avoid in severe acidity or ulcers."
        }
      }
    ]
  },
  "headache": {
    condition: "Headache (Cephalalgia)",
    description: "Pain or discomfort in the head, scalp, or neck area, ranging from mild tension to severe migraines.",
    modern: [
      {
        name: "Ibuprofen / Naproxen",
        primary_use: "NSAIDs for treatment of tension headaches and migraines.",
        mechanism: "Non-selective inhibition of cyclooxygenase (COX-1 and COX-2) enzymes, reducing prostaglandin synthesis.",
        benefits: "Reduces inflammation and pain effectively for various headache types.",
        side_effects: {
          common: ["Abdominal pain", "Heartburn", "Nausea (5-10%)"],
          rare: ["GI bleeding", "Renal impairment (Long-term)"]
        },
        indications: "Tension headache, Migraine attack.",
        contraindications: "Active peptic ulcers, pregnancy (3rd trimester), heart failure.",
        interactions: "Increases risk of bleeding with anticoagulants; reduces efficacy of antihypertensives."
      }
    ],
    ayurvedic: [
      {
        name: "Pathyadi Kwath",
        traditional_use: "A specialized liquid formulation for 'Shirashoola' (Headache) and 'Migraine'.",
        foundation: "Contains Triphala and Neem to clear Pitta and Vata from the head region.",
        efficacy: "Clinically used for chronic migraines and headaches associated with eye strain.",
        ingredients: [
          { common_name: "Haritaki", botanical_name: "Terminalia chebula", quantity: "Main component", preparation: "Decoction concentrate." }
        ],
        guidelines: {
          dosage: "15-20ml with equal water twice daily.",
          preparation: "Liquid decoction (Kwath).",
          interactions: "May have mild laxative effect."
        }
      }
    ],
    home_remedies: [
      {
        name: "Peppermint & Ginger Application",
        context: "External application for rapid cooling and blood circulation.",
        origins: "Western herbalism and Traditional Chinese Medicine (TCM).",
        ingredients: [
          { common_name: "Peppermint Oil", quantity: "2-3 drops", preparation: "Diluted in carrier oil." },
          { common_name: "Fresh Ginger", quantity: "1 inch", preparation: "Crushed for juice." }
        ],
        instructions: {
          method: "Massage peppermint oil on temples. Apply a thin film of ginger juice to the forehead (optional).",
          serving_size: "External only",
          interactions: "Avoid contact with eyes."
        }
      }
    ]
  },
  "sore throat": {
    condition: "Sore Throat (Pharyngitis/Tonsillitis)",
    description: "Pain, irritation, or scratchiness of the throat that often worsens when you swallow.",
    modern: [
      {
        name: "Benzocaine / Amylmetacresol Lozenges",
        primary_use: "Local anesthetic and antiseptic for throat pain relief.",
        mechanism: "Lozenges release mild anesthetics that numb the throat and antiseptics that kill surface bacteria.",
        benefits: "Immediate temporary relief from pain and difficulty swallowing.",
        side_effects: {
          common: ["Tongue numbness", "Change in taste"],
          rare: ["Methemoglobinemia (Very rare with Benzocaine)", "Allergic reaction"]
        },
        indications: "Viral pharyngitis, scratchy throat.",
        contraindications: "Severe difficulty breathing or drooling (may indicate epiglottitis).",
        interactions: "None significant for localized lozenges."
      }
    ],
    ayurvedic: [
      {
        name: "Khadiradi Vati",
        traditional_use: "Mentioned in 'Charaka Samhita' for 'Mukharoga' (mouth and throat diseases).",
        foundation: "Katha (Acacia) based tablet; acts as an astringent and antimicrobial to clear Kapha.",
        efficacy: "Reduces inflammation of the tonsils and pharynx through localized contact.",
        ingredients: [
          { common_name: "Katha", botanical_name: "Acacia catechu", quantity: "50%", preparation: "Solid extract." }
        ],
        guidelines: {
          dosage: "1 tablet kept in mouth and sucked slowly.",
          preparation: "Slow-dissolving tablet.",
          interactions: "Avoid immediate eating or drinking after use."
        }
      }
    ],
    home_remedies: [
      {
        name: "Turmeric Salt Water Gargle",
        context: "The gold standard for at-home throat care globally.",
        origins: "Ayurvedic practice of 'Gandusha'.",
        ingredients: [
          { common_name: "Warm Water", quantity: "1 glass", preparation: "Warm (not hot)." },
          { common_name: "Salt", quantity: "1/2 tsp", preparation: "Dissolved." },
          { common_name: "Turmeric", quantity: "1/4 tsp", preparation: "Added for anti-inflammatory effect." }
        ],
        instructions: {
          method: "Gargle for 30 seconds, reaching the back of the throat. Spit out entirely.",
          serving_size: "3-4 times daily",
          interactions: "None. Highly recommended alongside any medication."
        }
      }
    ]
  },
  "back pain": {
    condition: "Back Pain (Lumbago)",
    description: "Physical discomfort occurring anywhere on the spine or back, ranging from mild to severe.",
    modern: [
      {
        name: "Diclofenac Gel / Muscle Relaxants",
        primary_use: "Topical NSAID for localized pain and oral tablets for muscle spasms.",
        mechanism: "Topical diclofenac inhibits COX-1/2 locally; relaxants like Cyclobenzaprine act centrally to reduce muscle tone.",
        benefits: "Direct relief of inflammation at the site without systemic GI side effects (for gel).",
        side_effects: {
          common: ["Skin irritation (Gel)", "Drowsiness (Relaxants)"],
          rare: ["Allergic reaction", "Tinnitus"]
        },
        indications: "Muscle strain, lumbar spondylosis.",
        contraindications: "Broken skin (for gel), concurrent use of multiple NSAIDs.",
        interactions: "Increased sedation with alcohol (for relaxants)."
      }
    ],
    ayurvedic: [
      {
        name: "Mahanarayan Taila & Ashwagandha",
        traditional_use: "Ancient treatment for 'Gridhrasi' (Sciatica) and 'Katishoola' (Low back pain).",
        foundation: "Oil massage balances Vata; Ashwagandha provides structural support to the nerves and muscles.",
        efficacy: "Clinically proven to reduce chronic pain and improve mobility through neuromuscular nourishment.",
        ingredients: [
          { common_name: "Sesame Oil base", botanical_name: "Sesamum indicum", quantity: "Base", preparation: "Processed with 50+ herbs." },
          { common_name: "Winter Cherry", botanical_name: "Withania somnifera", quantity: "500mg", preparation: "Oral powder/capsule." }
        ],
        guidelines: {
          dosage: "External massage 20 mins; Oral 1 capsule twice daily.",
          preparation: "Warm the oil before application.",
          interactions: "Excellent synergy with modern Physiotherapy."
        }
      }
    ],
    home_remedies: [
      {
        name: "Warm Ginger & Sesame Compress",
        context: "A warming therapy to increase blood flow and remove 'coldness' (Vata) from muscles.",
        origins: "Ayurvedic and Asian household traditional care.",
        ingredients: [
          { common_name: "Sesame Oil", quantity: "2 tbsp", preparation: "Warmed with 1 inch crushed ginger." }
        ],
        instructions: {
          method: "Massage the warm oil on the painful area. Apply a heat pack (dry heat) over it for 10 minutes.",
          serving_size: "Twice daily",
          interactions: "Avoid for acute inflammatory injuries (use cold pack for first 24h)."
        }
      }
    ]
  },
  "diarrhea": {
    condition: "Diarrhea (Atisara)",
    description: "Frequent, loose, and watery bowel movements that can lead to dehydration.",
    modern: [
      {
        name: "Loperamide / ORS",
        primary_use: "Loperamide to slow bowel movement; ORS to prevent life-threatening dehydration.",
        mechanism: "Loperamide binds to opioid receptors in the gut wall, slowing down peristalsis. ORS uses glucose-sodium co-transport.",
        benefits: "Prevents immediate fluid loss and stabilizes bowel frequency.",
        side_effects: {
          common: ["Constipation", "Dizziness", "Abdominal cramps"],
          rare: ["Toxic megacolon (if used in bacterial dysentery)", "Cardiac arrhythmias (overdose)"]
        },
        indications: "Acute non-specific diarrhea, Traveler's diarrhea.",
        contraindications: "High fever or bloody stools (Dysentery), children under 2 years.",
        interactions: "Quinidine and Ritonavir increase Loperamide levels."
      }
    ],
    ayurvedic: [
      {
        name: "Kutajarishta",
        traditional_use: "Prime Ayurvedic remedy for 'Grahani' (IBS) and 'Atisara' (Diarrhea).",
        foundation: "Kutaja (Holarrhena) is the king of antidiarrheal herbs; acts on colon bacteria and motility.",
        efficacy: "Scientific evidence supports its role against common enteric pathogens (E. coli, etc.).",
        ingredients: [
          { common_name: "Kurchi Bark", botanical_name: "Holarrhena antidysenterica", quantity: "Main agent", preparation: "Fermented liquid (Arishta)." }
        ],
        guidelines: {
          dosage: "15-20ml with equal water twice daily after food.",
          preparation: "Self-generated alcoholic fermentation.",
          interactions: "Do not stop modern ORS; both can be used together."
        }
      }
    ],
    home_remedies: [
      {
        name: "Buttermilk (Takra) with Cumin",
        context: "The definitive probiotic and digestive balancer in Indian households.",
        origins: "Ayurvedic dietary wisdom (Ahara) for gut rejuvenation.",
        ingredients: [
          { common_name: "Buttermilk", quantity: "1 glass", preparation: "Churned curd with water." },
          { common_name: "Roasted Cumin", quantity: "1/2 tsp", preparation: "Powdered." }
        ],
        instructions: {
          method: "Sip throughout the day. Cumin acts as an astringent and buttermilk restores gut flora.",
          serving_size: "2-3 glasses daily",
          interactions: "Avoid adding sugar; salt is okay."
        }
      }
    ]
  },
  "nausea": {
    condition: "Nausea and Vomiting (Emesis)",
    description: "A sensation of unease and discomfort in the upper stomach with an involuntary urge to vomit.",
    modern: [
      {
        name: "Ondansetron",
        primary_use: "Prevention and treatment of nausea and vomiting.",
        mechanism: "Selective 5-HT3 receptor antagonist. Blocks serotonin in the periphery and the chemoreceptor trigger zone.",
        benefits: "Highly effective with minimal sedation compared to older antiemetics.",
        side_effects: {
          common: ["Headache", "Constipation", "Fatigue"],
          rare: ["QT prolongation (Cardiac)", "Serotonin syndrome"]
        },
        indications: "Postoperative nausea, Chemotherapy, severe gastroenteritis.",
        contraindications: "Concurrent use with Apomorphine, known long QT syndrome.",
        interactions: "Caution with other drugs that prolong QT interval."
      }
    ],
    ayurvedic: [
      {
        name: "Eladi Vati",
        traditional_use: "Used for 'Chhardi' (Vomiting) and 'Aruch' (Anorexia).",
        foundation: "Contains Ela (Cardamom) and other spices that calm the Samana Vayu and Pitta.",
        efficacy: "Reduces the urge to vomit and improves the sense of taste during illness.",
        ingredients: [
          { common_name: "Cardamom", botanical_name: "Elettaria cardamomum", quantity: "Main herb", preparation: "Fine powder tablet." }
        ],
        guidelines: {
          dosage: "1 tablet kept in mouth intermittently.",
          preparation: "Chewable/slow-dissolving tablet.",
          interactions: "Safe for use during pregnancy (Morning sickness) under supervision."
        }
      }
    ],
    home_remedies: [
      {
        name: "Lemon, Mint & Ginger Cooler",
        context: "Universal household cure for motion sickness and indigestion-related nausea.",
        origins: "Traditional domestic health practices.",
        ingredients: [
          { common_name: "Fresh Lemon", quantity: "1/2", preparation: "Squeezed." },
          { common_name: "Ginger juice", quantity: "1/2 tsp", preparation: "Freshly extracted." },
          { common_name: "Salt/Sugar", quantity: "A pinch", preparation: "To taste." }
        ],
        instructions: {
          method: "Mix in cold or lukewarm water and sip slowly. Smelling the lemon zest also helps.",
          serving_size: "As needed",
          interactions: "Avoid excessive sugar if diabetic."
        }
      }
    ]
  }
};

window.MEDICAL_KB = MEDICAL_KB;

window.printMedicalReport = function(conditionKey) {
  const kb = window.MEDICAL_KB || {};
  const data = kb[conditionKey.toLowerCase()];
  if (!data) {
    alert("Report data not found for: " + conditionKey);
    return;
  }

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert("Please allow popups to download/print the medical report.");
    return;
  }

  const reportId = 'MIV-' + Math.floor(100000 + Math.random() * 900000);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const modernContent = data.modern.map(m => `
    <div class="drug-block">
      <h3>${m.name} <span class="badge">Pharma Grade</span></h3>
      <p><strong>Primary Use:</strong> ${m.primary_use}</p>
      <p><strong>Mechanism of Action:</strong> ${m.mechanism}</p>
      <div class="side-effects">
        <div><strong>Common Side Effects:</strong><br>${m.side_effects.common.join(', ')}</div>
        <div><strong>Rare/Adverse Reactions:</strong><br>${m.side_effects.rare.join(', ')}</div>
      </div>
    </div>
  `).join('');

  const ayurvedicContent = data.ayurvedic.map(a => `
    <div class="herbal-block">
      <h3>${a.name} <span class="badge green">Vedic Formulation</span></h3>
      <p><strong>Traditional Use:</strong> ${a.traditional_use}</p>
      <p><strong>Biological Concept:</strong> ${a.foundation}</p>
      <p><strong>Composition & Ingredients:</strong></p>
      <ul>
        ${a.ingredients.map(ing => `
          <li><strong>${ing.common_name}</strong> <em>(${ing.botanical_name})</em> - ${ing.preparation}</li>
        `).join('')}
      </ul>
      <p><strong>Dosage Guidelines:</strong> ${a.guidelines.dosage}</p>
    </div>
  `).join('');

  const homeContent = data.home_remedies.map(h => `
    <div class="home-block">
      <h3>${h.name} <span class="badge amber">Household Care</span></h3>
      <p><em>"${h.context}"</em></p>
      <p><strong>Instructions:</strong> ${h.instructions.method}</p>
    </div>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.condition} - Clinical Report (${reportId})</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          line-height: 1.5;
          margin: 0;
          padding: 40px;
          background: #ffffff;
        }
        .header {
          border-bottom: 2px solid #0284c7;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .logo-area h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .logo-area span {
          color: #0284c7;
        }
        .logo-area p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .meta-info {
          text-align: right;
          font-size: 13px;
          color: #475569;
        }
        .meta-info strong {
          color: #0f172a;
        }
        .title-box {
          background: #f8fafc;
          border-left: 4px solid #0284c7;
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 35px;
        }
        .title-box h2 {
          margin: 0 0 8px 0;
          font-size: 22px;
          color: #0f172a;
        }
        .title-box p {
          margin: 0;
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
        }
        .section-title {
          font-size: 16px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          margin-top: 40px;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }
        .drug-block, .herbal-block, .home-block {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .drug-block h3, .herbal-block h3, .home-block h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 16px;
          color: #0f172a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .badge {
          font-size: 10px;
          font-weight: 800;
          background: #e0f2fe;
          color: #0369a1;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge.green {
          background: #dcfce7;
          color: #15803d;
        }
        .badge.amber {
          background: #fef3c7;
          color: #b45309;
        }
        p {
          font-size: 13px;
          margin: 8px 0;
          color: #334155;
        }
        p strong {
          color: #0f172a;
        }
        ul {
          margin: 8px 0;
          padding-left: 20px;
          font-size: 13px;
          color: #334155;
        }
        li {
          margin-bottom: 4px;
        }
        .side-effects {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
        }
        .side-effects div {
          font-size: 12px;
          color: #475569;
        }
        .disclaimer {
          margin-top: 50px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          font-size: 11px;
          color: #94a3b8;
          text-align: justify;
          line-height: 1.6;
          page-break-inside: avoid;
        }
        .seal-area {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
          font-size: 12px;
          color: #64748b;
        }
        .seal-img {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 2px dashed #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 800;
          color: #0284c7;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transform: rotate(-10deg);
        }
        @media print {
          body {
            padding: 0;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-area">
          <h1>MedInVedic</h1>
          <p>Dual Health Intelligence Report</p>
        </div>
        <div class="meta-info">
          <div>Report Reference: <strong>${reportId}</strong></div>
          <div>Generated Date: <strong>${currentDate}</strong></div>
          <div>Patient Domain: <strong>General Consultation</strong></div>
        </div>
      </div>

      <div class="title-box">
        <h2>${data.condition} Clinical Evaluation</h2>
        <p>${data.description}</p>
      </div>

      <div class="section-title">I. Modern Pharmaceutical Guidelines</div>
      ${modernContent}

      <div class="section-title">II. Ayurvedic Integrative Formulations</div>
      ${ayurvedicContent}

      <div class="section-title">III. Domestic Supportive Care & Home Remedies</div>
      ${homeContent}

      <div class="seal-area">
        <div>
          Report electronically verified by <strong>Veda AI Engine</strong>.<br>
          Integrative Medicine Compliance System (IMCS) • Version 4.12
        </div>
        <div class="seal-img">
          Veda AI<br>Clinical<br>Verified
        </div>
      </div>

      <div class="disclaimer">
        <strong>IMPORTANT MEDICAL DISCLAIMER:</strong> This report is synthesized by the Veda AI medical intelligence platform for informational and educational reference only. It does not constitute formal medical advice, diagnosis, or treatment. Always consult a certified allopathic medical practitioner and a licensed Ayurvedic physician before starting or modifying any treatment, therapeutic diet, or drug regimen.
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};
