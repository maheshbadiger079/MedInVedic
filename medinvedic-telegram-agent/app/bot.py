# -*- coding: utf-8 -*-
import logging
from typing import Dict, Any
from app.agent import medinvedic_agent
from app.services.telegram import format_telegram_message
from app.memory import memory_manager

logger = logging.getLogger('medinvedic.bot')

async def handle_telegram_command(command: str, args: str, user_id: str) -> str:
    user_id = str(user_id)
    cmd = command.strip().lower()

    if cmd == '/start':
        return (
            "🌿 *Welcome to MedInVedic AI Clinical Assistant!*\n\n"
            "\"Where Modern Medicine Meets Ancient Ayurveda\"\n\n"
            "📋 *Available Commands:*\n"
            "• `/medicine <name>` — Look up allopathic medicines (CDSCO / WHO)\n"
            "• `/ayurveda <herb>` — Classical Ayurvedic formulations & herbs (AYUSH)\n"
            "• `/remedy <symptom>` — Safe supportive home care & remedies\n"
            "• `/product <query>` — Search live MedInVedic catalog & products\n"
            "• `/doctor <symptoms>` — Schedule a certified doctor consultation\n"
            "• `/language <en|hi|mr|kn>` — Set your preferred language\n"
            "• `/memory` — View your stored preferences\n"
            "• `/forget` — Reset memory\n"
            "• `/help` — How to use this bot\n\n"
            "💡 *Or simply type any symptom (e.g. 'Fever', 'Cold', 'Stomach Pain'), medicine name, or health question!*"
        )
    elif cmd == '/help':
        return (
            "ℹ️ *MedInVedic Help & Guidance*\n\n"
            "Ask me anything about medicines, Ayurvedic herbs, seasonal diet, or products.\n\n"
            "• Type `Cold` or `Fever` for dual-system clinical guidance.\n"
            "• Type `/medicine Paracetamol` for drug dosage & safety.\n"
            "• Type `/ayurveda Ashwagandha` for classical properties.\n"
            "• Type `/remedy Cough` for natural kitchen remedies.\n\n"
            "🚨 For urgent medical emergencies, always dial *112* immediately."
        )
    elif cmd == '/medicine':
        query = args.strip() if args.strip() else "Paracetamol"
        res = await medinvedic_agent.process_user_message(user_id, f"medicine {query}")
        return format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=True)
    elif cmd == '/ayurveda':
        query = args.strip() if args.strip() else "Ashwagandha"
        res = await medinvedic_agent.process_user_message(user_id, f"ayurveda {query}")
        return format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=True)
    elif cmd == '/remedy':
        query = args.strip() if args.strip() else "Cold and Cough"
        res = await medinvedic_agent.process_user_message(user_id, f"remedy for {query}")
        return format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=True)
    elif cmd == '/product':
        query = args.strip() if args.strip() else "all"
        res = await medinvedic_agent.process_user_message(user_id, f"product {query}")
        return format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=False)
    elif cmd == '/doctor':
        query = args.strip() if args.strip() else "General Consultation"
        res = await medinvedic_agent.process_user_message(user_id, f"/doctor {query}")
        return format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=True)
    elif cmd == '/language':
        lang_map = {'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi', 'kn': 'Kannada'}
        selected = lang_map.get(args.strip().lower(), 'English')
        memory_manager.set_preference(user_id, 'language', selected)
        return f"🌐 Preferred language updated to *{selected}*."
    elif cmd == '/memory':
        mem = memory_manager.get_user_memory(user_id)
        return f"🧠 *Your Preferences:*\n• Language: {mem.get('language', 'English')}\n• Preferred Category: {mem.get('preferred_category', 'All')}"
    elif cmd == '/forget':
        memory_manager.forget_memory(user_id)
        return "🧹 Your conversation preferences have been reset."
    elif cmd == '/about':
        return (
            "🌿 *MedInVedic Healthcare Platform*\n"
            "Website: https://medinvedic.web.app\n"
            "Dual Health System: CDSCO Allopathy & AYUSH Ayurveda"
        )
    return ""

async def handle_telegram_message(text: str, user_id: str) -> str:
    res = await medinvedic_agent.process_user_message(str(user_id), text)
    msg = format_telegram_message(
        title="",
        body=res['response'],
        sources=res.get('sources', []),
        disclaimer=True
    )
    return msg
