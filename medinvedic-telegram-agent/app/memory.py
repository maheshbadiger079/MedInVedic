from typing import Dict, Any, Optional
from app.firebase import firebase_service

class UserMemoryManager:
    def __init__(self):
        self._local_cache: Dict[str, Dict[str, Any]] = {}

    def get_user_memory(self, user_id: str) -> Dict[str, Any]:
        if user_id in self._local_cache:
            return self._local_cache[user_id]
        doc = firebase_service.get_document("memories", str(user_id))
        mem = doc or {"language": "English", "preferred_category": "All", "reminders": []}
        self._local_cache[user_id] = mem
        return mem

    def set_preference(self, user_id: str, key: str, value: Any) -> Dict[str, Any]:
        if key in ["password", "medical_record", "credit_card"]:
            raise ValueError(f"Sensitive key {key} cannot be stored in user memory.")
        mem = self.get_user_memory(user_id)
        mem[key] = value
        self._local_cache[user_id] = mem
        firebase_service.set_document("memories", str(user_id), mem)
        return mem

    def forget_memory(self, user_id: str) -> bool:
        self._local_cache[user_id] = {"language": "English", "preferred_category": "All"}
        firebase_service.set_document("memories", str(user_id), self._local_cache[user_id])
        return True

memory_manager = UserMemoryManager()
