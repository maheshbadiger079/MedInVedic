import json
from pathlib import Path
from typing import List, Dict, Any

class DocumentLoader:
    def load_file(self, filepath: str) -> List[Dict[str, Any]]:
        p = Path(filepath)
        if not p.exists():
            return []

        suffix = p.suffix.lower()
        if suffix in [".txt", ".md"]:
            with open(p, "r", encoding="utf-8-sig") as f:
                content = f.read()
            return [{"content": content, "metadata": {"source": str(p), "title": p.stem}}]
        elif suffix == ".json":
            with open(p, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
            if isinstance(data, list):
                return data
            return [data]
        return []

document_loader = DocumentLoader()
