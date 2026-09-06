def format_telegram_message(title: str, body: str, sources: list = None, disclaimer: bool = True) -> str:
    msg = f"{title}\n\n{body}"
    if sources:
        msg += "\n\n📚 **Verified Sources:**"
        for s in sources:
            msg += f"\n• {s}"
    if disclaimer:
        msg += "\n\n⚠️ *MedInVedic AI provides general clinical info. Consult a certified doctor for personal care.*"
    return msg
