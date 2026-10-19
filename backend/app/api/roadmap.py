from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response

from app.api.analyses import get_demo_provider, saved_sample, replay
from app.repositories.analyses import AnalysisRepository, get_analysis_repository
from app.repositories.roadmaps import RoadmapRepository, get_roadmap_repository
from app.schemas.roadmap import CreateRoadmap, RoadmapResponse, UpdateRoadmapItem
from app.services.job_sources.base import JobProvider
from app.services.roadmap import stage_order

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.get("", response_model=RoadmapResponse | None)
async def get_roadmap(response: Response, repository: RoadmapRepository = Depends(get_roadmap_repository)):
    response.headers["Cache-Control"] = "no-store"
    return await repository.get()


@router.post("", response_model=RoadmapResponse)
async def create_roadmap(request: CreateRoadmap, response: Response,
    repository: RoadmapRepository = Depends(get_roadmap_repository),
    analyses: AnalysisRepository = Depends(get_analysis_repository),
    provider: JobProvider = Depends(get_demo_provider)):
    response.headers["Cache-Control"] = "no-store"
    existing = await repository.get()
    if existing is not None:
        return existing
    analysis = None
    if request.analysis_id is not None:
        record = await analyses.get(request.analysis_id)
        analysis = replay(record, saved_sample(record, provider))
    else:
        profile = await repository.profiles.get()
        if profile.updated_at is None:
            raise HTTPException(409, "Save your profile before creating a roadmap.")
    return await repository.create(request.analysis_id, stage_order(analysis))


@router.put("/items/{item_id}", response_model=RoadmapResponse)
async def update_item(item_id: UUID, request: UpdateRoadmapItem, response: Response,
    repository: RoadmapRepository = Depends(get_roadmap_repository)):
    response.headers["Cache-Control"] = "no-store"
    return await repository.update(item_id, request.completed)
