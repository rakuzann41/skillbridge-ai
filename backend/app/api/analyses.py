from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response

from app.repositories.analyses import AnalysisRepository, StoredAnalysis, get_analysis_repository
from app.schemas.analysis import AnalysisResult, CreateAnalysis
from app.services.job_sources.base import JobProvider, JobSourceError
from app.services.job_sources.csv_provider import CsvDemoProvider
from app.services.matcher import ALGORITHM_VERSION, analyze_sample
from app.services.skill_extractor import EXTRACTION_VERSION
from app.services.job_sources.headhunter import HeadHunterProvider, LiveSourceError, get_live_provider
from app.services.analysis_snapshot import sample_from_snapshot
from app.core.config import get_settings

router = APIRouter(prefix="/analyses", tags=["analysis"])


def get_demo_provider() -> JobProvider:
    return CsvDemoProvider()


def load_sample(provider: JobProvider, limit: int, timestamp: datetime):
    try:
        sample = provider.load(limit, timestamp)
    except JobSourceError as error:
        raise HTTPException(503, str(error)) from None
    identities = [(job.source, job.external_id) for job in sample.jobs]
    if (not sample.jobs or len(sample.jobs) > limit or len(identities) != len(set(identities))
            or any(not job.is_demo or job.source_type != "csv_demo" for job in sample.jobs)):
        raise HTTPException(503, "The demo source returned an invalid sample.")
    return sample


def replay(record: StoredAnalysis, sample) -> AnalysisResult:
    if (record.source_type not in ("csv_demo", "live_api") or record.algorithm_version != ALGORITHM_VERSION
            or record.extraction_version != EXTRACTION_VERSION
            or record.dataset_version != sample.dataset_version
            or record.dataset_sha256 != sample.dataset_sha256):
        raise HTTPException(409, "This saved analysis uses a different dataset or algorithm version. Run a new analysis; the old inputs have not been changed.")
    return analyze_sample(sample, record.profile_skills, record.id, record.created_at)


def saved_sample(record: StoredAnalysis, provider: JobProvider):
    if record.source_type == "live_api":
        try:
            return sample_from_snapshot(record.vacancy_snapshot, record.dataset_sha256)
        except (ValueError, TypeError):
            raise HTTPException(503, "This saved vacancy snapshot could not be read safely.") from None
    return load_sample(provider, record.sample_limit, record.created_at)


@router.post("", response_model=AnalysisResult, status_code=201)
async def create_analysis(
    request: CreateAnalysis, response: Response,
    repository: AnalysisRepository = Depends(get_analysis_repository),
    provider: JobProvider = Depends(get_demo_provider),
    live_provider: HeadHunterProvider = Depends(get_live_provider),
) -> AnalysisResult:
    profile = await repository.profiles.get()
    if profile.updated_at is None:
        raise HTTPException(409, "Save your profile before starting an analysis. All skills may be marked Not yet.")
    if request.source == "headhunter":
        if len(get_settings().analysis_signing_key) < 32:
            raise HTTPException(503, {"code": "not_configured", "message": "Live analysis storage needs its server signing key.", "fallback_available": True})
        try:
            sample = await live_provider.load(request.sample_limit, datetime.now(timezone.utc))
        except LiveSourceError as error:
            raise HTTPException(503, {"code": error.code, "message": str(error), "fallback_available": True},
                                headers={"Retry-After": str(error.retry_after)} if error.retry_after else None) from None
    else:
        sample = load_sample(provider, request.sample_limit, datetime.now(timezone.utc))
    record = await repository.save(sample, profile.skills, request.sample_limit)
    response.headers["Cache-Control"] = "no-store"
    return replay(record, sample)


@router.get("/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(
    analysis_id: UUID, response: Response,
    repository: AnalysisRepository = Depends(get_analysis_repository),
    provider: JobProvider = Depends(get_demo_provider),
) -> AnalysisResult:
    record = await repository.get(analysis_id)
    sample = saved_sample(record, provider)
    response.headers["Cache-Control"] = "no-store"
    return replay(record, sample)
