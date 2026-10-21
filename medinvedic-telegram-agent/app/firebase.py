import os
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("medinvedic.firebase")

_mock_firestore_db: Dict[str, Dict[str, Any]] = {
    "users": {},
    "conversations": {},
    "memories": {},
    "products": {
        "prod_1": {
            "id": "prod_1",
            "name": "Ashwagandha KSM-66 Organic Capsules",
            "category": "Ayurveda",
            "price": 499.0,
            "stock": 150,
            "rating": 4.9,
            "description": "Standardized root extract for stress relief, cortisol reduction and cognitive focus.",
            "indications": "Stress, fatigue, sleep quality",
            "verified": True,
            "url": "https://medinvedic.web.app/pages/categories.html"
        },
        "prod_2": {
            "id": "prod_2",
            "name": "Triphala Digestive Detox Powder",
            "category": "Ayurveda",
            "price": 299.0,
            "stock": 80,
            "rating": 4.8,
            "description": "Traditional blend of Haritaki, Bibhitaki, and Amalaki for digestive wellness.",
            "indications": "Constipation, digestion, gut detox",
            "verified": True,
            "url": "https://medinvedic.web.app/pages/categories.html"
        },
        "prod_3": {
            "id": "prod_3",
            "name": "Paracetamol 500mg Tablets (IP)",
            "category": "Modern Medicine",
            "price": 40.0,
            "stock": 500,
            "rating": 4.7,
            "description": "Antipyretic and analgesic for mild-to-moderate fever and body ache.",
            "indications": "Fever, headache, body pain",
            "verified": True,
            "url": "https://medinvedic.web.app/pages/categories.html"
        },
        "prod_4": {
            "id": "prod_4",
            "name": "Cetirizine 10mg Tablets (IP)",
            "category": "Modern Medicine",
            "price": 35.0,
            "stock": 320,
            "rating": 4.6,
            "description": "Second-generation antihistamine for allergic rhinitis, sneezing, and urticaria.",
            "indications": "Allergies, cold symptoms, itching",
            "verified": True,
            "url": "https://medinvedic.web.app/pages/categories.html"
        }
    },
    "consultations": {},
    "prescriptions": {},
    "audit_logs": []
}

class FirebaseService:
    def __init__(self):
        self.initialized = False
        self._init_firebase()

    def _init_firebase(self):
        try:
            import firebase_admin
            from firebase_admin import credentials
            if not firebase_admin._apps:
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    self.initialized = True
                    logger.info("Firebase Admin initialized with certificate file.")
                else:
                    logger.info("Firebase running in resilient offline/mock mode.")
        except Exception as e:
            logger.warning(f"Firebase initialize fallback to offline mode: {e}")

    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        return _mock_firestore_db.get(collection, {}).get(doc_id)

    def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        if collection not in _mock_firestore_db:
            _mock_firestore_db[collection] = {}
        _mock_firestore_db[collection][doc_id] = data
        return True

    def query_collection(self, collection: str, field: Optional[str] = None, value: Optional[Any] = None) -> List[Dict[str, Any]]:
        items = list(_mock_firestore_db.get(collection, {}).values())
        if field and value is not None:
            return [it for it in items if it.get(field) == value or (isinstance(it.get(field), str) and value.lower() in str(it.get(field)).lower())]
        return items

    def log_audit(self, event_type: str, details: Dict[str, Any]) -> None:
        sanitized = {k: v for k, v in details.items() if k not in ["password", "token", "prescription_base64"]}
        entry = {"event": event_type, "data": sanitized}
        _mock_firestore_db["audit_logs"].append(entry)

firebase_service = FirebaseService()
