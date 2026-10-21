import json
import hashlib
from pathlib import Path
from typing import List, Dict, Any
from app.rag.cleaner import clean_text
from app.rag.chunker import text_chunker
from app.rag.embeddings import embedding_provider
from app.rag.vector_store import vector_store

class IngestionPipeline:
    def __init__(self):
        self.vector_store = vector_store
        self.embeddings = embedding_provider
        self.chunker = text_chunker

    def run_ingestion(self, base_dir: str = None) -> int:
        ingest_dir = Path(base_dir or Path(__file__).parent)
        total_chunks = 0
        
        for json_file in ingest_dir.glob("**/*.json"):
            if "vector_store" in str(json_file):
                continue
            try:
                with open(json_file, "r", encoding="utf-8-sig") as f:
                    docs = json.load(f)
                    if isinstance(docs, dict):
                        docs = [docs]
                    
                    for doc in docs:
                        title = doc.get("title", "Clinical Knowledge")
                        category = doc.get("category", "General")
                        source = doc.get("source", "MedInVedic")
                        tier = doc.get("tier", "Verified")
                        content = doc.get("content", "")
                        
                        cleaned = clean_text(content)
                        chunks = self.chunker.split_text(cleaned, metadata={
                            "title": title,
                            "category": category,
                            "source": source,
                            "tier": tier
                        })
                        
                        for c in chunks:
                            c["vector"] = self.embeddings.embed_text(c["content"])
                            c["metadata"]["doc_hash"] = hashlib.sha256(c["content"].encode("utf-8")).hexdigest()
                        
                        added = self.vector_store.add_documents(chunks)
                        total_chunks += added
            except Exception as e:
                print(f"Error ingesting {json_file}: {e}")
                
        print(f"âœ… Ingestion complete. Total indexed chunks: {total_chunks}")
        return total_chunks

if __name__ == "__main__":
    p = IngestionPipeline()
    p.run_ingestion()
