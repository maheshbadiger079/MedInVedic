import logging
from typing import Dict, Any
from app.agent import medinvedic_agent
from app.services.telegram import format_telegram_message
from app.memory import memory_manager

logger = logging.getLogger("medinvedic.bot")

async def handle_telegram_command(command: str, args: str, user_id: str) -> str:
    user_id = str(user_id)
    if command == "/start":
        return (
            "ðŸŒ¿ **Welcome to MedInVedic AI Clinical Assistant!**\n\n"
            "Where Modern Medicine Meets Ancient Ayurveda.\n\n"
            "ðŸ“‹ **Available Commands:**\n"
            "â€¢ `/medicine <name>` â€” Look up allopathic medicines (CDSCO / WHO)\n"
            "â€¢ `/ayurveda <herb>` â€” Classical Ayurvedic formulations & herbs\n"
            "â€¢ `/remedy <symptom>` â€” Safe supportive home care\n"
            "â€¢ `/product <query>` â€” Search live MedInVedic medicines & herbs\n"
            "â€¢ `/doctor <symptoms>` â€” Schedule a certified doctor consultation\n"
            "â€¢ `/language <en|hi|mr|kn>` â€” Set your preferred language\n"
            "â€¢ `/memory` â€” View your stored preferences\n"
            "â€¢ `/forget` â€” Reset memory\n"
            "â€¢ `/help` â€” How to use this bot\n\n"
            "ðŸ’¡ Or simply ask any health question in natural language!"
        )
    elif command == "/help":
        return (
            "â„¹ï¸ **MedInVedic Help & Guidance**\n\n"
            "Ask me anything about medicines, Ayurvedic herbs, seasonal diet, or products.\n"
            "For urgent emergencies, always dial **112** immediately."
        )
    elif command == "/language":
        lang_map = {"en": "English", "hi": "Hindi", "mr": "Marathi", "kn": "Kannada"}
        selected = lang_map.get(args.strip().lower(), "English")
        memory_manager.set_preference(user_id, "language", selected)
        return f"ðŸŒ Preferred language updated to **{selected}**."
    elif command == "/memory":
        mem = memory_manager.get_user_memory(user_id)
        return f"ðŸ§  **Your Preferences:**\nâ€¢ Language: {mem.get('language', 'English')}\nâ€¢ Category: {mem.get('preferred_category', 'All')}"
    elif command == "/forget":
        memory_manager.forget_memory(user_id)
        return "ðŸ§¹ Your conversation preferences have been reset."
    elif command == "/about":
        return (
            "ðŸŒ¿ **MedInVedic Healthcare Platform**\n"
            "Website: https://medinvedic.web.app\n"
            "Dual Health System: CDSCO Allopathy & AYUSH Ayurveda"
        )
    return ""

async def handle_telegram_message(text: str, user_id: str) -> str:
    res = await medinvedic_agent.process_user_message(str(user_id), text)
    msg = format_telegram_message(
        title="",
        body=res["response"],
        sources=res.get("sources", []),
        disclaimer=True
    )
    return msg
