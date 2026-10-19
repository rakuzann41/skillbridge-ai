from fastapi import APIRouter, Depends, Response

from app.repositories.profiles import ProfileRepository, get_profile_repository
from app.schemas.profile import ProfileResponse, ProfileWrite

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    response: Response,
    repository: ProfileRepository = Depends(get_profile_repository),
) -> ProfileResponse:
    response.headers["Cache-Control"] = "no-store"
    return await repository.get()


@router.put("/profile", response_model=ProfileResponse)
async def save_profile(
    profile: ProfileWrite,
    response: Response,
    repository: ProfileRepository = Depends(get_profile_repository),
) -> ProfileResponse:
    response.headers["Cache-Control"] = "no-store"
    return await repository.save(profile)
