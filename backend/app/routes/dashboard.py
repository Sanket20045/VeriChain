"""
Dashboard statistics routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database.db import get_db
from app.models.certificate import Certificate, CertificateStatus
from app.models.verification_log import VerificationLog

router = APIRouter()


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get dashboard statistics."""
    total = await db.execute(select(func.count(Certificate.id)))
    active = await db.execute(
        select(func.count(Certificate.id)).where(Certificate.status == CertificateStatus.ACTIVE)
    )
    revoked = await db.execute(
        select(func.count(Certificate.id)).where(Certificate.status == CertificateStatus.REVOKED)
    )
    verifications = await db.execute(select(func.count(VerificationLog.id)))

    return {
        "total_certificates": total.scalar() or 0,
        "active_certificates": active.scalar() or 0,
        "revoked_certificates": revoked.scalar() or 0,
        "total_verifications": verifications.scalar() or 0,
    }


@router.get("/recent-certificates")
async def recent_certificates(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """Get recent certificates for dashboard."""
    result = await db.execute(
        select(Certificate)
        .order_by(desc(Certificate.created_at))
        .limit(limit)
    )
    certs = result.scalars().all()
    return {
        "certificates": [
            {
                "certificate_id": c.certificate_id,
                "student_name": c.student_name,
                "certificate_type": c.certificate_type,
                "status": c.status,
                "created_at": c.created_at,
            }
            for c in certs
        ]
    }


@router.get("/recent-verifications")
async def recent_verifications(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """Get recent verification activity."""
    result = await db.execute(
        select(VerificationLog)
        .order_by(desc(VerificationLog.verified_at))
        .limit(limit)
    )
    logs = result.scalars().all()
    return {
        "verifications": [
            {
                "certificate_id": l.certificate_id,
                "verification_method": l.verification_method,
                "final_result": l.final_result,
                "ai_score": l.ai_score,
                "verified_at": l.verified_at,
            }
            for l in logs
        ]
    }
