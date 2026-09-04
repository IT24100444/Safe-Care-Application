from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_contract() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "service": "CareRoute LK Python Service",
        "status": "healthy",
    }
