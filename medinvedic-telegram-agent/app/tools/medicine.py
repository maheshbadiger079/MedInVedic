from typing import Dict, Any
from app.tools.rag_search import rag_search_tool

class MedicineSearchTool:
    def execute(self, medicine_name: str) -> Dict[str, Any]:
        res = rag_search_tool.execute(medicine_name, category="Modern Medicine")
        return {
            "tool": "medicine_search",
            "medicine": medicine_name,
            "results": res
        }

medicine_tool = MedicineSearchTool()
