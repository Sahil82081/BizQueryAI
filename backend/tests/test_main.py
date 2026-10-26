from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["service"] == "BizQuery AI"
    assert "database_connected" in data

def test_api_v1_health_get():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_api_v1_health_head():
    response = client.head("/api/v1/health")
    assert response.status_code == 200

def test_health_head():
    response = client.head("/health")
    assert response.status_code == 200

def test_root_get():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_root_head():
    response = client.head("/")
    assert response.status_code == 200
