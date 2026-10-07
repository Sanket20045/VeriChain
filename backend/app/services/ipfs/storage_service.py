import os
import shutil
import aiofiles
from pathlib import Path
from typing import Optional

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

async def save_file_locally(file_data: bytes, filename: str) -> str:
    """Save uploaded certificate file to local storage. Returns file path."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_data)
    return file_path

async def get_file_bytes(file_path: str) -> Optional[bytes]:
    """Read a file and return bytes."""
    if not os.path.exists(file_path):
        return None
    async with aiofiles.open(file_path, "rb") as f:
        return await f.read()

def delete_file(file_path: str) -> bool:
    """Delete a file. Returns True if deleted."""
    try:
        os.remove(file_path)
        return True
    except FileNotFoundError:
        return False

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE_MB = 10

def validate_file(filename: str, file_size_bytes: int) -> tuple[bool, str]:
    """Validate file type and size. Returns (is_valid, error_message)."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File type '{ext}' not allowed. Supported: PDF, PNG, JPG"
    if file_size_bytes > MAX_FILE_SIZE_MB * 1024 * 1024:
        return False, f"File size exceeds {MAX_FILE_SIZE_MB}MB limit"
    return True, ""
