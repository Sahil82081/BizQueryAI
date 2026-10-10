import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_refresh_schema_indexing():
    response = client.post("/api/schema/refresh")
    assert response.status_code == 200
    
def test_index_status():
    response = client.get("/api/schema/index-status")
    assert response.status_code == 200
    data = response.json()
    assert "total_indexed" in data
    assert "tables_in_mapping" in data
    
def test_schema_retrieval():
    response = client.post("/api/schema/test-retrieval", json={"query": "employees", "top_k": 5})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)
