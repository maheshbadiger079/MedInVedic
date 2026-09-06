from typing import List, Dict, Any

def extract_citations(chunks: List[Dict[str, Any]]) -> List[str]:
    citations = []
    seen = set()
    for c in chunks:
        meta = c.get("metadata", {})
        source_title = meta.get("title") or meta.get("source") or "MedInVedic Clinical Guidelines"
        org = meta.get("source_org") or "CDSCO / AYUSH / WHO"
        tier = meta.get("tier", "Evidence")
        entry = f"{source_title} ({org} — {tier})"
        if entry not in seen:
            citations.append(entry)
            seen.add(entry)
    return citations
