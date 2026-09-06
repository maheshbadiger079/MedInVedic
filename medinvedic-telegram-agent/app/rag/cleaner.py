import re

def clean_text(raw: str) -> str:
    text = re.sub(r'\s+', ' ', raw).strip()
    text = re.sub(r'(?i)ignore\s+previous\s+instructions', '[SANITIZED]', text)
    text = re.sub(r'(?i)system\s+prompt', '[SANITIZED]', text)
    return text
