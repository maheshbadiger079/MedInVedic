import pytest
from app.memory import memory_manager

def test_user_memory_persistence():
    user_id = "test_user_42"
    memory_manager.set_preference(user_id, "language", "Hindi")
    memory_manager.set_preference(user_id, "preferred_category", "Ayurveda")
    
    mem = memory_manager.get_user_memory(user_id)
    assert mem["language"] == "Hindi"
    assert mem["preferred_category"] == "Ayurveda"

def test_sensitive_key_block():
    user_id = "test_user_42"
    with pytest.raises(ValueError):
        memory_manager.set_preference(user_id, "credit_card", "1234-5678-9012-3456")

def test_forget_memory():
    user_id = "test_user_42"
    memory_manager.forget_memory(user_id)
    mem = memory_manager.get_user_memory(user_id)
    assert mem["language"] == "English"
