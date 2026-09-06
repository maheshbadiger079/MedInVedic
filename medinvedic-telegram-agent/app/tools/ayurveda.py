from typing import Dict, Any
from app.tools.rag_search import rag_search_tool

class AyurvedaSearchTool:
    def execute(self, formulation: str) -> Dict[str, Any]:
        res = rag_search_tool.execute(formulation, category="Ayurveda")
        return {
            "tool": "ayurveda_search",
            "formulation": formulation,
            "results": res
        }

ayurveda_tool = AyurvedaSearchTool()
