from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_sentiment():
    response = client.post(
        "/api/v1/sentiment",
        json={"text": "I feel anxious and stressed", "moodScores": [3, 2, 4]},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sentiment"] == "negative"


def test_risk_prediction():
    response = client.post(
        "/api/v1/risk-prediction",
        json={"assessmentScores": [18], "moodScores": [2, 2, 3]},
    )
    assert response.status_code == 200
    assert "riskScore" in response.json()
