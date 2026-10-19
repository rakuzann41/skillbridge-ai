from datetime import datetime
from uuid import UUID

from fastapi import Depends, HTTPException
from pydantic import BaseModel, ConfigDict, ValidationError, model_validator

from app.repositories.profiles import ProfileRepository, get_profile_repository
from app.schemas.profile import ProfileWrite, UserSkill
from app.schemas.roadmap import RoadmapItem, RoadmapResponse
from app.services.roadmap import reviewed_stages
from app.services.skills import SKILLS


class RoadmapRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: UUID
    target_role: str
    template_version: str
    created_at: datetime
    updated_at: datetime
    source_analysis_id: UUID | None
    source_type: str | None
    analyzed_at: datetime | None
    profile_skills: list[UserSkill]
    items: list[RoadmapItem]

    @model_validator(mode="after")
    def validate_snapshot(self):
        ProfileWrite(skills=self.profile_skills)
        catalog = {stage.stage_key: stage for stage in reviewed_stages()}
        if len(self.items) != 6 or {item.stage_key for item in self.items} != set(catalog):
            raise ValueError("Incomplete roadmap")
        if sorted(item.position for item in self.items) != list(range(1, 7)) or len({item.id for item in self.items}) != 6:
            raise ValueError("Invalid stage identities or order")
        positions = {item.stage_key: item.position for item in self.items}
        if positions["python"] > positions["pandas"] or positions["project"] != 6:
            raise ValueError("Invalid prerequisite order")
        for item in self.items:
            content = item.model_dump(include=set(type(catalog[item.stage_key]).model_fields))
            if content != catalog[item.stage_key].model_dump() or item.focus_skills:
                raise ValueError("Unreviewed roadmap content")
            if item.completed != (item.completed_at is not None):
                raise ValueError("Invalid completion timestamp")
        if (self.source_analysis_id is None) != (self.source_type is None) or (self.source_analysis_id is None) != (self.analyzed_at is None):
            raise ValueError("Invalid source metadata")
        return self


class RoadmapRepository:
    def __init__(self, profiles: ProfileRepository):
        self.profiles = profiles

    async def get(self) -> RoadmapResponse | None:
        response = await self.profiles.request("POST", "rpc/get_my_roadmap", json={})
        try:
            payload = response.json()
            if payload is None:
                return None
            record = RoadmapRecord.model_validate(payload)
            items = sorted(record.items, key=lambda item: item.position)
            levels = {skill.skill_id: skill.level for skill in record.profile_skills}
            # Labels come from the reviewed vocabulary, not arbitrary user text.
            names = {skill_id: value[0] for skill_id, value in SKILLS.items()}
            for item in items:
                item.focus_skills = [names[skill] for skill in item.skill_ids if levels.get(skill, "not-yet") != "comfortable"]
            done = sum(item.completed for item in items)
            return RoadmapResponse.model_validate({**record.model_dump(), "items": items,
                "completed_count": done, "total_count": len(items),
                "progress_percentage": (done * 100 + len(items) // 2) // len(items),
                "next_item_id": next((item.id for item in items if not item.completed), None)})
        except (ValueError, TypeError, KeyError, ValidationError):
            raise HTTPException(503, "Your roadmap could not be read safely. Please try again.") from None

    async def create(self, analysis_id: UUID | None, order: list[str]) -> RoadmapResponse:
        response = await self.profiles.request("POST", "rpc/create_my_roadmap", json={
            "p_source_analysis_id": str(analysis_id) if analysis_id else None, "p_stage_order": order,
        })
        try:
            raw_id = response.json()
            if not isinstance(raw_id, str):
                raise ValueError("Invalid saved roadmap ID")
            saved_id = UUID(raw_id)
        except (ValueError, TypeError):
            raise HTTPException(503, "The roadmap save could not be confirmed.") from None
        result = await self.get()
        if result is None or result.id != saved_id:
            raise HTTPException(503, "The roadmap save could not be confirmed. Reload before trying again.")
        return result

    async def update(self, item_id: UUID, completed: bool) -> RoadmapResponse:
        response = await self.profiles.request("POST", "rpc/set_my_roadmap_item", json={"p_item_id": str(item_id), "p_completed": completed})
        try:
            updated = response.json()
        except ValueError:
            raise HTTPException(503, "The progress save could not be confirmed.") from None
        if updated is False:
            raise HTTPException(404, "Roadmap stage not found in your account.")
        if updated is not True:
            raise HTTPException(503, "The progress save could not be confirmed.")
        result = await self.get()
        if result is None:
            raise HTTPException(503, "Reload your roadmap to confirm saved progress.")
        return result


def get_roadmap_repository(profiles: ProfileRepository = Depends(get_profile_repository)) -> RoadmapRepository:
    return RoadmapRepository(profiles)
