from typing import Dict, Any, List
from app.firebase import firebase_service

class ProductSearchTool:
    def execute(self, search_term: str) -> Dict[str, Any]:
        products = firebase_service.query_collection("products")
        matched = []
        stop_words = {"want", "find", "show", "price", "store", "catalog", "view", "what", "your", "sell", "have", "with", "from", "capsules", "tablets", "powder"}
        words = [w for w in search_term.lower().split() if len(w) > 2 and w not in stop_words]
        
        for p in products:
            p_text = (p.get("name", "") + " " + p.get("description", "") + " " + p.get("indications", "") + " " + p.get("category", "")).lower()
            if any(w in p_text for w in words) or search_term.lower() in p_text:
                matched.append(p)
                
        # If no specific keyword, return top products
        if not matched and any(w in search_term.lower() for w in ["product", "catalog", "store", "shop"]):
            matched = products[:4]

        return {
            "tool": "product_search",
            "term": search_term,
            "found_count": len(matched),
            "products": matched
        }

product_tool = ProductSearchTool()
