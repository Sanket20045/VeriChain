"""
Issuer management routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Optional
import uuid

from app.database.db import get_db
from app.models.user import User, UserRole

router = APIRouter()


class AddIssuerRequest(BaseModel):
    name: str
    wallet_address: str
    email: Optional[str] = None


@router.get("/")
async def list_issuers(db: AsyncSession = Depends(get_db)):
    """List all authorized issuers."""
    result = await db.execute(
        select(User).where(User.role == UserRole.ISSUER, User.is_active == 1)
    )
    issuers = result.scalars().all()
    return {
        "issuers": [
            {
                "id": i.id,
                "name": i.name,
                "email": i.email,
                "wallet_address": i.wallet_address,
                "role": i.role,
                "is_active": i.is_active,
                "created_at": i.created_at,
            }
            for i in issuers
        ]
    }


@router.post("/", status_code=201)
async def add_issuer(body: AddIssuerRequest, db: AsyncSession = Depends(get_db)):
    """Add a new authorized issuer (Admin only)."""
    # Check if wallet already exists
    existing = await db.execute(
        select(User).where(User.wallet_address == body.wallet_address.lower())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Wallet address already registered as an issuer.")

    issuer = User(
        id=str(uuid.uuid4()),
        name=body.name,
        email=body.email,
        wallet_address=body.wallet_address.lower(),
        role=UserRole.ISSUER,
        is_active=1,
    )
    db.add(issuer)
    await db.commit()
    await db.refresh(issuer)

    return {
        "message": f"Issuer {body.name} added successfully.",
        "issuer_id": issuer.id,
        "wallet_address": issuer.wallet_address,
    }


@router.delete("/{wallet_address}")
async def remove_issuer(wallet_address: str, db: AsyncSession = Depends(get_db)):
    """Remove an issuer (Admin only)."""
    result = await db.execute(
        select(User).where(User.wallet_address == wallet_address.lower())
    )
    issuer = result.scalar_one_or_none()
    if not issuer:
        raise HTTPException(status_code=404, detail="Issuer not found.")

    issuer.is_active = 0
    await db.commit()

    return {"message": f"Issuer {issuer.name} has been deactivated."}
