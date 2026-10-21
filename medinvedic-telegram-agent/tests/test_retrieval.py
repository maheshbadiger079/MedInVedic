import pytest
from app.rag.embeddings import embedding_provider
from app.rag.reranker import reranker
from app.rag.retriever import HybridRetriever
from app.rag.vector_store import VectorStore

def test_embedding_normalization():
    vec = embedding_provider.embed_text("Paracetamol fever dosage")
    assert len(vec) == 64
    # Check unit vector norm ~ 1.0
    norm = sum(x * x for x in vec)
    assert 0.99 <= norm <= 1.01

def test_reranker_confidence_scoring():
    query = "fever reduction paracetamol"
    docs = [
        {"content": "Paracetamol is an antipyretic used for fever reduction."},
        {"content": "Triphala powder is used for digestion detox."}
    ]
    reranked, confidence = reranker.rerank_and_score(query, docs)
    assert len(reranked) == 2
    assert "Paracetamol" in reranked[0]["content"]
    assert confidence in ["HIGH", "MEDIUM"]
