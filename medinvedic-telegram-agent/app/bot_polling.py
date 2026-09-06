# -*- coding: utf-8 -*-
import os
import sys
import logging

# Ensure UTF-8 stdout on Windows
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
from app.config import settings
from app.bot import handle_telegram_command, handle_telegram_message

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("medinvedic.telegram")

async def cmd_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return
    user_id = str(update.effective_user.id)
    text = update.message.text
    parts = text.split(maxsplit=1)
    cmd = parts[0]
    args = parts[1] if len(parts) > 1 else ""
    
    reply = await handle_telegram_command(cmd, args, user_id)
    if reply:
        try:
            await update.message.reply_text(reply, parse_mode="Markdown")
        except Exception:
            await update.message.reply_text(reply)

async def msg_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return
    user_id = str(update.effective_user.id)
    text = update.message.text
    
    reply = await handle_telegram_message(text, user_id)
    if reply:
        try:
            await update.message.reply_text(reply, parse_mode="Markdown")
        except Exception:
            await update.message.reply_text(reply)

def main():
    token = settings.TELEGRAM_BOT_TOKEN
    logger.info(f"Starting MedInVedic Telegram Polling Bot (Token: {token[:10]}...)...")
    
    app = ApplicationBuilder().token(token).build()
    
    commands = ["start", "help", "medicine", "ayurveda", "remedy", "product", "doctor", "language", "memory", "forget", "about"]
    app.add_handler(CommandHandler(commands, cmd_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, msg_handler))
    
    print("\n" + "="*60)
    print("🌿 MedInVedic Telegram Bot is LIVE and Listening for Messages!")
    print("📱 Open Telegram on your phone and start chatting with your bot.")
    print("="*60 + "\n")
    
    app.run_polling()

if __name__ == "__main__":
    main()
