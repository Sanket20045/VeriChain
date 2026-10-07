import hashlib
import aiofiles
from pathlib import Path

async def compute_sha256_file(file_path: str) -> str:
    """Compute SHA-256 hash of a file asynchronously."""
    sha256_hash = hashlib.sha256()
    async with aiofiles.open(file_path, "rb") as f:
        while chunk := await f.read(8192):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()

def compute_sha256_bytes(data: bytes) -> str:
    """Compute SHA-256 hash of bytes."""
    return hashlib.sha256(data).hexdigest()

def verify_hash(file_hash: str, stored_hash: str) -> bool:
    """Compare computed hash against stored hash."""
    return file_hash.lower() == stored_hash.lower()
