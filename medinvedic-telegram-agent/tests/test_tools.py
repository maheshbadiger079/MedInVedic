import pytest
from app.tools.products import product_tool
from app.tools.doctor import doctor_tool
from app.tools.prescription import prescription_tool
from app.tools.memory import memory_tool

def test_product_search_tool():
    res = product_tool.execute("Ashwagandha")
    assert res["found_count"] >= 1
    assert "Ashwagandha" in res["products"][0]["name"]

def test_doctor_consultation_tool():
    res = doctor_tool.execute("user_101", "Knee joint pain and stiffness", "Orthopedic")
    assert res["status"] == "REQUESTED"
    assert "cons_" in res["consultation_id"]

def test_prescription_workflow_tool():
    res = prescription_tool.execute("user_101", "https://storage.medinvedic.app/rx_1.jpg")
    assert res["status"] == "EXTRACTED_PENDING_REVIEW"
    assert "disclaimer" in res

def test_memory_tool_actions():
    res = memory_tool.execute("set", "user_101", "language", "Marathi")
    assert res["status"] == "success"
    get_res = memory_tool.execute("get", "user_101")
    assert get_res["memory"]["language"] == "Marathi"
