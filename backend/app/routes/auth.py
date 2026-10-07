"""
Authentication routes — wallet-based signature verification.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import secrets
import time
from eth_account.messages import encode_defunct
from eth_account import Account
from app.database.db import get_db

router = APIRouter()

# In-memory nonce store (production: use Redis)
_nonces: dict[str, tuple[str, float]] = {}
NONCE_TTL_SECONDS = 300


class NonceRequest(BaseModel):
    wallet_address: str


class SignatureVerifyRequest(BaseModel):
    wallet_address: str
    signature: str
    nonce: str


@router.post("/nonce")
async def get_nonce(request: NonceRequest):
    """Generate a one-time nonce for wallet signature."""
    nonce = secrets.token_hex(16)
    _nonces[request.wallet_address.lower()] = (nonce, time.time())
    return {
        "nonce": nonce,
        "message": f"Sign this message to authenticate with VeriChain.\n\nNonce: {nonce}",
    }


@router.post("/verify-signature")
async def verify_signature(request: SignatureVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify wallet signature and return session token."""
    wallet = request.wallet_address.lower()
    stored = _nonces.get(wallet)
    if not stored:
        raise HTTPException(status_code=400, detail="No nonce found. Request a nonce first.")

    nonce, ts = stored
    if time.time() - ts > NONCE_TTL_SECONDS:
        _nonces.pop(wallet, None)
        raise HTTPException(status_code=400, detail="Nonce expired. Request a new nonce.")

    if nonce != request.nonce:
        raise HTTPException(status_code=400, detail="Invalid nonce.")

    # Verify the signature
    message = f"Sign this message to authenticate with VeriChain.\n\nNonce: {nonce}"
    try:
        msg = encode_defunct(text=message)
        recovered = Account.recover_message(msg, signature=request.signature)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature.")

    if recovered.lower() != wallet:
        raise HTTPException(status_code=401, detail="Signature does not match wallet address.")

    # Clear used nonce
    _nonces.pop(wallet, None)

    # TODO: Lookup user in DB, create session/JWT
    return {
        "authenticated": True,
        "wallet_address": request.wallet_address,
        "message": "Authentication successful.",
    }


@router.get("/me")
async def get_me():
    """Get current authenticated user info."""
    # TODO: JWT validation
    return {"message": "Not implemented yet"}
