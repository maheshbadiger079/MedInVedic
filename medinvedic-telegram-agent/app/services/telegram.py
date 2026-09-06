# -*- coding: utf-8 -*-
from typing import List, Optional

def format_telegram_message(title: str = "", body: str = "", sources: Optional[List[str]] = None, disclaimer: bool = True) -> str:
    parts = []
    if title:
        parts.append(title.strip())
    if body:
        parts.append(body.strip())
    if sources and len(sources) > 0:
        src_text = "📚 **Verified Clinical Sources:**"
        for s in sources:
            src_text += f"\n• {s}"
        parts.append(src_text)
    if disclaimer:
        parts.append("⚠️ *MedInVedic Clinical Disclaimer: General medical & Ayurvedic guidance. For emergencies or personal diagnosis, consult a doctor.*")
    return "\n\n".join(parts)
