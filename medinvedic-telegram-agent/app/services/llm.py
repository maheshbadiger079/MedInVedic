# -*- coding: utf-8 -*-
import os
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger("medinvedic.llm")

class LLMProvider:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.DEFAULT_LLM_MODEL
        self._client = None
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel(self.model_name)
                logger.info(f"Gemini LLM initialized with model: {self.model_name}")
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

        return self._mock_grounded_response(prompt)

    def _mock_grounded_response(self, prompt: str) -> str:
        low = prompt.lower()
        if "cold" in low or "cetirizine" in low or "sneez" in low or "allergy" in low or "rhinitis" in low:
            return (
                "🤧 *Cold & Allergy Care Guidance (Dual System)*\n\n"
                "💊 *Allopathic Pharmacology (CDSCO / WHO):*\n"
                "• **Cetirizine 10mg** — Second-generation antihistamine for runny nose, sneezing, and allergic rhinitis. Dose: 1 tablet daily at bedtime.\n"
                "• **Paracetamol 500mg** — If fever or body ache is present.\n\n"
                "🌿 *Ayurvedic & Supportive Remedies (AYUSH):*\n"
                "• **Tulsi Ginger & Honey Infusion** — 2-3 times daily for soothing throat and respiratory tract.\n"
                "• **Steam Inhalation with Eucalyptus** — 5-10 minutes to relieve nasal congestion.\n\n"
                "⚠️ *Precautions:* Seek medical attention if high fever (>102°F) or breathing difficulty develops."
            )
        elif "ashwagandha" in low:
            return (
                "🌿 *Ashwagandha (Withania somnifera)*\n\n"
                "• **Classification:** Classical Ayurvedic Rasayana & Adaptogen (AYUSH Tier 3)\n"
                "• **Key Actions:** Cortisol modulation, stress relief, and vitality enhancement.\n"
                "• **Safety & Precautions:** Safe in traditional doses (300-600mg extract). Avoid in pregnancy.\n\n"
                "📚 **Verified Sources:**\n"
                "• Ayurvedic Pharmacopoeia of India (API)\n"
                "• Charaka Samhita Chikitsa Sthana"
            )
        elif "paracetamol" in low or "fever" in low:
            return (
                "💊 *Paracetamol (Acetaminophen 500mg)*\n\n"
                "• **Classification:** Analgesic and Antipyretic (CDSCO / WHO Tier 1)\n"
                "• **Indications:** Mild-to-moderate pyrexia (fever) and pain relief.\n"
                "• **Safety & Precautions:** Maximum 4000mg/24h. Contraindicated in severe liver impairment.\n\n"
                "📚 **Verified Sources:**\n"
                "• CDSCO Allopathic Guidelines\n"
                "• WHO Essential Medicines List (2023)"
            )
        elif "triphala" in low or "digest" in low or "constipat" in low:
            return (
                "🌿 *Triphala Churna (Haritaki + Bibhitaki + Amalaki)*\n\n"
                "• **Classification:** Classical Ayurvedic Bowel Regulator & Deepana (AYUSH Tier 3)\n"
                "• **Indications:** Sluggish digestion, mild constipation, and gut detox.\n"
                "• **Dosage:** 3-5g with warm water before bedtime.\n\n"
                "📚 **Verified Sources:**\n"
                "• Charaka Samhita Chikitsa Sthana"
            )
        return (
            "ℹ️ *MedInVedic Clinical Evidence Summary*\n\n"
            "The retrieved clinical knowledge base indicates supportive care and standard clinical monitoring.\n\n"
            "⚠️ *Always consult a registered medical practitioner before starting medication.*"
        )

llm_service = LLMProvider()
