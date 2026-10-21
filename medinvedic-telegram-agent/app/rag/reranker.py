from typing import List, Dict, Any, Tuple
from app.config import settings

class Reranker:
    def __init__(self):
        self.high_thresh = settings.CONFIDENCE_THRESHOLD_HIGH
        self.med_thresh = settings.CONFIDENCE_THRESHOLD_MEDIUM

    def rerank_and_score(self, query: str, docs: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], str]:
        if not docs:
            return [], "LOW"

        q_terms = set(query.lower().split())
        scored = []
        for d in docs:
            content = d.get("content", "").lower()
            keyword_overlap = sum(1 for term in q_terms if term in content) / max(1, len(q_terms))
            scored.append({"doc": d, "score": keyword_overlap})

        scored.sort(key=lambda x: x["score"], reverse=True)
        top_docs = [s["doc"] for s in scored]
        top_score = scored[0]["score"] if scored else 0

        confidence = "HIGH" if top_score >= 0.5 else ("MEDIUM" if top_score >= 0.2 else "LOW")
        return top_docs, confidence

reranker = Reranker()
