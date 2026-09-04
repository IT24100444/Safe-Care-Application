# ruff: noqa: E501
import os
import logging
from typing import Dict, Any, List, Optional, Literal
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.config import config
from app.core.safety import run_security_checkpoint
from app.services.node_api_client import node_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("safecare_fastapi")

app = FastAPI(
    title="CareRoute LK Agent Service",
    description="AI Agent Service for CareRoute LK Sri Lanka Healthcare Navigation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC SCHEMAS ---

class RecommendationRequest(BaseModel):
    health_issue: str = Field(..., description="User's described health concern or care category")
    district: Optional[str] = Field(None, description="Selected Sri Lanka district (e.g., Colombo, Kandy, Galle, Jaffna)")
    language: Literal["en", "si", "ta"] = Field("en", description="Preferred language code")
    facility_preference: Optional[str] = Field(None, description="Optional facility preference (e.g. Hospital, Clinic)")
    date: Optional[str] = Field(None, description="Optional target date YYYY-MM-DD")

class ChatRequest(BaseModel):
    sessionId: Optional[str] = Field(None, description="Session identifier")
    message: str = Field(..., description="User's chat message")
    language: Literal["en", "si", "ta"] = Field("en", description="User's selected language")
    authContext: Optional[Dict[str, Any]] = Field(None, description="Trusted user auth claims forwarded from Node API")

# --- DETERMINISTIC MAPPING HELPER ---
SERVICE_KEYWORD_MAP = {
    "teeth": "srv_dental",
    "tooth": "srv_dental",
    "dentist": "srv_dental",
    "dental": "srv_dental",
    "heart": "srv_cardiology",
    "cardio": "srv_cardiology",
    "chest": "srv_cardiology",
    "eye": "srv_eyecare",
    "vision": "srv_eyecare",
    "cataract": "srv_eyecare",
    "optician": "srv_eyecare",
    "pregnant": "srv_maternity",
    "pregnancy": "srv_maternity",
    "baby": "srv_maternity",
    "maternity": "srv_maternity",
    "child": "srv_pediatrics",
    "kid": "srv_pediatrics",
    "pediatric": "srv_pediatrics",
    "emergency": "srv_emergency",
    "trauma": "srv_emergency",
    "accident": "srv_emergency"
}

# --- ENDPOINTS ---

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Service health endpoint."""
    return {"status": "healthy", "service": config.model, "app": "CareRoute LK Agent Service"}

@app.post("/ai/recommend")
def recommend_care(payload: RecommendationRequest):
    """
    POST /ai/recommend
    Structured care-navigation recommendation.
    Performs security check, intent parsing, deterministic ranking of backend facilities, and transparency reasons.
    """
    # 1. Security & Safety Check
    sec_result = run_security_checkpoint(payload.health_issue)
    if sec_result["status"] == "SECURITY_BLOCK":
        raise HTTPException(status_code=400, detail=sec_result["reason"])

    if sec_result["status"] == "EMERGENCY_REDIRECT":
        return {
            "success": True,
            "data": {
                "intent": {
                    "careCategory": "Emergency",
                    "district": payload.district or "Sri Lanka",
                    "language": payload.language,
                    "urgentNavigation": True
                },
                "matches": [],
                "message": sec_result["emergency_message"],
                "disclaimer": "Emergency alert: Call 1990 immediately."
            }
        }

    # 2. Resolve Service Category from health issue
    issue_lower = sec_result["clean_text"].lower()
    target_service_id = None
    target_category_name = "General Care"

    for kw, service_id in SERVICE_KEYWORD_MAP.items():
        if kw in issue_lower:
            target_service_id = service_id
            target_category_name = kw.capitalize()
            break

    # 3. Retrieve Facilities from Node Backend API / Mock Client
    all_facilities = node_client.search_facilities(
        district=payload.district,
        service_id=target_service_id,
        language=payload.language
    )

    # 4. Apply Deterministic Ranking Logic
    ranked_matches = []
    for fac in all_facilities:
        score = 50
        reasons = []

        if target_service_id and target_service_id in fac.get("services", []):
            score += 30
            reasons.append("Provides requested health service category")
        
        if payload.district and fac.get("district", "").lower() == payload.district.lower():
            score += 30
            reasons.append(f"Located in selected district ({payload.district})")

        if payload.language and payload.language in fac.get("languages", []):
            score += 20
            reasons.append(f"Supports selected language ({payload.language})")

        if fac.get("emergency_capable"):
            score += 10
            reasons.append("24/7 Emergency unit capable")

        ranked_matches.append({
            "facilityId": fac["id"],
            "facilityName": fac["name"],
            "district": fac["district"],
            "address": fac["address"],
            "phone": fac["phone"],
            "score": score,
            "reasons": reasons
        })

    # Sort descending by score
    ranked_matches.sort(key=lambda x: x["score"], reverse=True)

    return {
        "success": True,
        "data": {
            "intent": {
                "careCategory": target_category_name,
                "district": payload.district,
                "language": payload.language,
                "facilityPreference": payload.facility_preference
            },
            "matches": ranked_matches,
            "message": f"Found {len(ranked_matches)} healthcare facilities matching your navigation criteria.",
            "disclaimer": "CareRoute LK provides navigation support only and is not a medical diagnosis service."
        }
    }

@app.post("/ai/chat")
def chat_navigation(payload: ChatRequest):
    """
    POST /ai/chat
    Conversational navigation assistant endpoint.
    Performs safety intercept, processes input, and returns structured navigation response.
    """
    sec_result = run_security_checkpoint(payload.message)

    if sec_result["status"] == "SECURITY_BLOCK":
        return {
            "success": False,
            "error": sec_result["reason"]
        }

    if sec_result["status"] == "EMERGENCY_REDIRECT":
        return {
            "success": True,
            "data": {
                "reply": sec_result["emergency_message"],
                "intent": "EMERGENCY_NAVIGATION",
                "language": payload.language,
                "results": [],
                "proposedAction": None,
                "requiresConfirmation": False
            }
        }

    reply_text = f"I am your CareRoute LK Assistant. You asked: '{sec_result['clean_text']}'. I can help locate facilities and doctors across Sri Lankan districts."
    
    return {
        "success": True,
        "data": {
            "reply": reply_text,
            "intent": "CARE_NAVIGATION",
            "language": payload.language,
            "results": [],
            "proposedAction": None,
            "requiresConfirmation": False
        }
    }
