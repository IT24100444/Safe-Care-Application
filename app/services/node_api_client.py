# ruff: noqa: E501
import os
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import config

logger = logging.getLogger("node_api_client")

# Mock fallback dataset matching CareRoute LK schema for offline / standalone execution
MOCK_HEALTH_SERVICES = [
    {"id": "srv_dental", "name": "Dental Care", "category": "Dental", "description": "Oral health, teeth cleaning, fillings, and dental surgery"},
    {"id": "srv_cardiology", "name": "Cardiology Services", "category": "Cardiology", "description": "Heart care, ECG, echo, and cardiovascular diagnosis"},
    {"id": "srv_eyecare", "name": "Eye Care & Ophthalmology", "category": "Eye Care", "description": "Vision checkup, cataract surgery, and eye treatment"},
    {"id": "srv_maternity", "name": "Maternity & Obstetrics", "category": "Maternity", "description": "Prenatal care, delivery services, and gynecology"},
    {"id": "srv_emergency", "name": "Emergency Trauma Unit", "category": "Emergency", "description": "24/7 critical emergency trauma and resuscitation"},
    {"id": "srv_pediatrics", "name": "Child Healthcare & Pediatrics", "category": "Pediatrics", "description": "Childhood vaccinations, growth monitoring, pediatric care"},
]

MOCK_FACILITIES = [
    {
        "id": "fac_001",
        "name": "Asiri Central Hospital Colombo",
        "district": "Colombo",
        "address": "114 Norris Canal Rd, Colombo 01000",
        "phone": "+94 11 466 5500",
        "emergency_capable": True,
        "services": ["srv_dental", "srv_cardiology", "srv_eyecare", "srv_emergency", "srv_maternity"],
        "languages": ["en", "si", "ta"],
        "rating": 4.8
    },
    {
        "id": "fac_002",
        "name": "Kandy Teaching Hospital",
        "district": "Kandy",
        "address": "William Gopallawa Mawatha, Kandy 20000",
        "phone": "+94 81 222 2261",
        "emergency_capable": True,
        "services": ["srv_cardiology", "srv_emergency", "srv_maternity", "srv_pediatrics"],
        "languages": ["en", "si", "ta"],
        "rating": 4.6
    },
    {
        "id": "fac_003",
        "name": "Galle Karapitiya National Hospital",
        "district": "Galle",
        "address": "Karapitiya, Galle 80000",
        "phone": "+94 91 223 2261",
        "emergency_capable": True,
        "services": ["srv_dental", "srv_eyecare", "srv_emergency", "srv_pediatrics"],
        "languages": ["en", "si", "ta"],
        "rating": 4.5
    },
    {
        "id": "fac_004",
        "name": "Nawaloka Hospital Colombo",
        "district": "Colombo",
        "address": "23 Deshamanya H. K. Dharmadasa Mawatha, Colombo 00200",
        "phone": "+94 11 557 7111",
        "emergency_capable": True,
        "services": ["srv_dental", "srv_cardiology", "srv_eyecare", "srv_maternity"],
        "languages": ["en", "si"],
        "rating": 4.7
    },
    {
        "id": "fac_005",
        "name": "Jaffna Teaching Hospital",
        "district": "Jaffna",
        "address": "Hospital Rd, Jaffna 40000",
        "phone": "+94 21 222 2261",
        "emergency_capable": True,
        "services": ["srv_dental", "srv_eyecare", "srv_emergency", "srv_maternity", "srv_pediatrics"],
        "languages": ["en", "ta"],
        "rating": 4.6
    }
]

MOCK_DOCTORS = [
    {
        "id": "doc_101",
        "name": "Dr. Ruwan Perera",
        "specialization": "Cardiology",
        "facility_id": "fac_001",
        "facility_name": "Asiri Central Hospital Colombo",
        "languages": ["en", "si"],
        "services": ["srv_cardiology"]
    },
    {
        "id": "doc_102",
        "name": "Dr. Sivakumaran Nathan",
        "specialization": "Ophthalmology",
        "facility_id": "fac_001",
        "facility_name": "Asiri Central Hospital Colombo",
        "languages": ["en", "ta"],
        "services": ["srv_eyecare"]
    },
    {
        "id": "doc_103",
        "name": "Dr. Anusha De Silva",
        "specialization": "Pediatrics",
        "facility_id": "fac_002",
        "facility_name": "Kandy Teaching Hospital",
        "languages": ["en", "si", "ta"],
        "services": ["srv_pediatrics"]
    },
    {
        "id": "doc_104",
        "name": "Dr. Gamini Fernando",
        "specialization": "Dental Care",
        "facility_id": "fac_004",
        "facility_name": "Nawaloka Hospital Colombo",
        "languages": ["en", "si"],
        "services": ["srv_dental"]
    }
]

