import hashlib
import math
from typing import List
from app.config import settings

class EmbeddingProvider:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self.dimension = 64

    def embed_text(self, text: str) -> List[float]:
        vec = [0.0] * self.dimension
        words = text.lower().split()
        for w in words:
            h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
            for i in range(self.dimension):
                val = ((h >> (i % 32)) & 0xFF) / 255.0 - 0.5
                vec[i] += val
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

embedding_provider = EmbeddingProvider()
