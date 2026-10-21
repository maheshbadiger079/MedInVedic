from typing import Dict, Any
import datetime

class PrescriptionWorkflowTool:
    def execute(self, user_id: str, file_url: str, extracted_text: str = "") -> Dict[str, Any]:
        return {
            "tool": "prescription_workflow",
            "status": "EXTRACTED_PENDING_REVIEW",
            "user_id": user_id,
            "file_url": file_url,
            "extracted_text": extracted_text or "Prescription uploaded successfully. Reviewing with pharmacist.",
            "disclaimer": "âš ï¸ OCR is an assistive tool only. A licensed pharmacist/doctor must verify the prescription before release.",
            "created_at": datetime.datetime.utcnow().isoformat()
        }

prescription_tool = PrescriptionWorkflowTool()
