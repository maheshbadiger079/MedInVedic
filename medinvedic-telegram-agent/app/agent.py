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

        # 1. Clinical Safety Classification
        safety_level, safety_msg = self.safety.classify(text)
        if safety_level in [SafetyLevel.URGENT, SafetyLevel.HIGH_RISK]:
            return {
                "response": safety_msg,
                "safety_level": safety_level.value,
                "sources": [],
                "language": user_lang
            }

        # 2. Product Search Intent Detection
        if any(w in text.lower() for w in ["buy", "product", "price", "shop", "order", "sell", "store", "catalog"]):
            p_res = self.product_tool.execute(text)
            if p_res["found_count"] > 0:
                p_text = "ðŸ›ï¸ **MedInVedic Verified Products Found:**\n\n"
                for p in p_res["products"]:
                    p_text += f"â€¢ **{p['name']}** â€” â‚¹{p['price']}\n  *{p['description']}*\n  ðŸ”— [View on MedInVedic]({p.get('url', 'https://medinvedic.web.app')})\n\n"
                return {
                    "response": p_text,
                    "safety_level": SafetyLevel.SAFE.value,
                    "sources": ["MedInVedic Product Catalog (Live Firestore)"],
                    "language": user_lang
                }

        # 3. Doctor Consultation Intent Detection
        if text.startswith("/doctor") or "book doctor" in text.lower():
            doc_res = self.doctor_tool.execute(user_id=str(user_id), symptoms=text)
            return {
                "response": f"ðŸ‘¨â€âš•ï¸ **Doctor Consultation Request Created**\n\n{doc_res['message']}\n\nStatus: `{doc_res['status']}`",
                "safety_level": SafetyLevel.SAFE.value,
                "sources": ["MedInVedic Clinical Practitioner Registry"],
                "language": user_lang
            }

        # 4. RAG Clinical Knowledge Retrieval
        rag_res = self.rag_search.execute(text)
        context_envelope = rag_res["context_envelope"]
        citations = rag_res["citations"]

        # 5. LLM Synthesis
        prompt = RAG_SYNTHESIS_PROMPT_TEMPLATE.format(
            query=text,
            language=user_lang,
            context_envelope=context_envelope or "No direct clinical document found."
        )

        llm_response = await self.llm.generate_response(prompt, system_instruction=MEDINVEDIC_SYSTEM_PROMPT)

        return {
            "response": llm_response,
            "safety_level": safety_level.value,
            "confidence": rag_res["confidence"],
            "sources": citations,
            "language": user_lang
        }

medinvedic_agent = MedInVedicAIAgent()
