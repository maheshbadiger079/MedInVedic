import pytest
from app.agent import medinvedic_agent
from app.safety import SafetyLevel

@pytest.mark.asyncio
async def test_agent_product_query():
    res = await medinvedic_agent.process_user_message("user_1", "I want to buy Ashwagandha capsules")
    assert "Ashwagandha" in res["response"]
    assert res["safety_level"] == SafetyLevel.SAFE.value

@pytest.mark.asyncio
async def test_agent_emergency_interception():
    res = await medinvedic_agent.process_user_message("user_2", "I have unbearable chest pain and cannot breathe")
    assert "CRITICAL MEDICAL EMERGENCY" in res["response"]
    assert res["safety_level"] == SafetyLevel.URGENT.value

@pytest.mark.asyncio
async def test_agent_clinical_rag_query():
    res = await medinvedic_agent.process_user_message("user_3", "What is the dosage of Paracetamol for fever?")
    assert "Paracetamol" in res["response"] or "fever" in res["response"].lower()
    assert res["safety_level"] == SafetyLevel.MEDICAL_INFO.value
