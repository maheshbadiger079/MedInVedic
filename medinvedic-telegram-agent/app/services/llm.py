# -*- coding: utf-8 -*-
import os
import re
import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger("medinvedic.llm")

CLINICAL_KNOWLEDGE: Dict[str, Dict[str, Any]] = {
    "fever": {
        "keywords": ["fever", "pyrexia", "bukhar", "temperature", "chills", "paracetamol", "dolo", "crocin", "calpol"],
        "title": "🌡️ *Fever Management (Pyrexia / Jwara)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Paracetamol (Acetaminophen) 500mg – 650mg** (e.g. Dolo 650 / Crocin)\n"
            "  - *Dose:* 1 tablet every 4–6 hours as needed (Maximum 4000mg/24h).\n"
            "  - *Action:* Central COX-2 inhibition in hypothalamus for antipyresis and pain relief.\n"
            "  - *Contraindication:* Severe liver disease or chronic alcohol use."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Maha Sudarshan Churna / Vati:** 3–5g with warm water twice daily to clear *Ama* (toxins) and balance *Pitta-Kapha*.\n"
            "• **Giloy / Guduchi (Tinospora cordifolia):** 500mg tablet twice daily (proven immune modulator & antipyretic).\n"
            "• **Tribhuvan Kirti Rasa:** 1 tablet twice daily with ginger juice & honey for viral fevers."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Hydration:** Coconut water, warm water with electrolytes, and light moong dal khichdi.\n"
            "• **Sponging:** Lukewarm water forehead sponge (avoid ice water).\n"
            "• **Tulsi-Ginger Kadha:** 10 Tulsi leaves + 1 inch ginger boiled in 2 cups water reduced to 1 cup."
        ),
        "red_flags": "⚠️ *Red Flags:* Temperature > 103°F (39.4°C), stiff neck, breathing difficulty, or fever lasting > 3 days requires immediate medical care."
    },
    "cold_allergy": {
        "keywords": ["cold", "sardi", "jukaam", "runny nose", "sneezing", "congestion", "allergy", "rhinitis", "cetirizine", "allegra", "sinus"],
        "title": "🤧 *Common Cold & Allergic Rhinitis (Pratishyaya)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Cetirizine 10mg** or **Levocetirizine 5mg:** 1 tablet daily at bedtime for sneezing, watery eyes, and runny nose.\n"
            "• **Paracetamol 500mg:** If headache, sinus pain, or mild fever is present.\n"
            "• **Saline Nasal Spray:** 2 sprays in each nostril to moisturize and clear nasal passages."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Sitopaladi Churna:** 3g twice daily mixed with 1 tsp raw honey (relieves congestion and soothes upper respiratory mucosa).\n"
            "• **Anu Taila:** 2 drops in each nostril in the morning (*Nasya*) to clear sinus pathways.\n"
            "• **Talisadi Churna:** 2–3g with honey for associated throat tickle."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Steam Inhalation:** 5–10 mins with 2 drops Eucalyptus oil or Ajwain (carom seeds).\n"
            "• **Turmeric Golden Milk (Haldi Doodh):** 1/2 tsp pure turmeric in warm milk at night.\n"
            "• **Tulsi Ginger Honey Tea:** 2–3 times daily for soothing warmth."
        ),
        "red_flags": "⚠️ *Red Flags:* Wheezing, shortness of breath, severe sinus pain with purulent discharge, or symptoms > 10 days."
    },
    "cough": {
        "keywords": ["cough", "khasi", "tussis", "dry cough", "wet cough", "phlegm", "koflet", "honitus", "benadryl", "ambroxol", "dextromethorphan"],
        "title": "🫁 *Cough Relief Guidance (Dry & Productive / Kasa)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **For Dry Cough:** Dextromethorphan syrup 10–20mg (antitussive) or Levocetirizine for allergic cough.\n"
            "• **For Wet / Productive Cough:** Ambroxol 30mg or Guaifenesin syrup (mucolytic & expectorant to thin phlegm)."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Kantakari Avaleha / Vasavaleha:** 5g twice daily (classical bronchodilator & expectorant containing *Adhatoda vasica*).\n"
            "• **Sitopaladi Churna:** 3–5g with honey 3 times daily.\n"
            "• **Yashtimadhu (Licorice / Mulethi):** Chew small root piece or take 3g powder with honey."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Honey + Ginger Juice + Crushed Black Pepper:** 1 tsp slowly licked 3 times a day.\n"
            "• **Warm Salt Water Gargles:** 1/2 tsp rock salt in warm water 3 times daily.\n"
            "• **Warm Water Hydration:** Sip lukewarm water throughout the day."
        ),
        "red_flags": "⚠️ *Red Flags:* Blood in sputum, persistent cough > 2 weeks, high fever, or significant weight loss."
    },
    "headache": {
        "keywords": ["headache", "sar dard", "head ache", "migraine", "cephalalgia", "tension headache", "cluster headache"],
        "title": "💆 *Headache & Migraine Relief (Shirashoola)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Paracetamol 650mg** or **Ibuprofen 400mg:** Take with food for tension headaches or mild migraine.\n"
            "• **Naproxen 250mg** or **Sumatriptan 50mg (Rx only):** For diagnosed acute migraine attacks."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Shirashooladi Vajra Rasa:** 1 tablet twice daily with warm water.\n"
            "• **Brahmi Vati / Shankhpushpi:** 250mg for tension and mental fatigue.\n"
            "• **Ksheerabala Taila / Peppermint Oil:** Gentle temple and forehead massage."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Rest in Dark, Quiet Room:** 20–30 mins away from phone/computer screens.\n"
            "• **Fresh Ginger Tea:** Inhibits prostaglandin synthesis naturally.\n"
            "• **Cold / Warm Compress:** Cold pack on forehead, warm compress on back of neck."
        ),
        "red_flags": "⚠️ *Red Flags:* Sudden explosive 'thunderclap' headache, headache with blurred vision, numbness, or neck stiffness (Emergency 112)."
    },
    "stomach_acidity": {
        "keywords": ["stomach pain", "acidity", "gas", "pet dard", "gastritis", "gerd", "heartburn", "indigestion", "bloating", "pantoprazole", "omeprazole", "digene", "gelusil", "eno"],
        "title": "🥣 *Acidity, Gas & Stomach Discomfort (Amlapitta & Agnimandya)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Pantoprazole 40mg** or **Omeprazole 20mg:** 1 tablet once daily 30 minutes before breakfast (PPI acid reducer).\n"
            "• **Antacid Liquid (Magaldrate + Simethicone):** 10ml after meals for instant acid and gas relief.\n"
            "• **Dicyclomine 10–20mg:** For acute abdominal cramping spasms."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Avipattikar Churna:** 3–5g with cool water before meals (prime Pitta-reducing formula for hyperacidity).\n"
            "• **Hingwashtak Churna:** 1–2g mixed with the first bite of warm rice & ghee for gas and bloating.\n"
            "• **Kamadudha Rasa / Shankha Bhasma:** 250mg for burning sensation in chest and stomach."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **CCF (Cumin, Coriander, Fennel / Jeera-Dhaniya-Saunf) Tea:** Boil 1 tsp of each in water and sip warm.\n"
            "• **Fresh Takra (Buttermilk):** With roasted cumin and mint leaves post lunch.\n"
            "• **Cold Milk (1/2 cup):** Provides immediate buffer against acid irritation."
        ),
        "red_flags": "⚠️ *Red Flags:* Severe sharp pain in lower right abdomen (possible appendicitis), black tarry stools, or persistent vomiting."
    },
    "diabetes": {
        "keywords": ["diabetes", "sugar", "blood sugar", "glucose", "metformin", "hba1c", "madhumeha", "diabetic"],
        "title": "🩸 *Type 2 Diabetes & Blood Sugar Care (Madhumeha)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Metformin 500mg – 1000mg:** First-line biguanide taken with meals to reduce hepatic glucose output and improve insulin sensitivity.\n"
            "• **Regular Monitoring:** Fasting Blood Sugar (target 80–130 mg/dL) and HbA1c every 3 months (< 7.0%)."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Nisha-Amalaki (Curcuma longa + Emblica officinalis):** 2g twice daily with warm water (protects microvasculature & balances Kapha).\n"
            "• **Karela & Jamun Seed Churna:** 3g before meals for natural insulin-mimetic polypeptide-p action.\n"
            "• **Gymnema sylvestre (Gudmar / Sugar Destroyer):** 500mg extract before meals."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Fenugreek (Methi) Water:** 2 tsp seeds soaked overnight, drink water and chew seeds in morning.\n"
            "• **Daily Exercise:** 30–45 minutes of brisk walking or yoga.\n"
            "• **Dietary Balance:** Low glycemic index foods, high fiber, eliminate refined sugar and sodas."
        ),
        "red_flags": "⚠️ *Red Flags:* Blood sugar < 70 mg/dL (hypoglycemia with sweating/shaking - take sugar immediately), or sugar > 350 mg/dL with confusion."
    },
    "hypertension": {
        "keywords": ["blood pressure", "high bp", "hypertension", "bp", "amlodipine", "telmisartan", "raktachapa"],
        "title": "💓 *Hypertension & Blood Pressure Care (Raktachapa)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Amlodipine 5mg** or **Telmisartan 40mg:** Standard once-daily antihypertensive medication taken consistently at the same time.\n"
            "• **Target BP:** Below 130/80 mmHg for optimal cardiovascular and renal protection."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Arjuna Bark (Terminalia arjuna) Ksheerapaka:** 3–5g boiled in milk/water for cardiac muscle tonification and arterial health.\n"
            "• **Sarpagandha Vati (Rauwolfia):** 250mg under clinical supervision (natural source of reserpine for vascular relaxation).\n"
            "• **Mukta Vati:** 1–2 tablets daily for stress-induced hypertension."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Crushed Raw Garlic (Lashuna):** 1–2 cloves in morning (releases allicin to support nitric oxide vasodilation).\n"
            "• **Low-Sodium DASH Diet:** Salt intake strictly under 1 teaspoon (< 5g salt / 2g sodium) daily.\n"
            "• **Anulom-Vilom Pranayama:** 15 minutes daily slow deep rhythmic breathing."
        ),
        "red_flags": "⚠️ *Red Flags:* BP > 180/120 mmHg accompanied by chest pain, shortness of breath, or sudden severe headache is a medical emergency (Dial 112)."
    },
    "diarrhea": {
        "keywords": ["diarrhea", "loose motion", "dast", "motions", "loose stools", "ors", "electral", "loperamide", "atisara", "food poisoning"],
        "title": "💧 *Diarrhea & Loose Motions Care (Atisara)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **WHO Oral Rehydration Salts (ORS):** Dissolve 1 whole sachet in 1 Liter clean drinking water. Drink sip by sip after every loose stool.\n"
            "• **Zinc Supplementation:** 20mg daily for 14 days to regenerate gut mucosa.\n"
            "• **Probiotics:** Bacillus clausii or Saccharomyces boulardii to restore gut microbiota."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Kutajarishta / Kutaj Ghanavati:** 15–20ml with equal water (*Holarrhena antidysenterica* — classical intestinal astringent).\n"
            "• **Bilwadi Churna (Bael fruit):** 3g twice daily with fresh buttermilk."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **BRAT Diet:** Bananas, Rice gruel (Kanji), Applesauce, Toast/Curd.\n"
            "• **Pomegranate Juice:** Astringent and soothing for gut lining.\n"
            "• **Avoid:** Greasy/fried foods, caffeine, dairy milk, and raw salads until recovery."
        ),
        "red_flags": "⚠️ *Red Flags:* Stools containing blood or mucus, high fever, sunken eyes, no urine for > 8 hours (Severe dehydration)."
    },
    "sore_throat": {
        "keywords": ["sore throat", "gala dard", "tonsils", "tonsillitis", "pharyngitis", "throat pain", "strep", "gargle", "lozenge"],
        "title": "🧣 *Sore Throat & Tonsillitis Care (Kantha Roga)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Paracetamol 500mg** or **Ibuprofen 400mg:** For throat pain and inflammation reduction.\n"
            "• **Chlorhexidine / Povidone-Iodine 1% Gargles:** Gargle for 30 seconds 3 times daily.\n"
            "• **Benzydamine or Amylmetacresol Lozenges:** For local throat numbing."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Yashtimadhu (Licorice / Mulethi):** 3g powder with warm honey or chew raw root stick.\n"
            "• **Khadiradi Vati:** 1–2 tablets to suck slowly in the mouth.\n"
            "• **Triphala Kashaya Gargling:** 1 tsp Triphala boiled in water, used for warm gargles."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Warm Salt Water Gargle:** 1/2 tsp rock salt in warm water every 3–4 hours.\n"
            "• **Turmeric & Honey Warm Water:** 1/2 tsp turmeric + 1 tsp honey in lukewarm water.\n"
            "• **Clove & Cardamom Infusion:** Chew 1 clove slowly."
        ),
        "red_flags": "⚠️ *Red Flags:* Difficulty breathing, inability to swallow saliva, or asymmetric tonsil swelling."
    },
    "back_joint_pain": {
        "keywords": ["back pain", "joint pain", "knee pain", "kamar dard", "gathiya", "arthritis", "lumbago", "sandhivata", "sciatica", "neck pain"],
        "title": "🦴 *Back & Joint Pain Care (Sandhivata & Katishoola)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Paracetamol 650mg** or **Diclofenac Gel (Topical):** Apply gently 3–4 times daily without vigorous rubbing.\n"
            "• **Aceclofenac 100mg + Paracetamol 325mg (Rx with food):** For acute inflammatory joint flares.\n"
            "• **Calcium + Vitamin D3 (60,000 IU weekly):** To support bone and joint density."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Yograj Guggulu / Maha Yograj Guggulu:** 2 tablets twice daily with warm water after meals.\n"
            "• **Shallaki (Boswellia serrata 500mg):** Natural COX-2 and 5-LOX inhibitor for joint cartilage preservation.\n"
            "• **Mahanarayan Taila / Dhanwantharam Taila:** Warm oil massage (*Abhyanga*) followed by warm fermentation."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Warm / Ice Fermentation:** Cold pack for acute strain (first 48h), warm moist heat for chronic stiffness.\n"
            "• **Turmeric & Dry Ginger (Sunthi) Golden Milk:** Before bedtime.\n"
            "• **Gentle Lumbar & Hamstring Stretches:** Regular core posture exercises."
        ),
        "red_flags": "⚠️ *Red Flags:* Back pain with numbness/weakness radiating down both legs, or loss of bladder/bowel control (Emergency 112)."
    },
    "skin_allergy": {
        "keywords": ["skin allergy", "itching", "rash", "khujli", "urticaria", "hives", "eczema", "calamine", "dermatitis"],
        "title": "🧴 *Skin Allergy, Itching & Rash Care (Kushta & Udarda)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Cetirizine 10mg** or **Fexofenadine 120mg:** 1 tablet once daily for allergic urticaria and itching.\n"
            "• **Calamine Lotion:** Apply topically 2–3 times daily for soothing cooling action.\n"
            "• **Hydrocortisone 1% Cream:** For localized non-infectious eczema patches (short term)."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Neem Ghanavati:** 500mg twice daily (premier blood purifier & antimicrobial *Tikta* herb).\n"
            "• **Khadirarishta:** 15ml with equal quantity warm water after meals.\n"
            "• **Mahatiktaka Ghrita or Gandhaka Rasayana:** For chronic dry skin allergies."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Neem Water Bath:** Boil fresh neem leaves in bath water, cool to lukewarm.\n"
            "• **Virgin Cold-Pressed Coconut Oil:** Apply on damp skin for hydration barrier.\n"
            "• **Fresh Aloe Vera Gel:** Direct soothing application on irritated skin."
        ),
        "red_flags": "⚠️ *Red Flags:* Swelling of lips, face, or tongue, difficulty breathing (Anaphylaxis - Dial 112 immediately)."
    },
    "stress_insomnia": {
        "keywords": ["insomnia", "sleep", "neend", "stress", "tanaav", "anxiety", "ashwagandha", "depression", "restless"],
        "title": "🌙 *Sleep, Stress & Anxiety Support (Anidra & Manas Roga)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Melatonin 3mg – 5mg:** Take 30–60 minutes before bedtime to reset circadian sleep architecture.\n"
            "• **Sleep Hygiene Protocol:** No screens/blue light 1h before bed; maintain dark, cool (18–20°C) bedroom."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Ashwagandha KSM-66 (500mg):** Standardized root extract taken with warm milk evening (lowers cortisol by ~30%).\n"
            "• **Brahmi Vati & Shankhpushpi Syrup:** Prime *Medhya Rasayana* for cognitive calmness and calming overactive thoughts.\n"
            "• **Tagara (Valeriana wallichii 250mg):** Natural herbal sedative for deep restorative sleep."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Nutmeg (Jaiphal) Milk:** Warm milk with a pinch of grated nutmeg and cardamom.\n"
            "• **Pada Abhyanga (Foot Massage):** Massage soles with warm sesame or Brahmi oil before sleeping.\n"
            "• **4-7-8 Breathing Technique:** Inhale 4s, hold 7s, exhale 8s."
        ),
        "red_flags": "⚠️ *Red Flags:* Severe persistent panic attacks, depressive thoughts, or self-harm ideation (Call National Helpline 14416 / 112)."
    },
    "constipation": {
        "keywords": ["constipation", "kabz", "pet saaf", "hard stool", "triphala", "isabgol", "lactulose", "cremaffin"],
        "title": "🌾 *Constipation & Gut Regularity (Vibhandha)*",
        "allopathic": (
            "💊 **Allopathic Pharmacology (CDSCO / WHO Tier 1):**\n"
            "• **Psyllium / Ispaghula Husk (Isabgol):** 1–2 tablespoons mixed in a full glass of warm water at bedtime.\n"
            "• **Lactulose Syrup 15–30ml:** Gentle osmotic stool softener that draws water into the colon.\n"
            "• **Adequate Water:** Essential 2.5–3 Liters daily."
        ),
        "ayurvedic": (
            "🌿 **Ayurvedic & Herbal Formulations (AYUSH Tier 3):**\n"
            "• **Triphala Churna (Haritaki + Bibhitaki + Amalaki):** 3–5g with warm water at bedtime (rebalances colon tone without creating dependence).\n"
            "• **Gandharva Haritaki:** 3g with warm water for moderate constipation.\n"
            "• **Castor Oil (Eranda Taila):** 1 tsp with warm milk for occasional acute relief."
        ),
        "home_care": (
            "🏠 **Supportive Home Care:**\n"
            "• **Soaked Munakka (Black Raisins):** 6–8 soaked overnight in water, consumed in morning.\n"
            "• **Ripe Papaya & Flaxseeds:** 1 bowl papaya daily + 1 tsp ground flaxseeds.\n"
            "• **Warm Water Morning Routine:** 2 glasses of lukewarm water right after waking up."
        ),
        "red_flags": "⚠️ *Red Flags:* Severe abdominal distension with vomiting, inability to pass gas, or blood in stool."
    }
}

