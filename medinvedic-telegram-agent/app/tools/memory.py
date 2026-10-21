from typing import Dict, Any
from app.memory import memory_manager

class MemoryTool:
    def execute(self, action: str, user_id: str, key: str = None, value: Any = None) -> Dict[str, Any]:
        if action == "get":
            mem = memory_manager.get_user_memory(str(user_id))
            return {"status": "success", "memory": mem}
        elif action == "set":
            mem = memory_manager.set_preference(str(user_id), key, value)
            return {"status": "success", "memory": mem}
        elif action == "forget":
            memory_manager.forget_memory(str(user_id))
            return {"status": "success", "message": "Memory cleared."}
        return {"status": "error", "message": f"Unknown action: {action}"}

memory_tool = MemoryTool()
