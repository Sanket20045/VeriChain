from sqlalchemy import Column, String, DateTime, Enum as SAEnum, Text, Integer
from sqlalchemy.sql import func
from app.database.db import Base
import enum

class CertificateStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    REVOKED = "revoked"

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True)
    certificate_id = Column(String(100), unique=True, nullable=False, index=True)
    student_name = Column(String(255), nullable=False)
    student_id = Column(String(100), nullable=False)
    certificate_type = Column(String(100), nullable=False)
    course = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    college_name = Column(String(255), nullable=False)
    issue_date = Column(String(20), nullable=False)
    document_hash = Column(String(64), nullable=False)
    ipfs_cid = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    blockchain_tx = Column(String(66), nullable=True)
    block_number = Column(Integer, nullable=True)
    issuer_wallet = Column(String(42), nullable=False)
    qr_verification_url = Column(String(500), nullable=True)
    status = Column(SAEnum(CertificateStatus), nullable=False, default=CertificateStatus.ACTIVE)
    revocation_reason = Column(Text, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    revoked_by = Column(String(42), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class College(Base):
    __tablename__ = "colleges"

    id = Column(String(36), primary_key=True)
    college_name = Column(String(255), nullable=False)
    college_code = Column(String(20), unique=True, nullable=False)
    wallet_address = Column(String(42), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
