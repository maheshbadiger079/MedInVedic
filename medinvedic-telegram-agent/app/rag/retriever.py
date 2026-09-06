from typing import List, Dict, Any, Tuple, Optional
from app.rag.embeddings import embedding_provider
from app.rag.vector_store import vector_store
from app.rag.reranker import reranker

class HybridRetriever:
    def __init__(self):
        self.vector_store = vector_store
        self.embeddings = embedding_provider
        self.reranker = reranker

    def retrieve(self, query: str, category: Optional[str] = None, top_k: int = 4) -> Tuple[List[Dict[str, Any]], str]:
        q_vec = self.embeddings.embed_text(query)
        candidates = self.vector_store.similarity_search(q_vec, top_k=top_k * 2, filter_category=category)
        reranked_docs, confidence = self.reranker.rerank_and_score(query, candidates)
        return reranked_docs[:top_k], confidence

hybrid_retriever = HybridRetriever()
