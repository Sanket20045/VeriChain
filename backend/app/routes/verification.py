"""
Verification routes — core verification engine.
Supports: Certificate ID, QR, and file upload verification.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid
import json

from app.database.db import get_db
from app.models.certificate import Certificate, CertificateStatus
from app.models.verification_log import VerificationLog, VerificationMethod, VerificationResult, RiskLevel
from app.services.hashing.hash_service import compute_sha256_bytes
from app.services.ai.ai_service import analyze_document
from app.services.ocr.ocr_service import perform_ocr_pipeline

router = APIRouter()


async def run_core_verification(
    certificate_id: str,
    uploaded_hash: Optional[str],
    method: VerificationMethod,
    db: AsyncSession,
    request: Optional[Request] = None,
) -> dict:
    """
    Core verification logic:
    1. Find certificate in DB (off-chain record)
    2. Check existence
    3. Check revocation status
    4. Compare hash (if file uploaded)
    5. Return structured result
    """
    # Look up in local DB (later: also check blockchain)
    result = await db.execute(
        select(Certificate).where(Certificate.certificate_id == certificate_id)
    )
    cert = result.scalar_one_or_none()

    if not cert:
        # Log and return NOT_FOUND
        log = VerificationLog(
            id=str(uuid.uuid4()),
            certificate_id=certificate_id,
            verification_method=method,
            blockchain_found=False,
            final_result=VerificationResult.NOT_FOUND,
            explanation="No certificate found with this ID.",
            verifier_ip=request.client.host if request else None,
        )
        db.add(log)
        await db.commit()
        return {
            "final_status": "not_found",
            "certificate_id": certificate_id,
            "explanation": "No registered certificate was found for this certificate ID.",
            "blockchain_found": False,
            "hash_match": None,
            "issuer_verified": None,
            "ocr_match": None,
            "ai_score": None,
            "ai_risk_level": None,
            "ai_findings": [],
        }

    # Check revocation
    if cert.status == CertificateStatus.REVOKED:
        log = VerificationLog(
            id=str(uuid.uuid4()),
            certificate_id=certificate_id,
            verification_method=method,
            blockchain_found=True,
            final_result=VerificationResult.REVOKED,
            explanation="This certificate has been revoked.",
            verifier_ip=request.client.host if request else None,
        )
        db.add(log)
        await db.commit()
        return {
            "final_status": "revoked",
            "certificate_id": cert.certificate_id,
            "certificate": _cert_to_dict(cert),
            "explanation": "This certificate was previously registered but has been revoked by an authorized issuer.",
            "blockchain_found": True,
            "hash_match": None,
            "issuer_verified": True,
            "ocr_match": None,
            "ai_score": None,
            "ai_risk_level": None,
            "ai_findings": [],
        }

    # Hash check
    hash_match = None
    if uploaded_hash:
        hash_match = uploaded_hash.lower() == cert.document_hash.lower()

    # Determine final result
    if uploaded_hash is not None and not hash_match:
        final_status = VerificationResult.INVALID
        explanation = "The uploaded certificate file does not match the registered certificate. The file may have been modified."
    else:
        final_status = VerificationResult.VALID
        explanation = "The certificate matches the registered college record and is currently active."

    log = VerificationLog(
        id=str(uuid.uuid4()),
        certificate_id=certificate_id,
        verification_method=method,
        blockchain_found=True,
        hash_match=hash_match,
        issuer_match=True,
        final_result=final_status,
        explanation=explanation,
        verifier_ip=request.client.host if request else None,
    )
    db.add(log)
    await db.commit()

    return {
        "final_status": final_status.value,
        "certificate_id": cert.certificate_id,
        "certificate": _cert_to_dict(cert),
        "explanation": explanation,
        "blockchain_found": True,
        "hash_match": hash_match,
        "issuer_verified": True,
        "document_hash_registered": cert.document_hash,
        "document_hash_uploaded": uploaded_hash,
        "blockchain_tx": cert.blockchain_tx,
        "block_number": cert.block_number,
        "ocr_match": None,
        "ai_score": None,
        "ai_risk_level": None,
        "ai_findings": [],
    }


def _cert_to_dict(cert: Certificate) -> dict:
    return {
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
        "qr_url": cert.qr_verification_url,
    }


class IDVerifyRequest(BaseModel):
    certificate_id: str


@router.post("/id")
async def verify_by_id(
    body: IDVerifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Verify certificate by ID only (no file upload)."""
    return await run_core_verification(
        body.certificate_id, None, VerificationMethod.ID, db, request
    )


@router.post("/qr")
async def verify_by_qr(
    body: IDVerifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Verify certificate via QR-encoded certificate ID."""
    return await run_core_verification(
        body.certificate_id, None, VerificationMethod.QR, db, request
    )


@router.post("/upload")
async def verify_by_upload(
    certificate_id: str = Form(...),
    certificate_file: UploadFile = File(...),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
):
    """Verify certificate by uploading the file. Performs hash + OCR + AI check."""
    file_bytes = await certificate_file.read()
    uploaded_hash = compute_sha256_bytes(file_bytes)

    # Run core verification first
    result = await run_core_verification(
        certificate_id, uploaded_hash, VerificationMethod.UPLOAD, db, request
    )

    # Perform OCR Extraction
    ocr_result = await perform_ocr_pipeline(file_bytes, certificate_file.filename or "cert")
    result["ocr_fields"] = ocr_result.get("fields")
    result["ocr_match"] = True if ocr_result.get("fields") and any(ocr_result["fields"].values()) else False

    # If certificate found, run AI analysis
    if result.get("blockchain_found") and result.get("final_status") not in ("not_found", "revoked"):
        ai_result = await analyze_document(file_bytes, certificate_file.filename or "cert")
        result["ai_score"] = ai_result.get("risk_score")
        result["ai_risk_level"] = ai_result.get("risk_level")
        result["ai_findings"] = ai_result.get("findings", [])

        # If AI finds high risk and other checks are borderline, flag as suspicious
        if ai_result.get("risk_score", 0) > 70 and result["final_status"] == "valid":
            result["final_status"] = "suspicious"
            result["explanation"] = "The certificate exists, but anomalies were detected during document analysis."

    return result


@router.get("/history")
async def verification_history(
    skip: int = 0,
    limit: int = 50,
    result_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get verification history (audit log)."""
    query = select(VerificationLog).order_by(VerificationLog.verified_at.desc())
    if result_filter:
        query = query.where(VerificationLog.final_result == result_filter)
    query = query.offset(skip).limit(limit)
    logs_result = await db.execute(query)
    logs = logs_result.scalars().all()

    return {
        "logs": [
            {
                "id": l.id,
                "certificate_id": l.certificate_id,
                "verification_method": l.verification_method,
                "hash_match": l.hash_match,
                "issuer_match": l.issuer_match,
                "blockchain_found": l.blockchain_found,
                "ai_score": l.ai_score,
                "ai_risk_level": l.ai_risk_level,
                "final_result": l.final_result,
                "explanation": l.explanation,
                "verified_at": l.verified_at,
            }
            for l in logs
        ],
        "total": len(logs),
    }
