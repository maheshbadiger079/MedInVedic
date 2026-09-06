from typing import Dict, Any
from app.tools.rag_search import rag_search_tool

class RemedySearchTool:
    def execute(self, symptom: str) -> Dict[str, Any]:
        res = rag_search_tool.execute(symptom, category="Home Remedies")
        return {
            "tool": "remedy_search",
            "symptom": symptom,
            "results": res
        }

remedy_tool = RemedySearchTool()
