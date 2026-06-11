"""
MHCS AI Analytics Microservice
Placeholder routes for future AI integration:
- sentiment analysis
- risk prediction
- emotional analytics
- recommendation engine
- AI chatbot
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random

app = FastAPI(
    title="MHCS AI Service",
    description="Mental Health Care System - AI Analytics Microservice",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyticsRequest(BaseModel):
    userId: Optional[str] = None
    text: Optional[str] = None
    moodScores: Optional[list[float]] = None
    assessmentScores: Optional[list[float]] = None


class AnalyticsResponse(BaseModel):
    status: str = "placeholder"
    sentiment: Optional[str] = None
    riskScore: Optional[float] = None
    recommendations: Optional[list[str]] = None


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "mhcs-ai"}


@app.post("/api/v1/sentiment", response_model=AnalyticsResponse)
async def sentiment_analysis(request: AnalyticsRequest):
    """Placeholder for sentiment analysis on mood notes and chat."""
    sentiment = "neutral"
    if request.text:
        negative_words = ["sad", "anxious", "hopeless", "stressed", "overwhelmed"]
        if any(w in request.text.lower() for w in negative_words):
            sentiment = "negative"
        elif any(w in request.text.lower() for w in ["happy", "good", "better", "calm"]):
            sentiment = "positive"

    if request.moodScores and len(request.moodScores) > 0:
        avg = sum(request.moodScores) / len(request.moodScores)
        if avg < 4:
            sentiment = "negative"
        elif avg > 7:
            sentiment = "positive"

    return AnalyticsResponse(
        status="placeholder",
        sentiment=sentiment,
        recommendations=["Continue mood tracking", "Explore wellness resources"],
    )


@app.post("/api/v1/risk-prediction", response_model=AnalyticsResponse)
async def risk_prediction(request: AnalyticsRequest):
    """Placeholder for ML-based risk prediction."""
    risk_score = 0.2
    if request.assessmentScores:
        max_score = max(request.assessmentScores)
        risk_score = min(1.0, max_score / 27)

    if request.moodScores and len(request.moodScores) >= 3:
        recent_avg = sum(request.moodScores[:3]) / 3
        if recent_avg < 4:
            risk_score = max(risk_score, 0.7)

    return AnalyticsResponse(
        status="placeholder",
        riskScore=round(risk_score, 2),
        recommendations=[
            "Schedule regular check-ins",
            "Consider speaking with a counsellor",
        ] if risk_score > 0.5 else ["Maintain current wellness practices"],
    )


@app.post("/api/v1/emotional-analytics")
async def emotional_analytics(request: AnalyticsRequest):
    """Placeholder for emotional trend analytics."""
    trend = "stable"
    if request.moodScores and len(request.moodScores) >= 2:
        if request.moodScores[0] < request.moodScores[-1]:
            trend = "improving"
        elif request.moodScores[0] > request.moodScores[-1]:
            trend = "declining"

    return {
        "status": "placeholder",
        "trend": trend,
        "insights": ["AI-powered insights coming soon"],
    }


@app.post("/api/v1/recommendations")
async def get_recommendations(request: AnalyticsRequest):
    """Placeholder for personalized resource recommendations."""
    resources = [
        "Mindfulness Guide",
        "Managing Exam Stress",
        "Peer Support Chat",
    ]
    return {
        "status": "placeholder",
        "recommendations": random.sample(resources, min(2, len(resources))),
    }


@app.post("/api/v1/chatbot")
async def chatbot(request: AnalyticsRequest):
    """Placeholder for AI mental health chatbot."""
    return {
        "status": "placeholder",
        "response": "I'm here to support you. This AI chatbot feature is coming soon. "
        "In the meantime, please explore our resources or speak with a counsellor.",
    }
