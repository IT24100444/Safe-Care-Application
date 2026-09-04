import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "False")  # Gemini API key only

@dataclass
class AgentConfig:
    model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    mcp_server_port: int = 8090
    max_iterations: int = 3
    pii_redaction_enabled: bool = True
    injection_detection_enabled: bool = True
    node_api_base_url: str = os.getenv("NODE_API_BASE_URL", "http://localhost:5000/api/v1")
    request_timeout_seconds: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "10"))

config = AgentConfig()
