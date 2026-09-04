# ruff: noqa: E501
import re
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional

logger = logging.getLogger("safecare_safety")
logger.setLevel(logging.INFO)

# --- REGEX PATTERNS FOR SRI LANKAN PII ---
PII_PATTERNS: List[Tuple[str, str]] = [
    (r"\b\d{9}[vVxX]\b", "[NIC_REDACTED]"),           # Old SL NIC (9 digits + V/X)
    (r"\b\d{12}\b", "[NIC_REDACTED]"),                # New SL NIC (12 digits)
    (r"\b(?:\+94|0)?7[0-9]{8}\b", "[PHONE_REDACTED]"), # Sri Lankan Mobile Phone
    (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL_REDACTED]") # Email
]

# --- PROMPT INJECTION KEYWORDS ---
INJECTION_KEYWORDS: List[str] = [
    "ignore previous instructions",
    "override safety",
    "system prompt",
    "drop table",
    "admin mode",
    "bypass authorization",
    "act as root",
    "sudo"
]

# --- RED-FLAG MEDICAL EMERGENCIES ---
EMERGENCY_RED_FLAGS: List[str] = [
    "chest pain",
    "cannot breathe",
    "severe bleeding",
    "unconscious",
    "heart attack",
    "stroke",
    "poisoning",
    "suicidal"
]

# --- CLINICAL DIAGNOSIS & PRESCRIPTION WORDS ---
CLINICAL_RESTRICTIONS: List[str] = [
    "diagnose me",
    "prescribe medication",
    "what drug should i take",
    "give me dosage",
    "cure my disease"
]

def log_audit_event(severity: str, event_type: str, details: Dict[str, Any]) -> None:
    """Emits structured JSON audit log."""
    audit_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "severity": severity,
        "event_type": event_type,
        "details": details
    }
    print(f"AUDIT_LOG_JSON: {json.dumps(audit_entry)}")

def run_security_checkpoint(user_input: str) -> Dict[str, Any]:
    """
    Core Security & Safety Checkpoint.
    1. Redacts PII (NIC, Phone, Email)
    2. Blocks Prompt Injections
    3. Handles Medical Emergency Red Flags
    4. Enforces Non-Clinical Advice Rule
    """
    clean_text = user_input
    pii_found = False

    # 1. PII Redaction
    for pattern, replacement in PII_PATTERNS:
        if re.search(pattern, clean_text):
            clean_text = re.sub(pattern, replacement, clean_text)
            pii_found = True

    if pii_found:
        log_audit_event("INFO", "PII_REDACTED", {"original": user_input, "redacted": clean_text})

    lower_text = clean_text.lower()

    # 2. Prompt Injection Detection
    for kw in INJECTION_KEYWORDS:
        if kw in lower_text:
            log_audit_event("CRITICAL", "PROMPT_INJECTION_BLOCKED", {"keyword": kw, "input": clean_text})
            return {
                "allowed": False,
                "status": "SECURITY_BLOCK",
                "clean_text": clean_text,
                "reason": "Request blocked due to security command injection keywords.",
                "action": "SECURITY_EVENT"
            }

    # 3. Emergency Red Flag Intercept
    for flag in EMERGENCY_RED_FLAGS:
        if flag in lower_text:
            log_audit_event("WARNING", "EMERGENCY_RED_FLAG_INTERCEPTED", {"flag": flag, "input": clean_text})
            return {
                "allowed": True,
                "status": "EMERGENCY_REDIRECT",
                "clean_text": clean_text,
                "reason": "Medical emergency detected.",
                "emergency_message": "EMERGENCY ALERT: Call 1990 (Suwa Seriya Sri Lanka) or proceed to the nearest emergency unit immediately.",
                "action": "EMERGENCY_NAVIGATION"
            }

    # 4. Clinical Advice Intercept
    for clinic in CLINICAL_RESTRICTIONS:
        if clinic in lower_text:
            log_audit_event("WARNING", "CLINICAL_ADVICE_BLOCKED", {"term": clinic, "input": clean_text})
            return {
                "allowed": True,
                "status": "NON_CLINICAL_DISCLAIMER",
                "clean_text": clean_text,
                "reason": "CareRoute LK provides care-navigation support only and does not diagnose or prescribe medication.",
                "action": "DISCLAIMER_ATTACHED"
            }

    log_audit_event("INFO", "SECURITY_PASSED", {"clean_text": clean_text})
    return {
        "allowed": True,
        "status": "PASSED",
        "clean_text": clean_text,
        "reason": "Security checks passed successfully.",
        "action": "PROCEED"
    }
