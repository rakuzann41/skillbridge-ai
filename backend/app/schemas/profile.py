from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

SkillId = Literal[
    "python", "sql", "excel", "pandas", "relational-databases", "data-cleaning",
    "statistics", "data-visualization", "power-bi", "tableau", "git",
]
SkillLevel = Literal["not-yet", "learning", "comfortable"]


class UserSkill(BaseModel):
    model_config = ConfigDict(extra="forbid")

    skill_id: SkillId
    level: SkillLevel


class ProfileWrite(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    display_name: str = Field(default="", max_length=80)
    education: str = Field(default="", max_length=200)
    experience: str = Field(default="", max_length=500)
    target_role: Literal["Junior Data Analyst"] = "Junior Data Analyst"
    skills: list[UserSkill] = Field(max_length=11)

    @field_validator("skills")
    @classmethod
    def unique_skills(cls, value: list[UserSkill]) -> list[UserSkill]:
        ids = [skill.skill_id for skill in value]
        if len(ids) != len(set(ids)):
            raise ValueError("Each skill can appear only once.")
        return value


class ProfileResponse(ProfileWrite):
    updated_at: datetime | None = None