class LLMProvider:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.DEFAULT_LLM_MODEL
        self._client = None
        if self.api_key and self.api_key.strip() and self.api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel(self.model_name)
                logger.info(f"Gemini LLM initialized successfully with model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")

    async def generate_response(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if self._client:
            try:
                full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                res = self._client.generate_content(full_prompt)
                if res and res.text:
                    return res.text.strip()
            except Exception as e:
                logger.error(f"Gemini API generation error: {e}")

        return self.clinical_reasoning_fallback(prompt)

    def clinical_reasoning_fallback(self, query: str) -> str:
        low = query.lower()
        
        # 1. Match against extensive clinical database
        for key, item in CLINICAL_KNOWLEDGE.items():
            if any(k in low for k in item["keywords"]):
                return (
                    f"{item['title']}\n\n"
                    f"{item['allopathic']}\n\n"
                    f"{item['ayurvedic']}\n\n"
                    f"{item['home_care']}\n\n"
                    f"{item['red_flags']}"
                )
        
        # 2. Specific single herb / medicine lookups
        if "ashwagandha" in low:
            return (
                "🌿 *Ashwagandha (Withania somnifera / Indian Ginseng)*\n\n"
                "• **Ayurvedic Classification:** Premier *Rasayana* (Rejuvenator), *Balya* (Strength Enhancer) & *Vata-Kapha Hara* (AYUSH Tier 3).\n"
                "• **Clinical Actions:** Cortisol regulation (lowers stress hormones by ~28%), promotes restorative sleep, enhances stamina and cognitive clarity.\n"
                "• **Dosage:** Standardized root extract (KSM-66 / Sensoril) 300–600mg daily or root powder 3–5g with warm milk.\n"
                "• **Contraindications:** Avoid in pregnancy and hyperthyroidism."
            )
        elif "triphala" in low:
            return (
                "🌿 *Triphala Churna (Amalaki + Bibhitaki + Haritaki)*\n\n"
                "• **Ayurvedic Classification:** Tridoshic Balancer (*Sama Dosha*), *Anulomana* (Gentle bowel regulator) (AYUSH Tier 3).\n"
                "• **Clinical Actions:** Mild colon cleanser, gut detoxifier, rich in Vitamin C & bioflavonoids for eye and metabolic health.\n"
                "• **Dosage:** 3–5g with warm water before sleep."
            )
        elif "giloy" in low or "guduchi" in low:
            return (
                "🌿 *Giloy / Guduchi (Tinospora cordifolia)*\n\n"
                "• **Ayurvedic Classification:** *Amrita* (Immunity elixir), *Jwarahara* (Antipyretic) & *Deepana* (AYUSH Tier 3).\n"
                "• **Clinical Actions:** Immunomodulator, platelet stabilizer in viral fevers, hepatic protector.\n"
                "• **Dosage:** 500mg Ghanavati tablet twice daily after meals."
            )
        elif "tulsi" in low or "holy basil" in low:
            return (
                "🌿 *Tulsi / Holy Basil (Ocimum sanctum)*\n\n"
                "• **Ayurvedic Classification:** *Kapha-Vata Shamaka*, *Krimighna* (Antimicrobial) & *Shvasahara* (Respiratory tonic).\n"
                "• **Clinical Actions:** Relieves chest congestion, soothes cough reflex, reduces systemic oxidative stress.\n"
                "• **Usage:** Fresh juice 5–10ml with honey or herbal tea infusion 2–3 times daily."
            )
        elif "neem" in low:
            return (
                "🌿 *Neem (Azadirachta indica)*\n\n"
                "• **Ayurvedic Classification:** *Tikta-Kashaya*, *Kushtaghna* (Skin healer) & *Raktashodhaka* (Blood purifier).\n"
                "• **Clinical Actions:** Potent antibacterial, antifungal, and anti-inflammatory properties for skin disorders.\n"
                "• **Usage:** External leaf wash or 500mg Ghanavati under medical guidance."
            )
        elif "paracetamol" in low or "dolo" in low or "crocin" in low:
            return (
                "💊 *Paracetamol (Acetaminophen 500mg / 650mg)*\n\n"
                "• **Classification:** Non-opioid Analgesic & Antipyretic (CDSCO / WHO Tier 1).\n"
                "• **Indications:** Fever reduction and mild-to-moderate pain (headache, body ache, toothache).\n"
                "• **Dosage:** 500–650mg every 4–6 hours as needed (Maximum 4000mg/24h).\n"
                "• **Safety:** Do not combine with alcohol or other paracetamol-containing products."
            )
        elif "cetirizine" in low or "allegra" in low:
            return (
                "💊 *Cetirizine Hydrochloride (10mg)*\n\n"
                "• **Classification:** 2nd Generation Selective H1-Antihistamine (CDSCO / WHO Tier 1).\n"
                "• **Indications:** Allergic rhinitis, sneezing, runny nose, watery eyes, and urticaria/itching.\n"
                "• **Dosage:** 1 tablet (10mg) once daily at bedtime (may cause mild drowsiness)."
            )
        elif "metformin" in low:
            return (
                "💊 *Metformin Hydrochloride (500mg / 850mg / 1000mg)*\n\n"
                "• **Classification:** Oral Biguanide Hypoglycemic Agent (WHO / CDSCO Tier 1).\n"
                "• **Mechanism:** Reduces hepatic glucose production and enhances insulin sensitivity in peripheral tissues.\n"
                "• **Dosage:** Take with or right after meals to minimize gastrointestinal discomfort."
            )
        elif "pantoprazole" in low or "omeprazole" in low:
            return (
                "💊 *Pantoprazole (40mg) / Omeprazole (20mg)*\n\n"
                "• **Classification:** Proton Pump Inhibitor (PPI) (CDSCO / WHO Tier 1).\n"
                "• **Indications:** Gastroesophageal reflux disease (GERD), acid peptic disease, gastritis.\n"
                "• **Administration:** Take 1 tablet once daily in the morning 30 minutes before breakfast."
            )

        # 3. Default Grounded Clinical Guidance
        return (
            "🌿 **MedInVedic Dual-System Clinical Guidance**\n\n"
            "For your health query, we recommend a balanced integrative approach:\n\n"
            "💊 **Modern Pharmacology (CDSCO / WHO):**\n"
            "• Consult standard clinical protocols for precise symptomatic diagnosis and first-line therapy.\n\n"
            "🌿 **Ayurvedic Care (AYUSH):**\n"
            "• Maintain balanced *Dinacharya* (daily routine), consume warm light foods, and use dosha-balancing supportive herbs.\n\n"
            "🏠 **Supportive Care:**\n"
            "• Stay adequately hydrated, get 7–8 hours of restorative sleep, and avoid cold/processed food.\n\n"
            "💡 *Tip: You can ask specific symptoms like 'Fever', 'Cold', 'Headache', 'Stomach Pain', 'Diabetes', or medicine names like 'Paracetamol', 'Ashwagandha', 'Cetirizine'!*"
        )

llm_service = LLMProvider()
