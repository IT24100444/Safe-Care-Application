# ruff: noqa: E501
import re
import logging
from typing import Dict, Any, List, Optional
from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools import AgentTool
from app.config import config
from app.services.node_api_client import node_client

logger = logging.getLogger("careroute_agent")
logger.setLevel(logging.INFO)

# --- MCP TOOLS DEFINITIONS FOR SUB-AGENTS ---

def list_health_services() -> List[Dict[str, Any]]:
    """Retrieves all active health service categories available in Sri Lanka (e.g. Dental Care, Cardiology, Eye Care, Maternity, Emergency)."""
    return node_client.list_health_services()

def search_facilities(
    district: Optional[str] = None,
    service_id: Optional[str] = None,
    language: Optional[str] = None,
    emergency_only: bool = False
) -> List[Dict[str, Any]]:
    """Searches healthcare facilities in Sri Lanka by district, service ID, language support, or emergency unit capability."""
    return node_client.search_facilities(
        district=district,
        service_id=service_id,
        language=language,
        emergency_only=emergency_only
    )

def get_facility_details(facility_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves full profile details, address, telephone contact, and available services for a specific facility by facility_id."""
    return node_client.get_facility_details(facility_id=facility_id)

def search_doctors(
    specialization: Optional[str] = None,
    facility_id: Optional[str] = None,
    language: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Searches registered medical doctors by specialization, affiliated facility, or language capability."""
    return node_client.search_doctors(
        specialization=specialization,
        facility_id=facility_id,
        language=language
    )

def get_doctor_availability(doctor_id: str, date: str) -> Dict[str, Any]:
    """Retrieves configured schedule availability time slots for a specific doctor on a given date (YYYY-MM-DD)."""
    return node_client.get_doctor_availability(doctor_id=doctor_id, date=date)


# --- SECURITY & SAFETY CHECKPOINT ---
PII_PATTERNS = [
    (r"\b\d{9}[vVxX]\b", "[NIC_REDACTED]"),          # Sri Lanka NIC old format
    (r"\b\d{12}\b", "[NIC_REDACTED]"),               # Sri Lanka NIC new format
    (r"\b(?:\+94|0)?7[0-9]{8}\b", "[PHONE_REDACTED]"),# Sri Lanka Mobile phone
]

INJECTION_KEYWORDS = [
    "ignore previous instructions",
    "override safety",
    "system prompt",
    "drop table",
    "admin mode",
    "bypass authorization",
]

EMERGENCY_RED_FLAGS = [
    "chest pain",
    "cannot breathe",
    "severe bleeding",
    "unconscious",
    "heart attack",
    "stroke",
    "poisoning",
    "suicidal",
]

def security_checkpoint(user_input: str) -> Dict[str, Any]:
    """Scubs PII, detects prompt injection, and checks for medical emergency red flags."""
    clean_text = user_input
    redacted_pii = False
    
    # 1. PII Scrubbing
    for pattern, replacement in PII_PATTERNS:
        if re.search(pattern, clean_text):
            clean_text = re.sub(pattern, replacement, clean_text)
            redacted_pii = True

    # 2. Prompt Injection Detection
    lower_text = clean_text.lower()
    is_injection = any(keyword in lower_text for keyword in INJECTION_KEYWORDS)
    if is_injection:
        logger.warning(f"AUDIT_LOG [CRITICAL] Prompt injection attempt detected: '{clean_text}'")
        return {
            "status": "SECURITY_BLOCK",
            "clean_text": clean_text,
            "message": "Security Alert: Request contains unauthorized system commands.",
            "audit": {"severity": "CRITICAL", "event": "PROMPT_INJECTION"}
        }

    # 3. Emergency Red Flag Detection
    is_emergency = any(flag in lower_text for flag in EMERGENCY_RED_FLAGS)
    if is_emergency:
        logger.info(f"AUDIT_LOG [WARNING] Emergency red flag triggered: '{clean_text}'")
        return {
            "status": "EMERGENCY_REDIRECT",
            "clean_text": clean_text,
            "message": "EMERGENCY ALERT: If you are experiencing a medical emergency, please call 1990 (Suwa Seriya Sri Lanka) or proceed to the nearest emergency hospital immediately.",
            "audit": {"severity": "WARNING", "event": "EMERGENCY_RED_FLAG"}
        }

    logger.info(f"AUDIT_LOG [INFO] Security check passed. PII Redacted: {redacted_pii}")
    return {
        "status": "PASSED",
        "clean_text": clean_text,
        "message": "Passed security check",
        "audit": {"severity": "INFO", "event": "CLEARED"}
    }

# --- SPECIALIZED SUB-AGENTS WITH MCP DOMAIN TOOLS ---

# Sub-Agent 1: Facility Care Specialist
facility_care_specialist = LlmAgent(
    name="facility_care_specialist",
    model=Gemini(model=config.model),
    instruction="""You are the Facility & Care Specialist for CareRoute LK.
Your job is to match healthcare issues to Sri Lankan health service categories (e.g. Dental, Cardiology, Eye Care, Maternity)
and search matching facilities across Sri Lanka districts (e.g., Colombo, Kandy, Galle, Jaffna).
Always provide transparent reasons for matches (e.g. matching district, required health service, emergency capability).
Never diagnose diseases or prescribe medication.
""",
    tools=[list_health_services, search_facilities, get_facility_details],
)

# Sub-Agent 2: Doctor Schedule Specialist
doctor_schedule_specialist = LlmAgent(
    name="doctor_schedule_specialist",
    model=Gemini(model=config.model),
    instruction="""You are the Doctor & Schedule Specialist for CareRoute LK.
Your job is to assist users with finding specialist doctors, checking configured schedule availability slots,
and preparing booking/cancellation proposals.
IMPORTANT: Never execute bookings directly. Always prepare a booking proposal requiring explicit user confirmation.
""",
    tools=[search_doctors, get_doctor_availability],
)

# --- ORCHESTRATOR AGENT ---
safe_care_orchestrator = LlmAgent(
    name="safe_care_orchestrator",
    model=Gemini(model=config.model),
    instruction="""You are the main CareRoute LK Navigation Orchestrator.
Your goal is to assist Sri Lankan users in finding healthcare services, facilities, doctors, and schedules safely.

Safety Policy:
1. Provide navigation advice only. Never diagnose a disease or prescribe treatment.
2. If the user mentions emergency symptoms (chest pain, severe bleeding, unconsciousness), direct them immediately to 1990 Suwa Seriya emergency ambulance service.
3. Use your tools (facility_care_specialist and doctor_schedule_specialist) to assist the user.
4. Keep answers friendly, accurate, and structured.
""",
    tools=[
        AgentTool(agent=facility_care_specialist),
        AgentTool(agent=doctor_schedule_specialist),
    ],
)

root_agent = safe_care_orchestrator

app = App(
    root_agent=root_agent,
    name="app",
)
