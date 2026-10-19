"""One reviewed, versioned roadmap. No generated links or inferred completion."""

import json
from functools import lru_cache
from pathlib import Path

from app.schemas.analysis import AnalysisResult
from app.schemas.roadmap import RoadmapStage

CATALOG_PATH = Path(__file__).resolve().parents[2] / "data" / "roadmap_v1.json"


@lru_cache
def reviewed_stages() -> tuple[RoadmapStage, ...]:
    return tuple(RoadmapStage.model_validate(stage) for stage in json.loads(CATALOG_PATH.read_text(encoding="utf-8")))


def stage_order(analysis: AnalysisResult | None = None) -> list[str]:
    stages = reviewed_stages()
    if analysis is None:
        return [stage.stage_key for stage in stages]
    demand = {skill.skill_id: skill.vacancy_count for skill in analysis.skill_demand if skill.user_level != "comfortable"}
    weights = {stage.stage_key: sum(demand.get(skill, 0) for skill in stage.skill_ids) for stage in stages}
    # Keep Python before pandas, and put the project last. Stable template order
    # breaks equal weights. Counts set practice emphasis, never job scores.
    remaining = list(stages[:-1])
    ordered = []
    while remaining:
        available = [stage for stage in remaining if stage.stage_key != "pandas" or "python" in ordered]
        selected = max(available, key=lambda stage: weights[stage.stage_key])
        ordered.append(selected.stage_key)
        remaining.remove(selected)
    return ordered + ["project"]
