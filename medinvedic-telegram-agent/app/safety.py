import re
from enum import Enum
from typing import Dict, Any, Tuple

class SafetyLevel(str, Enum):
    SAFE = "SAFE"
    MEDICAL_INFO = "MEDICAL_INFORMATION"
    URGENT = "URGENT"
    HIGH_RISK = "HIGH_RISK"
    UNKNOWN = "UNKNOWN"

EMERGENCY_TRIGGERS = [
    r"chest pain", r"heart attack", r"can'?t breathe", r"shortness of breath",
    r"difficulty breathing", r"severe bleeding", r"unconscious", r"stroke",
    r"face drooping", r"slurred speech", r"seizure", r"poisoning", r"swallowed poison",
    r"anaphylaxis", r"throat closing", r"choking", r"suicide", r"kill myself", r"overdose"
]

HIGH_RISK_PATTERNS = [
    r"change.*dose", r"stop taking.*", r"increase.*dose", r"give me.*prescription",
    r"prescribe.*me", r"skip.*antibiotic", r"double.*dose", r"replace.*surgery"
]

PROMPT_INJECTION_PATTERNS = [
    r"ignore.*instructions", r"system prompt", r"you are now DAN",
    r"disregard.*guidelines", r"tell me how to manufacture", r"bypass guardrails"
]

class SafetyClassifier:
    def __init__(self):
        self.emergency_regex = re.compile("|".join(EMERGENCY_TRIGGERS), re.IGNORECASE)
        self.high_risk_regex = re.compile("|".join(HIGH_RISK_PATTERNS), re.IGNORECASE)
        self.injection_regex = re.compile("|".join(PROMPT_INJECTION_PATTERNS), re.IGNORECASE)

    def classify(self, text: str) -> Tuple[SafetyLevel, str]:
        clean = text.strip()
        if not clean:
            return SafetyLevel.UNKNOWN, "Empty input"

        if self.injection_regex.search(clean):
            return SafetyLevel.HIGH_RISK, "Prompt injection attempt detected. Blocked."

        if self.emergency_regex.search(clean):
            return SafetyLevel.URGENT, (
                "ðŸš¨ **CRITICAL MEDICAL EMERGENCY DETECTED**\n\n"
                "Please call **112 / 102 (National Emergency Services)** immediately or visit the nearest emergency room.\n\n"
                "âš ï¸ *MedInVedic AI is an informational system and cannot provide immediate emergency medical rescue.*"
            )

        if self.high_risk_regex.search(clean):
            return SafetyLevel.HIGH_RISK, (
                "âš ï¸ **Prescription & Dosage Guidance Policy**\n\n"
                "MedInVedic AI cannot alter, diagnose, or modify prescribed pharmaceutical dosages.\n"
                "Please consult your treating physician or book a doctor consultation via /doctor."
            )

        return SafetyLevel.MEDICAL_INFO, "Safe for grounded clinical RAG processing."

safety_classifier = SafetyClassifier()
