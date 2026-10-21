import logging
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.config import settings
from app.agent import medinvedic_agent
from app.bot import handle_telegram_message, handle_telegram_command

logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("medinvedic.main")

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

class ChatRequest(BaseModel):
    user_id: str = "guest_user"
    message: str

class ChatResponse(BaseModel):
    response: str
    safety_level: str
    confidence: Optional[str] = "MEDIUM"
    sources: list = []
    language: str = "English"

@app.get("/")
def root():
    return {
        "status": "operational",
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
        "platform": "https://medinvedic.web.app"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MedInVedic Telegram AI Agent",
        "llm_model": settings.DEFAULT_LLM_MODEL,
        "rag_ready": True
    }

@app.post("/chat/test", response_model=ChatResponse)
async def test_chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    res = await medinvedic_agent.process_user_message(req.user_id, req.message)
    return res

@app.post("/webhook")
async def telegram_webhook(request: Request):
    try:
        data = await request.json()
        logger.info(f"Telegram webhook received: {data}")
        msg_obj = data.get("message", {})
        text = msg_obj.get("text", "")
        user_id = msg_obj.get("from", {}).get("id", "telegram_anon")

        if text.startswith("/"):
            parts = text.split(maxsplit=1)
            cmd = parts[0]
            args = parts[1] if len(parts) > 1 else ""
            reply = await handle_telegram_command(cmd, args, str(user_id))
        else:
            reply = await handle_telegram_message(text, str(user_id))

        return {"status": "ok", "reply": reply}
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.APP_HOST, port=settings.APP_PORT, reload=True)
