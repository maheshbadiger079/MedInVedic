from typing import Dict, Any
import uuid
import datetime
from app.firebase import firebase_service

class DoctorConsultationTool:
    def execute(self, user_id: str, symptoms: str, preferred_specialty: str = "General Medicine") -> Dict[str, Any]:
        consultation_id = f"cons_{uuid.uuid4().hex[:8]}"
        record = {
            "id": consultation_id,
            "user_id": str(user_id),
            "symptoms": symptoms,
            "specialty": preferred_specialty,
            "status": "REQUESTED",
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        firebase_service.set_document("consultations", consultation_id, record)
        return {
            "tool": "doctor_consultation",
            "consultation_id": consultation_id,
            "status": "REQUESTED",
            "message": f"Doctor consultation request #{consultation_id} registered. An available doctor will review your symptoms.",
            "details": record
        }

doctor_tool = DoctorConsultationTool()
