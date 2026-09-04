# ruff: noqa: E501
import logging
from typing import Optional, List, Dict, Any
from mcp.server.fastmcp import FastMCP
from app.services.node_api_client import node_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp_server")

# Initialize MCP Server with stdio transport
mcp = FastMCP("CareRoute LK MCP Tools")

@mcp.tool()
def list_health_services() -> List[Dict[str, Any]]:
    """Retrieves all active health service categories available in Sri Lanka (e.g. Dental Care, Cardiology, Eye Care, Maternity, Emergency)."""
    logger.info("MCP Tool Executed: list_health_services")
    return node_client.list_health_services()

@mcp.tool()
def search_facilities(
    district: Optional[str] = None,
    service_id: Optional[str] = None,
    language: Optional[str] = None,
    emergency_only: bool = False
) -> List[Dict[str, Any]]:
    """Searches healthcare facilities in Sri Lanka by district, service ID, language support, or emergency unit capability."""
    logger.info(f"MCP Tool Executed: search_facilities (district={district}, service_id={service_id}, language={language}, emergency_only={emergency_only})")
    return node_client.search_facilities(
        district=district,
        service_id=service_id,
        language=language,
        emergency_only=emergency_only
    )

@mcp.tool()
def get_facility_details(facility_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves full profile details, address, telephone contact, and available services for a specific facility by facility_id."""
    logger.info(f"MCP Tool Executed: get_facility_details (facility_id={facility_id})")
    return node_client.get_facility_details(facility_id=facility_id)

@mcp.tool()
def search_doctors(
    specialization: Optional[str] = None,
    facility_id: Optional[str] = None,
    language: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Searches registered medical doctors by specialization, affiliated facility, or language capability."""
    logger.info(f"MCP Tool Executed: search_doctors (specialization={specialization}, facility_id={facility_id}, language={language})")
    return node_client.search_doctors(
        specialization=specialization,
        facility_id=facility_id,
        language=language
    )

@mcp.tool()
def get_doctor_availability(doctor_id: str, date: str) -> Dict[str, Any]:
    """Retrieves configured schedule availability time slots for a specific doctor on a given date (YYYY-MM-DD)."""
    logger.info(f"MCP Tool Executed: get_doctor_availability (doctor_id={doctor_id}, date={date})")
    return node_client.get_doctor_availability(doctor_id=doctor_id, date=date)

if __name__ == "__main__":
    mcp.run(transport="stdio")
