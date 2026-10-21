from typing import List, Dict, Any
from app.config import settings

class TextChunker:
    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    def split_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        chunks = []
        words = text.split()
        if not words:
            return chunks

        step = max(1, self.chunk_size - self.chunk_overlap)
        current = 0
        chunk_idx = 0

        while current < len(words):
            chunk_words = words[current : current + self.chunk_size]
            chunk_str = " ".join(chunk_words)
            chunk_meta = dict(metadata or {})
            chunk_meta["chunk_id"] = chunk_idx
            chunks.append({
                "content": chunk_str,
                "metadata": chunk_meta
            })
            current += step
            chunk_idx += 1

        return chunks

text_chunker = TextChunker()
