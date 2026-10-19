"""SkillBridge API with verified, user-scoped profile persistence."""

from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.api.profile import router as profile_router
from app.api.analyses import router as analysis_router
from app.api.roadmap import router as roadmap_router
from app.core.config import get_settings

app = FastAPI(
    title="SkillBridge AI API",
    description="Junior Data Analyst guidance: accounts, deterministic HeadHunter/CSV analysis, and saved learning progress.",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list({get_settings().frontend_origin, "http://127.0.0.1:3000", "http://localhost:3000"}),
    allow_credentials=False,
    allow_methods=["GET", "PUT", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(profile_router)
app.include_router(analysis_router)
app.include_router(roadmap_router)


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    version: str


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    """Report process health; this does not claim external services are connected."""
    return HealthResponse(status="ok", service="skillbridge-api", version=app.version)

