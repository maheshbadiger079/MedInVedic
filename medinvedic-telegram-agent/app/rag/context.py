from typing import List, Dict, Any

def build_context_envelope(chunks: List[Dict[str, Any]]) -> str:
    envelope_parts = []
    for i, c in enumerate(chunks, 1):
        content = c.get("content", "")
        meta = c.get("metadata", {})
        title = meta.get("title", "Clinical Data Chunk")
        source = meta.get("source", "MedInVedic Knowledge Repository")
        category = meta.get("category", "General")
        
        envelope_parts.append(
            f"--- DATA ENVELOPE CHUNK #{i} ---\n"
            f"[Source]: {title} ({source}) | [Category]: {category}\n"
            f"[Data Content]: {content}\n"
            f"-------------------------------"
        )
    return "\n\n".join(envelope_parts)
