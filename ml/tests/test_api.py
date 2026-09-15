from fastapi.testclient import TestClient

from ml.api import app


client = TestClient(app)

VALID_PAYLOAD = {
    "project_id": "TEST-001",
    "project_type": "Highway",
    "state": "Gujarat",
    "district": "Rajkot",
    "land_area_hectares": 12.5,
    "affected_families": 80,
    "documentation_completeness": 68.1,
    "approval_progress": 55.0,
    "compensation_progress": 42.0,
    "legal_dispute_count": 2,
    "pending_notifications": 3,
    "ownership_conflict_count": 1,
    "rehabilitation_progress": 35.0,
    "stakeholder_responsiveness": 48.0,
    "department_coordination_score": 52.0,
    "possession_progress": 30.0,
    "current_stage": "Compensation",
    "days_elapsed": 420,
    "target_duration_days": 360,
}


def test_root_endpoint_returns_success():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "LAPREDICT ML API"
    assert data["status"] == "running"


def test_health_endpoint_returns_healthy_status():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_predict_accepts_valid_project_data():
    response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200

    data = response.json()
    assert "project_id" in data
    assert data["project_id"] == "TEST-001"
    assert "risk_score" in data
    assert "risk_category" in data
    assert "delay_probability" in data
    assert "predicted_delay" in data
    assert "top_risk_factors" in data
    assert "recommendations" in data
    assert "model_version" in data


def test_prediction_fields_are_valid_ranges():
    response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200

    data = response.json()
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_category"] in {"Low", "Medium", "High"}
    assert 0 <= data["delay_probability"] <= 1
    assert data["predicted_delay"] in {0, 1}
    assert isinstance(data["top_risk_factors"], list)
    assert isinstance(data["recommendations"], list)


def test_invalid_values_are_rejected():
    invalid_payload = {**VALID_PAYLOAD, "progress": 120}
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422

    invalid_count_payload = {**VALID_PAYLOAD, "legal_dispute_count": -1}
    response = client.post("/predict", json=invalid_count_payload)
    assert response.status_code == 422
