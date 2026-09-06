import os
import aiofiles
from pathlib import Path
from app.config import settings

class StorageService:
    def __init__(self):
        self.storage_dir = Path(settings.STORAGE_DIR)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, filename: str, content: bytes) -> str:
        filepath = self.storage_dir / filename
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)
        return str(filepath)

storage_service = StorageService()