MOCK_SCHEDULES = [
    {"doctor_id": "doc_101", "date": "2026-09-05", "slots": ["09:00", "10:30", "14:00"]},
    {"doctor_id": "doc_102", "date": "2026-09-05", "slots": ["10:00", "11:30", "15:00"]},
    {"doctor_id": "doc_103", "date": "2026-09-05", "slots": ["08:30", "11:00", "13:30"]},
    {"doctor_id": "doc_104", "date": "2026-09-05", "slots": ["09:30", "11:30", "16:00"]}
]

class NodeApiClient:
    """Client for CareRoute LK Node.js Express Backend with offline mock fallback."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or config.node_api_base_url
        self.timeout = config.request_timeout_seconds

    def list_health_services(self) -> List[Dict[str, Any]]:
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(f"{self.base_url}/health-services")
                if resp.status_code == 200:
                    return resp.json().get("data", [])
        except Exception as e:
            logger.debug(f"Backend offline/unreachable: {e}. Using mock health services.")
        return MOCK_HEALTH_SERVICES

    def search_facilities(
        self,
        district: Optional[str] = None,
        service_id: Optional[str] = None,
        language: Optional[str] = None,
        emergency_only: bool = False
    ) -> List[Dict[str, Any]]:
        try:
            params = {}
            if district: params["district"] = district
            if service_id: params["serviceId"] = service_id
            if language: params["language"] = language
            if emergency_only: params["emergency"] = "true"

            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(f"{self.base_url}/facilities", params=params)
                if resp.status_code == 200:
                    return resp.json().get("data", [])
        except Exception as e:
            logger.debug(f"Backend offline/unreachable: {e}. Filtering mock facilities.")
        
        results = MOCK_FACILITIES
        if district:
            results = [f for f in results if f["district"].lower() == district.lower()]
        if service_id:
            results = [f for f in results if service_id in f["services"]]
        if language:
            results = [f for f in results if language.lower() in [l.lower() for l in f["languages"]]]
        if emergency_only:
            results = [f for f in results if f.get("emergency_capable", False)]
        return results

    def get_facility_details(self, facility_id: str) -> Optional[Dict[str, Any]]:
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(f"{self.base_url}/facilities/{facility_id}")
                if resp.status_code == 200:
                    return resp.json().get("data")
        except Exception as e:
            logger.debug(f"Backend offline/unreachable: {e}. Searching mock facilities.")
        
        for fac in MOCK_FACILITIES:
            if fac["id"] == facility_id:
                return fac
        return None

    def search_doctors(
        self,
        specialization: Optional[str] = None,
        facility_id: Optional[str] = None,
        language: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        try:
            params = {}
            if specialization: params["specialization"] = specialization
            if facility_id: params["facilityId"] = facility_id
            if language: params["language"] = language

            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(f"{self.base_url}/doctors", params=params)
                if resp.status_code == 200:
                    return resp.json().get("data", [])
        except Exception as e:
            logger.debug(f"Backend offline/unreachable: {e}. Filtering mock doctors.")
        
        results = MOCK_DOCTORS
        if specialization:
            results = [d for d in results if specialization.lower() in d["specialization"].lower()]
        if facility_id:
            results = [d for d in results if d["facility_id"] == facility_id]
        if language:
            results = [d for d in results if language.lower() in [l.lower() for l in d["languages"]]]
        return results

    def get_doctor_availability(self, doctor_id: str, date: str) -> Dict[str, Any]:
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(f"{self.base_url}/doctors/{doctor_id}/availability", params={"date": date})
                if resp.status_code == 200:
                    return resp.json().get("data", {})
        except Exception as e:
            logger.debug(f"Backend offline/unreachable: {e}. Querying mock schedules.")
        
        for sched in MOCK_SCHEDULES:
            if sched["doctor_id"] == doctor_id and sched["date"] == date:
                return {"doctorId": doctor_id, "date": date, "availableSlots": sched["slots"]}
        
        # Default fallback schedule slots if date matches
        return {"doctorId": doctor_id, "date": date, "availableSlots": ["09:00", "11:00", "14:30"]}

node_client = NodeApiClient()
