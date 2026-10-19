from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.profile import SkillId, SkillLevel, UserSkill


class SkillEvidence(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")
    skill_id: SkillId
    skill_name: str
    source_field: Literal["structured_skills", "description"]
    matched_alias: str
    requirement_status: Literal["mentioned"] = "mentioned"


class NormalizedJob(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")
    external_id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=200)
    employer: str | None = Field(default=None, max_length=160)
    location: str | None = Field(default=None, max_length=160)
    published_at: datetime | date | None = None
    url: str | None = None
    description: str = Field(default="", max_length=20000)
    experience: str | None = Field(default=None, max_length=160)
    source: str
    source_type: Literal["csv_demo", "csv_static", "live_api"]
    is_demo: bool
    normalized_at: datetime
    structured_skills: tuple[str, ...] = Field(default=(), max_length=100)
    skills: tuple[SkillEvidence, ...] = Field(default=(), max_length=11)


class JobMatch(BaseModel):
    job: NormalizedJob
    score: float | None
    recognized_skill_count: int
    earned_credits: float
    matching_skills: list[SkillId]
    developing_skills: list[SkillId]
    missing_skills: list[SkillId]
    explanation: str


class SkillDemand(BaseModel):
    skill_id: SkillId
    skill_name: str
    vacancy_count: int
    percentage: float
    user_level: SkillLevel


class CreateAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source: Literal["csv_demo", "headhunter"]
    sample_limit: int = Field(default=8, ge=1, le=50, strict=True)
    accept_hh_terms: bool = Field(default=False, strict=True)

    @model_validator(mode="after")
    def validate_live_request(self):
        if self.source == "headhunter" and (self.sample_limit > 10 or not self.accept_hh_terms):
            raise ValueError("Live analysis requires agreement acceptance and a limit of at most 10.")
        return self


class AnalysisResult(BaseModel):
    analysis_id: UUID
    analyzed_at: datetime
    source_fetched_at: datetime | None = None
    target_role: Literal["Junior Data Analyst"] = "Junior Data Analyst"
    source_type: Literal["csv_demo", "csv_static", "live_api"] = "csv_demo"
    is_demo: bool = True
    source_label: str = "Synthetic demo CSV — fictional vacancies, not live jobs"
    dataset_version: str
    dataset_sha256: str
    algorithm_version: str
    extraction_version: str
    sample_size: int
    scorable_count: int
    rows_examined: int
    skipped_rows: int
    profile_skills: list[UserSkill]
    skill_demand: list[SkillDemand]
    strengths: list[SkillId]
    developing_skills: list[SkillId]
    missing_skills: list[SkillId]
    matches: list[JobMatch]
    warnings: list[str]
    score_meaning: str = "Estimated overlap with recognized skill mentions; not a hiring probability."
    formula: str = "100 × (comfortable skills + 0.5 × learning skills) / distinct recognized vacancy skills"
