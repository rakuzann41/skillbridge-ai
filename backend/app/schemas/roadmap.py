from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.profile import SkillId, UserSkill

StageKey = Literal["python", "sql", "excel", "pandas", "visualization", "project"]


class LearningResource(BaseModel):
    model_config = ConfigDict(extra="forbid")
    label: str
    url: str
    note: str


class RoadmapStage(BaseModel):
    model_config = ConfigDict(extra="forbid")
    stage_key: StageKey
    title: str
    description: str
    outcome: str
    skill_ids: list[SkillId]
    resources: list[LearningResource]


class RoadmapItem(RoadmapStage):
    id: UUID
    position: int = Field(ge=1, le=6)
    completed: bool
    completed_at: datetime | None
    focus_skills: list[str] = []


class RoadmapResponse(BaseModel):
    id: UUID
    target_role: Literal["Junior Data Analyst"]
    template_version: Literal["junior-da-v1"]
    created_at: datetime
    updated_at: datetime
    source_analysis_id: UUID | None
    source_type: Literal["csv_demo", "live_api"] | None
    analyzed_at: datetime | None
    profile_skills: list[UserSkill]
    items: list[RoadmapItem]
    completed_count: int
    total_count: int
    progress_percentage: int
    next_item_id: UUID | None


class CreateRoadmap(BaseModel):
    model_config = ConfigDict(extra="forbid")
    analysis_id: UUID | None = None


class UpdateRoadmapItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    completed: bool = Field(strict=True)
