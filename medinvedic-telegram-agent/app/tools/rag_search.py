from typing import Dict, Any, List
from app.rag.retriever import hybrid_retriever
from app.rag.citations import extract_citations
from app.rag.context import build_context_envelope

class RAGSearchTool:
    def __init__(self):
        self.retriever = hybrid_retriever

    def execute(self, query: str, category: str = None) -> Dict[str, Any]:
        chunks, confidence = self.retriever.retrieve(query, category=category)
        envelope = build_context_envelope(chunks)
        citations = extract_citations(chunks)
        return {
            "query": query,
            "chunks_count": len(chunks),
            "confidence": confidence,
            "context_envelope": envelope,
            "citations": citations,
            "chunks": chunks
        }

rag_search_tool = RAGSearchTool()
