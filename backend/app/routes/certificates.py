"""
Certificate issuance and management routes.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional
import uuid
import os

from app.database.db import get_db
from app.models.certificate import Certificate, CertificateStatus
from app.services.hashing.hash_service import compute_sha256_bytes
from app.services.ipfs.storage_service import save_file_locally, validate_file

router = APIRouter()

BASE_URL = os.getenv("BASE_URL", "http://localhost:5173")


def generate_certificate_id(college_code: str, department: str, year: int, sequence: int) -> str:
    dept_abbrev = "".join(w[0] for w in department.upper().split()[:3])
    return f"VC-{college_code.upper()}-{dept_abbrev}-{year}-{sequence:04d}"


@router.post("/", status_code=201)
async def issue_certificate(
    student_name: str = Form(...),
    student_id: str = Form(...),
    certificate_type: str = Form(...),
    course: str = Form(...),
    department: str = Form(...),
    college_name: str = Form(...),
    college_code: str = Form(...),
    issue_date: str = Form(...),
    issuer_wallet: str = Form(...),
    certificate_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Issue a new certificate."""
    # Read file
    file_bytes = await certificate_file.read()

    # Validate file
    is_valid, error_msg = validate_file(certificate_file.filename or "cert", len(file_bytes))
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Generate hash
    doc_hash = compute_sha256_bytes(file_bytes)

    # Generate certificate ID
    from datetime import date
    year = int(issue_date[:4]) if issue_date else date.today().year

    # Count existing certificates for sequencing
    result = await db.execute(select(Certificate))
    count = len(result.scalars().all())
    sequence = count + 1

    cert_id = generate_certificate_id(college_code, department, year, sequence)

    # Check for duplicate
    existing = await db.execute(
        select(Certificate).where(Certificate.certificate_id == cert_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Certificate ID {cert_id} already exists.")

    # Save file locally (IPFS in production)
    safe_name = f"{cert_id}_{certificate_file.filename}"
    file_path = await save_file_locally(file_bytes, safe_name)

    # Create DB record
    cert = Certificate(
        id=str(uuid.uuid4()),
        certificate_id=cert_id,
        student_name=student_name,
        student_id=student_id,
        certificate_type=certificate_type,
        course=course,
        department=department,
        college_name=college_name,
        issue_date=issue_date,
        document_hash=doc_hash,
        file_path=file_path,
        issuer_wallet=issuer_wallet,
        qr_verification_url=f"{BASE_URL}/verify/{cert_id}",
        status=CertificateStatus.ACTIVE,
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)

    return {
        "certificate_id": cert_id,
        "document_hash": doc_hash,
        "file_path": file_path,
        "qr_url": cert.qr_verification_url,
        "status": "active",
        "message": "Certificate issued successfully. Register on blockchain to complete.",
    }


@router.get("/")
async def list_certificates(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all certificates with optional filters."""
    query = select(Certificate).order_by(desc(Certificate.created_at))

    if status_filter:
        query = query.where(Certificate.status == status_filter)

    if search:
        query = query.where(
            Certificate.student_name.ilike(f"%{search}%") |
            Certificate.certificate_id.ilike(f"%{search}%") |
            Certificate.student_id.ilike(f"%{search}%")
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    certs = result.scalars().all()

    return {
        "certificates": [
            {
                "id": c.id,
                "certificate_id": c.certificate_id,
                "student_name": c.student_name,
                "student_id": c.student_id,
                "certificate_type": c.certificate_type,
                "course": c.course,
                "department": c.department,
                "college_name": c.college_name,
                "issue_date": c.issue_date,
                "status": c.status,
                "issuer_wallet": c.issuer_wallet,
                "document_hash": c.document_hash,
                "ipfs_cid": c.ipfs_cid,
                "blockchain_tx": c.blockchain_tx,
                "qr_url": c.qr_verification_url,
                "created_at": c.created_at,
            }
            for c in certs
        ],
        "total": len(certs),
    }


@router.get("/{certificate_id}")
async def get_certificate(certificate_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific certificate by ID."""
    result = await db.execute(
        select(Certificate).where(Certificate.certificate_id == certificate_id)
    )
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    return {
        "id": cert.id,
        "certificate_id": cert.certificate_id,
        "student_name": cert.student_name,
        "student_id": cert.student_id,
        "certificate_type": cert.certificate_type,
        "course": cert.course,
        "department": cert.department,
        "college_name": cert.college_name,
        "issue_date": cert.issue_date,
        "status": cert.status,
        "issuer_wallet": cert.issuer_wallet,
        "document_hash": cert.document_hash,
        "ipfs_cid": cert.ipfs_cid,
        "blockchain_tx": cert.blockchain_tx,
        "block_number": cert.block_number,
        "qr_url": cert.qr_verification_url,
        "revocation_reason": cert.revocation_reason,
        "revoked_at": cert.revoked_at,
        "revoked_by": cert.revoked_by,
        "created_at": cert.created_at,
    }


class RevokeRequest(BaseModel):
    reason: str
    issuer_wallet: str


@router.post("/{certificate_id}/revoke")
async def revoke_certificate(
    certificate_id: str,
    body: RevokeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Revoke an active certificate."""
    result = await db.execute(
        select(Certificate).where(Certificate.certificate_id == certificate_id)
    )
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    if cert.status == CertificateStatus.REVOKED:
        raise HTTPException(status_code=400, detail="Certificate is already revoked.")

    from datetime import datetime
    cert.status = CertificateStatus.REVOKED
    cert.revocation_reason = body.reason
    cert.revoked_at = datetime.utcnow()
    cert.revoked_by = body.issuer_wallet
    await db.commit()

    return {"message": f"Certificate {certificate_id} has been revoked.", "status": "revoked"}


@router.patch("/{certificate_id}/blockchain")
async def update_blockchain_info(
    certificate_id: str,
    blockchain_tx: str = Form(...),
    block_number: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """Update certificate with blockchain transaction info after on-chain registration."""
    result = await db.execute(
        select(Certificate).where(Certificate.certificate_id == certificate_id)
    )
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    cert.blockchain_tx = blockchain_tx
    if block_number:
        cert.block_number = block_number
    await db.commit()

    return {"message": "Blockchain info updated.", "blockchain_tx": blockchain_tx}
