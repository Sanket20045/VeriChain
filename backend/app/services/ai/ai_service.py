"""
Mock AI analysis service.
In production, replace with a real ML model or LLM-based analysis.
The AI module provides SUPPORTING evidence only — never overrides blockchain.
"""
from typing import Optional
import re


async def analyze_document(file_bytes: bytes, filename: str) -> dict:
    """
    Analyze a certificate document for anomalies.
    Returns:
        risk_score: 0-100
        risk_level: LOW / MEDIUM / HIGH
        findings: list of detected issues
        confidence: 0-1
    """
    findings = []
    risk_score = 5  # baseline LOW risk

    # Mock analysis based on file characteristics
    file_size = len(file_bytes)
    filename_lower = filename.lower()

    # Check file type expectations
    if not any(filename_lower.endswith(ext) for ext in [".pdf", ".png", ".jpg", ".jpeg"]):
        findings.append("Unexpected file format")
        risk_score += 20

    # Very small file may indicate invalid certificate
    if file_size < 5000:
        findings.append("File size unusually small — certificate may be incomplete")
        risk_score += 15

    # Very large file may indicate embedded content
    if file_size > 5 * 1024 * 1024:
        findings.append("File size unusually large")
        risk_score += 10

    # Determine risk level
    if risk_score <= 20:
        risk_level = "low"
    elif risk_score <= 50:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {
        "risk_score": min(risk_score, 100),
        "risk_level": risk_level,
        "findings": findings if findings else ["No significant anomalies detected"],
        "confidence": 0.75,
        "note": "AI analysis provides supporting evidence and does not replace blockchain verification.",
    }
