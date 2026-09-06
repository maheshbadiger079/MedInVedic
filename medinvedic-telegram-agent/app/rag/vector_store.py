import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import settings

class VectorStore:
    def __init__(self, storage_path: str = None):
        self.storage_path = Path(storage_path or settings.VECTOR_DB_PATH)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.documents: List[Dict[str, Any]] = []
        self.load()

    def add_documents(self, docs: List[Dict[str, Any]]) -> int:
        added = 0
        for d in docs:
            doc_id = d.get("metadata", {}).get("doc_hash") or d.get("content")[:40]
            if not any(existing.get("doc_id") == doc_id for existing in self.documents):
                d["doc_id"] = doc_id
                self.documents.append(d)
                added += 1
        self.save()
        return added

    def similarity_search(self, query_vector: List[float], top_k: int = 4, filter_category: Optional[str] = None) -> List[Dict[str, Any]]:
        scored = []
        for doc in self.documents:
            meta = doc.get("metadata", {})
            if filter_category and meta.get("category") != filter_category:
                continue
            doc_vec = doc.get("vector", [])
            if not doc_vec:
                continue
            score = sum(q * d for q, d in zip(query_vector, doc_vec))
            scored.append({"doc": doc, "score": score})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return [item["doc"] for item in scored[:top_k]]

    def save(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(self.documents, f, ensure_ascii=False, indent=2)

    def load(self):
        if self.storage_path.exists():
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception:
                self.documents = []

    def clear(self):
        self.documents = []
        self.save()

vector_store = VectorStore()
