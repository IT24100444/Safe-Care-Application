# CareRoute LK Agent Service — Submission Write-Up

## 1. Problem Statement
Patients in Sri Lanka often struggle to navigate complex healthcare choices across districts, healthcare facilities, specialist doctors, and languages (English, Sinhala, Tamil). Existing systems require manual searching across fragmented directories without clear guidance on facility services, emergency capability, or doctor availability.

CareRoute LK resolves this by providing a safe, multi-agent AI care navigation assistant that maps user symptoms/requests into structured care categories and queries authoritative Node.js backend data without hallucinating clinical diagnoses or medical entities.

## 2. Solution Architecture
```
React Frontend UI
      │
      ▼
FastAPI Agent Service (app/main.py)
      │
      ▼
Security Checkpoint (app/core/safety.py)
      │
      ▼
Safe Care Orchestrator (app/agent.py)
 ├──> Facility Care Specialist (LlmAgent)
 └──> Doctor Schedule Specialist (LlmAgent)
      │
      ▼
Safe Care MCP Server (app/mcp_server.py)
 ├── list_health_services
 ├── search_facilities
 ├── get_facility_details
 ├── search_doctors
 └── get_doctor_availability
      │
      ▼
Node.js API / MongoDB Atlas (app/services/node_api_client.py)
```

## 3. Core Concepts Used
- **ADK Multi-Agent Architecture** ([`app/agent.py`](file:///c:/Users/akmal/Desktop/3.1/Software%20Engineering%20Framework/hackathon/AI%20Agent/safe-care-application/app/agent.py)): Implements `safe_care_orchestrator` with two specialized `LlmAgent` sub-agents (`facility_care_specialist` and `doctor_schedule_specialist`) using `AgentTool` delegation.
- **MCP Server** ([`app/mcp_server.py`](file:///c:/Users/akmal/Desktop/3.1/Software%20Engineering%20Framework/hackathon/AI%20Agent/safe-care-application/app/mcp_server.py)): FastMCP server exposing 5 domain-specific tools connecting to backend healthcare datasets.
- **Security Checkpoint** ([`app/core/safety.py`](file:///c:/Users/akmal/Desktop/3.1/Software%20Engineering%20Framework/hackathon/AI%20Agent/safe-care-application/app/core/safety.py)): Multi-layer defense enforcing PII redaction, prompt injection keyword blocking, red-flag emergency redirects (1990 Suwa Seriya), and structured JSON audit logging.
- **Agents CLI & Playground**: Scaffolding via `google-agents-cli` with Makefile commands (`make playground`, `make run`, `make test`).

## 4. Security Design
- **PII Scrubbing**: Automatically detects and replaces Sri Lankan Old NICs (`921234567V`), New NICs (`199212345678`), and mobile numbers (`0771234567`) with `[REDACTED]` markers.
- **Prompt Injection Defense**: Keyword scanner blocks unauthorized system prompts or override attempts before LLM evaluation.
- **Emergency Safeguard**: Instantly intercepts chest pain, severe bleeding, or unconsciousness inputs and redirects users to 1990 Suwa Seriya ambulance service.
- **Non-Clinical Policy**: Enforces non-diagnostic disclaimers to prevent medical prescription or dosage recommendations.

## 5. MCP Server Design
1. `list_health_services`: Fetches active health service categories (Dental, Cardiology, Ophthalmology, Maternity, Pediatrics, Emergency).
2. `search_facilities`: Filters healthcare facilities by Sri Lankan district, health service ID, language support (`en`, `si`, `ta`), and 24/7 emergency unit status.
3. `get_facility_details`: Retrieves comprehensive contact info, telephone numbers, and addresses.
4. `search_doctors`: Searches registered specialist doctors by specialization and affiliated facility.
5. `get_doctor_availability`: Reads configured schedule availability time slots.

## 6. HITL (Human-in-the-Loop) Booking Flow
To prevent unintended writes or direct LLM execution:
1. User requests a doctor booking (e.g. "Book Dr. Ruwan Perera tomorrow at 10:00").
2. Agent prepares a **booking proposal** detailing doctor, facility, date, and slot.
3. UI presents a explicit "Confirm Booking" dialog.
4. Appointment write is performed by the Node.js API only after explicit user confirmation.

## 7. Demo Walkthrough
- **Test 1**: Facility search for dental care in Colombo -> returns Asiri Central Hospital with transparent ranking reasons.
- **Test 2**: Cardiology doctor schedule query -> returns Dr. Ruwan Perera's configured slots (`09:00`, `10:30`, `14:00`).
- **Test 3**: Emergency input ("chest pain") -> triggers immediate call prompt for Sri Lanka 1990 Suwa Seriya ambulance service.

## 8. Impact & Value Statement
CareRoute LK empowers patients across Sri Lanka to quickly identify suitable, language-compatible healthcare facilities and specialist doctors while protecting patient privacy and enforcing clinical safety standards.
