from sqlalchemy import Column, String, DateTime, Enum as SAEnum, ForeignKey, Integer, Text
from sqlalchemy.sql import func
from app.database.db import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ISSUER = "issuer"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    wallet_address = Column(String(42), unique=True, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.ISSUER)
    college_id = Column(String(36), ForeignKey("colleges.id"), nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
