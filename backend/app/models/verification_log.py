from sqlalchemy import Column, String, DateTime, Enum as SAEnum, Float, Text, Integer, Boolean
from sqlalchemy.sql import func
from app.database.db import Base
import enum

class VerificationMethod(str, enum.Enum):
    QR = "qr"
    UPLOAD = "upload"
    ID = "id"

class VerificationResult(str, enum.Enum):
    VALID = "valid"
    SUSPICIOUS = "suspicious"
    INVALID = "invalid"
    REVOKED = "revoked"
    NOT_FOUND = "not_found"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(String(36), primary_key=True)
    certificate_id = Column(String(100), nullable=True, index=True)
    verification_method = Column(SAEnum(VerificationMethod), nullable=False)
    hash_match = Column(Boolean, nullable=True)
    issuer_match = Column(Boolean, nullable=True)
    blockchain_found = Column(Boolean, nullable=True)
    ocr_match = Column(Boolean, nullable=True)
    ocr_fields = Column(Text, nullable=True)  # JSON string
    ai_score = Column(Float, nullable=True)
    ai_risk_level = Column(SAEnum(RiskLevel), nullable=True)
    ai_findings = Column(Text, nullable=True)  # JSON string
    final_result = Column(SAEnum(VerificationResult), nullable=False)
    explanation = Column(Text, nullable=True)
    verifier_ip = Column(String(45), nullable=True)
    verified_at = Column(DateTime, server_default=func.now())
