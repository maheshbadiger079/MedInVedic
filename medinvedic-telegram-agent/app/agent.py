# -*- coding: utf-8 -*-
import logging
from typing import Dict, Any
from app.safety import safety_classifier, SafetyLevel
from app.services.language import detect_language
from app.services.llm import llm_service
from app.prompts.system_prompt import MEDINVEDIC_SYSTEM_PROMPT
from app.prompts.rag_prompt import RAG_SYNTHESIS_PROMPT_TEMPLATE
from app.tools.rag_search import rag_search_tool
from app.tools.products import product_tool
from app.tools.doctor import doctor_tool
from app.memory import memory_manager

logger = logging.getLogger("medinvedic.agent")

class MedInVedicAIAgent:
    def __init__(self):
        self.safety = safety_classifier
        self.llm = llm_service
        self.rag_search = rag_search_tool
        self.product_tool = product_tool
        self.doctor_tool = doctor_tool
        self.memory = memory_manager

    async def process_user_message(self, user_id: str, text: str) -> Dict[str, Any]:
        user_mem = self.memory.get_user_memory(str(user_id))
        user_lang = user_mem.get("language") or detect_language(text)

        # 1. Clinical Safety Classification (112 Emergency Guardrails)
        safety_level, safety_msg = self.safety.classify(text)
        if safety_level in [SafetyLevel.URGENT, SafetyLevel.HIGH_RISK]:
            return {
                "response": safety_msg,
                "safety_level": safety_level.value,
                "sources": ["National Emergency Medical Services (112 / 108)"],
                "language": user_lang
            }

        # 2. Product Search Intent Detection
        low = text.lower()
        if any(w in low for w in ["buy ", "product", "price", "shop", "order medicine", "store", "catalog"]):
            p_res = self.product_tool.execute(text)
            if p_res.get("found_count", 0) > 0:
                p_text = "🛍️ **MedInVedic Verified Products Found:**\n\n"
                for p in p_res["products"]:
                    p_text += f"• **{p['name']}** — ₹{p['price']}\n  *{p['description']}*\n  🔗 [Order on MedInVedic]({p.get('url', 'https://medinvedic.web.app')})\n\n"
                return {
                    "response": p_text.strip(),
                    "safety_level": SafetyLevel.SAFE.value,
                    "sources": ["MedInVedic Product Catalog (Live Firestore)"],
                    "language": user_lang
                }

        # 3. Doctor Consultation Intent Detection
        if text.startswith("/doctor") or "book doctor" in low or "consult doctor" in low or "appointment" in low:
            doc_res = self.doctor_tool.execute(user_id=str(user_id), symptoms=text)
            return {
                "response": f"👨‍⚕️ **Doctor Consultation Request Created**\n\n{doc_res['message']}\n\n📋 Status: `{doc_res['status']}`\n🔗 [View Doctor Dashboard](https://medinvedic.web.app)",
                "safety_level": SafetyLevel.SAFE.value,
                "sources": ["MedInVedic Clinical Practitioner Registry (AYUSH / CDSCO)"],
                "language": user_lang
            }

        # 4. RAG Clinical Knowledge Retrieval
        rag_res = self.rag_search.execute(text)
        context_envelope = rag_res.get("context_envelope", "")
        citations = rag_res.get("citations", [])

        # 5. LLM Synthesis with Grounded Context and Original Query
        prompt = RAG_SYNTHESIS_PROMPT_TEMPLATE.format(
            query=text,
            language=user_lang,
            context_envelope=context_envelope or "No direct clinical document found."
        )

        llm_response = await self.llm.generate_response(
            prompt,
            system_instruction=MEDINVEDIC_SYSTEM_PROMPT,
            user_query=text
        )

        # Set clean relevant sources
        if any(w in low for w in ["founder", "creator", "who made", "owner", "about medinvedic", "what is medinvedic"]):
            sources = ["MedInVedic Official Portal (medinvedic.web.app)"]
        else:
            sources = citations[:2] if citations else ["CDSCO Allopathic Guidelines", "Ayurvedic Pharmacopoeia of India (AYUSH)"]

        return {
            "response": llm_response,
            "safety_level": safety_level.value,
            "confidence": rag_res.get("confidence", 0.95),
            "sources": sources,
            "language": user_lang
        }

medinvedic_agent = MedInVedicAIAgent()
