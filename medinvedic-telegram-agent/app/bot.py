# -*- coding: utf-8 -*-
import os
import logging
from typing import Dict, Any
from app.agent import medinvedic_agent
from app.services.telegram import format_telegram_message
from app.memory import memory_manager
from app.services.llm import FOUNDER_STORY

logger = logging.getLogger('medinvedic.bot')

async def handle_telegram_command(command: str, args: str, user_id: str) -> Dict[str, Any]:
    user_id = str(user_id)
    cmd = command.strip().lower()

    if cmd == '/start':
        text = (
            "🌿 *Welcome to MedInVedic AI Clinical Assistant!*\n\n"
            "\"Where Modern Medicine Meets Ancient Ayurveda\"\n\n"
            "📋 *Available Commands:*\n"
            "• `/founder` — The Story Behind MedInVedic & Founder History\n"
            "• `/medicine <name>` — Look up allopathic medicines (CDSCO / WHO)\n"
            "• `/ayurveda <herb>` — Classical Ayurvedic formulations & herbs (AYUSH)\n"
            "• `/remedy <symptom>` — Safe supportive home care & remedies\n"
            "• `/product <query>` — Search live MedInVedic catalog & products\n"
            "• `/doctor <symptoms>` — Schedule a certified doctor consultation\n"
            "• `/language <en|hi|mr|kn>` — Set your preferred language\n"
            "• `/memory` — View your stored preferences\n"
            "• `/forget` — Reset memory\n"
            "• `/help` — How to use this bot\n\n"
            "💡 *Or simply type any symptom, medicine name, or question like 'Who is the founder?'!*"
        )
        return {"text": text}

    elif cmd == '/founder' or cmd == '/history' or cmd == '/story':
        image_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "founder.jpg")
        return {
            "text": FOUNDER_STORY,
            "photo": image_path if os.path.exists(image_path) else None,
            "photo_caption": "🌿 *Mahesh Badiger*\nFounder & Developer, MedInVedic\n_\"Where Modern Medicine Meets Ancient Ayurveda\"_"
        }

    elif cmd == '/help':
        text = (
            "ℹ️ *MedInVedic Help & Guidance*\n\n"
            "Ask me anything about medicines, Ayurvedic herbs, seasonal diet, products, or platform history.\n\n"
            "• `/founder` — Meet the founder & read the MedInVedic story\n"
            "• Type `Cold` or `Fever` for dual-system clinical guidance\n"
            "• Type `/medicine Paracetamol` for drug dosage & safety\n"
            "• Type `/ayurveda Ashwagandha` for classical properties\n"
            "• Type `/remedy Cough` for natural kitchen remedies\n\n"
            "🚨 For urgent medical emergencies, always dial *112* immediately."
        )
        return {"text": text}

    elif cmd == '/medicine':
        query = args.strip() if args.strip() else "Paracetamol"
        res = await medinvedic_agent.process_user_message(user_id, f"medicine {query}")
        return {"text": format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=True)}

    elif cmd == '/ayurveda':
        query = args.strip() if args.strip() else "Ashwagandha"
        res = await medinvedic_agent.process_user_message(user_id, f"ayurveda {query}")
        return {"text": format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=True)}

    elif cmd == '/remedy':
        query = args.strip() if args.strip() else "Cold and Cough"
        res = await medinvedic_agent.process_user_message(user_id, f"remedy for {query}")
        return {"text": format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=True)}

    elif cmd == '/product':
        query = args.strip() if args.strip() else "all"
        res = await medinvedic_agent.process_user_message(user_id, f"product {query}")
        return {"text": format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=False)}

    elif cmd == '/doctor':
        query = args.strip() if args.strip() else "General Consultation"
        res = await medinvedic_agent.process_user_message(user_id, f"/doctor {query}")
        return {"text": format_telegram_message(body=res['response'], sources=res.get('sources', []), disclaimer=True)}

    elif cmd == '/language':
        lang_map = {'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi', 'kn': 'Kannada'}
        selected = lang_map.get(args.strip().lower(), 'English')
        memory_manager.set_preference(user_id, 'language', selected)
        return {"text": f"🌐 Preferred language updated to *{selected}*."}

    elif cmd == '/memory':
        mem = memory_manager.get_user_memory(user_id)
        return {"text": f"🧠 *Your Preferences:*\n• Language: {mem.get('language', 'English')}\n• Preferred Category: {mem.get('preferred_category', 'All')}"}

    elif cmd == '/forget':
        memory_manager.forget_memory(user_id)
        return {"text": "🧹 Your conversation preferences have been reset."}

    elif cmd == '/about':
        return {
            "text": (
                "🌿 *MedInVedic Healthcare Platform*\n"
                "• **Founder:** Mahesh Badiger\n"
                "• **Website:** https://medinvedic.web.app\n"
                "• **Mission:** Where Modern Medicine Meets Ancient Ayurveda"
            )
        }

    return {"text": ""}

async def handle_telegram_message(text: str, user_id: str) -> Dict[str, Any]:
    low = text.lower()
    # Check if query is about founder
    if any(w in low for w in ["founder", "history", "story of medinvedic", "who created", "who made", "mahesh badiger", "mahesh"]):
        image_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "founder.jpg")
        return {
            "text": FOUNDER_STORY,
            "photo": image_path if os.path.exists(image_path) else None,
            "photo_caption": "🌿 *Mahesh Badiger*\nFounder & Developer, MedInVedic\n_\"Where Modern Medicine Meets Ancient Ayurveda\"_"
        }

    res = await medinvedic_agent.process_user_message(str(user_id), text)
    msg = format_telegram_message(
        title="",
        body=res['response'],
        sources=res.get('sources', []),
        disclaimer=True
    )
    return {"text": msg}
