"""Authenticate server-fetched vacancy facts without giving the browser privileged DB credentials."""

import hashlib
import hmac
import json
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.analysis import NormalizedJob
from app.services.job_sources.base import JobSample


class LiveSnapshot(BaseModel):
    model_config = ConfigDict(extra="forbid")
    jobs: tuple[NormalizedJob, ...] = Field(min_length=1, max_length=10)
    rows_examined: int = Field(ge=1, le=20)
    skipped_rows: int = Field(ge=0, le=20)
    warnings: tuple[str, ...] = Field(max_length=10)

    @model_validator(mode="after")
    def validate_source(self):
        if (self.rows_examined != len(self.jobs) + self.skipped_rows
                or len({job.external_id for job in self.jobs}) != len(self.jobs)
                or any(job.source != "headhunter" or job.source_type != "live_api" or job.is_demo for job in self.jobs)):
            raise ValueError("Invalid live snapshot")
        return self


def snapshot_payload(sample: JobSample) -> dict:
    return LiveSnapshot(jobs=sample.jobs, rows_examined=sample.rows_examined,
                        skipped_rows=sample.skipped_rows, warnings=sample.warnings).model_dump(mode="json")


def signature(owner: UUID, fields: dict, key: str) -> str:
    if len(key) < 32:
        raise ValueError("Snapshot signing key is not configured")
    body = json.dumps({"owner": str(owner), **fields}, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hmac.new(key.encode(), body.encode(), hashlib.sha256).hexdigest()


def verify_signature(owner: UUID, fields: dict, supplied: str, key: str):
    if not hmac.compare_digest(signature(owner, fields, key), supplied):
        raise ValueError("Untrusted snapshot")


def sample_from_snapshot(payload: dict, fingerprint: str) -> JobSample:
    snapshot = LiveSnapshot.model_validate(payload)
    content = json.dumps([job.model_dump(mode="json") for job in snapshot.jobs], sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    if hashlib.sha256(content.encode()).hexdigest() != fingerprint:
        raise ValueError("Snapshot fingerprint mismatch")
    return JobSample(snapshot.jobs, "headhunter-snapshot-v1", fingerprint, snapshot.rows_examined,
                     snapshot.skipped_rows, snapshot.warnings, "live_api", False,
                     "HeadHunter API — saved vacancy snapshot")
