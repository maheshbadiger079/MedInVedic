import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "MedInVedic Telegram AI Agent"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # Telegram
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "mock_telegram_token")
    TELEGRAM_WEBHOOK_URL: Optional[str] = os.getenv("TELEGRAM_WEBHOOK_URL", None)
    TELEGRAM_WEBHOOK_SECRET: Optional[str] = os.getenv("TELEGRAM_WEBHOOK_SECRET", None)

    # LLM & Embeddings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("LLM_API_KEY", ""))
    DEFAULT_LLM_MODEL: str = "gemini-1.5-flash"
    EMBEDDING_MODEL: str = "models/text-embedding-004"

    # Vector Store & Storage
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./data/vector_store.json")
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage")

    # Firebase
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "medinvedic")
    FIREBASE_CLIENT_EMAIL: Optional[str] = os.getenv("FIREBASE_CLIENT_EMAIL", None)
    FIREBASE_PRIVATE_KEY: Optional[str] = os.getenv("FIREBASE_PRIVATE_KEY", None)
    FIREBASE_CREDENTIALS_PATH: Optional[str] = os.getenv("FIREBASE_CREDENTIALS_PATH", None)

    # Admins
    ADMIN_TELEGRAM_IDS: List[int] = [123456789]

    # RAG Settings
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 80
    TOP_K_RETRIEVAL: int = 4
    CONFIDENCE_THRESHOLD_HIGH: float = 0.78
    CONFIDENCE_THRESHOLD_MEDIUM: float = 0.55

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
