"""Persist only inputs; reconstruct scores from trusted, fingerprinted source data."""

from datetime import datetime
from uuid import UUID

from fastapi import Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from app.repositories.profiles import ProfileRepository, get_profile_repository
from app.schemas.profile import ProfileWrite, UserSkill
from app.services.job_sources.base import JobSample
from app.core.config import get_settings
from app.services.analysis_snapshot import snapshot_payload, signature, verify_signature, sample_from_snapshot
from app.services.matcher import ALGORITHM_VERSION
from app.services.skill_extractor import EXTRACTION_VERSION


class StoredAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: UUID
    created_at: datetime
    source_type: str
    sample_limit: int = Field(ge=1, le=50)
    profile_skills: list[UserSkill] = Field(max_length=11)
    dataset_sha256: str = Field(pattern=r"^[a-f0-9]{64}$")
    dataset_version: str
    algorithm_version: str
    extraction_version: str
    vacancy_snapshot: dict | None = None
    snapshot_signature: str | None = Field(default=None, pattern=r"^[a-f0-9]{64}$")

    @field_validator("profile_skills")
    @classmethod
    def validate_skills(cls, value):
        return ProfileWrite(skills=value).skills


# CSV records predate the live-source migration and do not use snapshot columns.
COLUMNS = "id,created_at,source_type,sample_limit,profile_skills,dataset_sha256,dataset_version,algorithm_version,extraction_version"
LIVE_COLUMNS = f"{COLUMNS},vacancy_snapshot,snapshot_signature"
SIGNED_FIELDS = {"source_type", "sample_limit", "profile_skills", "dataset_sha256", "dataset_version", "algorithm_version", "extraction_version", "vacancy_snapshot"}


class AnalysisRepository:
    def __init__(self, profiles: ProfileRepository):
        self.profiles = profiles

    async def check_live_storage(self):
        # Check the required schema with zero rows before spending the provider quota.
        # The caller's token and ownership filter remain in force.
        try:
            response = await self.profiles.request("GET", "analyses", params={
                "select": "vacancy_snapshot,snapshot_signature",
                "user_id": f"eq.{self.profiles.user.id}", "limit": "0",
            })
            if response.json() != []:
                raise ValueError("Invalid storage check response")
        except HTTPException as error:
            if error.status_code == 401:
                raise
            raise self.live_storage_unavailable() from None
        except (ValueError, TypeError):
            raise self.live_storage_unavailable() from None

    @staticmethod
    def live_storage_unavailable():
        return HTTPException(503, {
            "code": "storage_unavailable",
            "message": "Live results cannot be saved right now. Try later or choose Demo CSV.",
            "fallback_available": True,
        })

    def validate_record(self, row) -> StoredAnalysis:
        record = StoredAnalysis.model_validate(row)
        if record.source_type == "live_api":
            if record.vacancy_snapshot is None or record.snapshot_signature is None:
                raise ValueError("Missing snapshot authentication")
            fields = record.model_dump(mode="json", include=SIGNED_FIELDS)
            verify_signature(self.profiles.user.id, fields, record.snapshot_signature, get_settings().analysis_signing_key)
            sample_from_snapshot(record.vacancy_snapshot, record.dataset_sha256)
        elif record.vacancy_snapshot is not None or record.snapshot_signature is not None:
            raise ValueError("Unexpected snapshot on legacy record")
        return record

    async def save(self, sample: JobSample, skills: list[UserSkill], sample_limit: int) -> StoredAnalysis:
        data = {
            "user_id": str(self.profiles.user.id),
            "sample_limit": sample_limit,
            "profile_skills": [skill.model_dump() for skill in skills],
            "dataset_sha256": sample.dataset_sha256,
        }
        if sample.source_type == "live_api":
            data.update(source_type="live_api", dataset_version=sample.dataset_version,
                        algorithm_version=ALGORITHM_VERSION, extraction_version=EXTRACTION_VERSION,
                        vacancy_snapshot=snapshot_payload(sample))
            try:
                data["snapshot_signature"] = signature(self.profiles.user.id,
                    {key: data[key] for key in SIGNED_FIELDS}, get_settings().analysis_signing_key)
            except ValueError:
                raise HTTPException(503, "Live analysis storage needs its server signing key.") from None
        # Algorithm/extraction versions remain pinned by database defaults and column grants.
        stored_data = {key: value for key, value in data.items() if key not in ("algorithm_version", "extraction_version")}
        response = await self.profiles.request("POST", "analyses", json=stored_data,
            params={"select": LIVE_COLUMNS if sample.source_type == "live_api" else COLUMNS},
            headers_override={"Prefer": "return=representation"})
        try:
            rows = response.json()
            if not isinstance(rows, list) or len(rows) != 1:
                raise ValueError("Unconfirmed analysis save")
            record = self.validate_record(rows[0])
            if sample.source_type == "live_api" and record.snapshot_signature != data["snapshot_signature"]:
                raise ValueError("Unconfirmed live save")
            return record
        except (ValueError, TypeError, ValidationError):
            raise HTTPException(503, "The analysis save could not be confirmed. Please try again.") from None

    async def read_row(self, analysis_id: UUID, columns: str) -> dict:
        response = await self.profiles.request("GET", "analyses", params={
            "id": f"eq.{analysis_id}", "user_id": f"eq.{self.profiles.user.id}", "select": columns,
        })
        try:
            rows = response.json()
            if not isinstance(rows, list) or len(rows) > 1:
                raise ValueError("Invalid analysis response")
            if not rows:
                raise HTTPException(404, "Analysis not found in your account.")
            if not isinstance(rows[0], dict):
                raise ValueError("Invalid analysis row")
            return rows[0]
        except (ValueError, TypeError):
            raise HTTPException(503, "The saved analysis could not be read safely.") from None

    async def get(self, analysis_id: UUID) -> StoredAnalysis:
        row = await self.read_row(analysis_id, COLUMNS)
        try:
            if row.get("source_type") == "live_api":
                # Both reads enforce ownership. Live data still requires its complete,
                # authenticated snapshot; it can never fall back to the CSV provider.
                row = await self.read_row(analysis_id, LIVE_COLUMNS)
                if row.get("source_type") != "live_api":
                    raise ValueError("Analysis source changed during read")
            return self.validate_record(row)
        except (ValueError, TypeError, ValidationError):
            raise HTTPException(503, "The saved analysis could not be read safely.") from None


def get_analysis_repository(profiles: ProfileRepository = Depends(get_profile_repository)) -> AnalysisRepository:
    return AnalysisRepository(profiles)
