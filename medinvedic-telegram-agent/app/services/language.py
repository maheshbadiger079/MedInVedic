SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "kn": "Kannada"
}

def detect_language(text: str) -> str:
    for ch in text:
        code = ord(ch)
        if 0x0900 <= code <= 0x097F:
            if any(w in text for w in ["आहे", "नाही", "काय", "कसे", "औषध"]):
                return "Marathi"
            return "Hindi"
        elif 0x0C80 <= code <= 0x0CFF:
            return "Kannada"
    return "English"
