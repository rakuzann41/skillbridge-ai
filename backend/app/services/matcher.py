"""Versioned, equal-weight skill overlap. All arithmetic is deterministic."""

from collections import Counter
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from app.schemas.analysis import AnalysisResult, JobMatch, NormalizedJob, SkillDemand
from app.schemas.profile import UserSkill
from app.services.job_sources.base import JobSample
from app.services.skill_extractor import EXTRACTION_VERSION
from app.services.skills import skill_name

ALGORITHM_VERSION = "skill-overlap-v1"
LEVEL_UNITS = {"not-yet": 0, "learning": 1, "comfortable": 2}


def percentage(numerator: int, denominator: int) -> float:
    return float((Decimal(numerator) * 100 / Decimal(denominator)).quantize(
        Decimal("0.1"), rounding=ROUND_HALF_UP))


def match_job(job: NormalizedJob, user_skills: list[UserSkill]) -> JobMatch:
    levels = {skill.skill_id: skill.level for skill in user_skills}
    recognized = sorted({skill.skill_id for skill in job.skills})
    matching = [skill for skill in recognized if levels.get(skill, "not-yet") == "comfortable"]
    developing = [skill for skill in recognized if levels.get(skill, "not-yet") == "learning"]
    missing = [skill for skill in recognized if levels.get(skill, "not-yet") == "not-yet"]
    units = sum(LEVEL_UNITS[levels.get(skill, "not-yet")] for skill in recognized)
    count = len(recognized)
    return JobMatch(
        job=job, score=percentage(units, 2 * count) if count else None,
        recognized_skill_count=count, earned_credits=units / 2,
        matching_skills=matching, developing_skills=developing, missing_skills=missing,
        explanation=(f"{len(matching)} comfortable, {len(developing)} learning, and {len(missing)} not yet "
                     f"out of {count} distinct recognized skill mentions."
                     if count else "Insufficient data: no known skills were recognized, so no score is calculated."),
    )


def analyze_sample(sample: JobSample, user_skills: list[UserSkill], analysis_id: UUID,
                   analyzed_at: datetime) -> AnalysisResult:
    if not sample.jobs:
        raise ValueError("Cannot analyze an empty sample.")
    ids = [(job.source, job.external_id) for job in sample.jobs]
    if len(ids) != len(set(ids)):
        raise ValueError("A sample must contain unique source vacancy IDs.")
    skill_ids = [skill.skill_id for skill in user_skills]
    if len(skill_ids) != len(set(skill_ids)):
        raise ValueError("Profile skills must be unique.")
    if any(job.source_type != sample.source_type or job.is_demo != sample.is_demo for job in sample.jobs):
        raise ValueError("Sample and vacancy source labels must agree.")
    levels = {skill.skill_id: skill.level for skill in user_skills}
    counts = Counter(skill.skill_id for job in sample.jobs for skill in {item.skill_id: item for item in job.skills}.values())
    demand = [SkillDemand(skill_id=skill_id, skill_name=skill_name(skill_id), vacancy_count=count,
                          percentage=percentage(count, len(sample.jobs)), user_level=levels.get(skill_id, "not-yet"))
              for skill_id, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))]
    matches = [match_job(job if sample.source_type == "live_api" else job.model_copy(update={"normalized_at": analyzed_at}), user_skills) for job in sample.jobs]
    matches.sort(key=lambda match: (match.score is None, -(match.score or 0), match.job.source, match.job.external_id))
    scorable_count = sum(match.score is not None for match in matches)
    warnings = ["A skill mention is not proof that it is mandatory; all recognized mentions have equal weight.",
                *sample.warnings]
    if sample.is_demo:
        warnings.insert(0, "Synthetic fixtures only. These counts do not describe real job-market demand.")
    else:
        warnings.insert(0, "These counts describe only the analyzed sample, not the entire labor market.")
    if scorable_count < len(matches):
        warnings.append(f"{len(matches) - scorable_count} vacancies have no recognized skills and remain unscored; they still count in the sample denominator.")
    return AnalysisResult(
        analysis_id=analysis_id, analyzed_at=analyzed_at,
        source_fetched_at=sample.jobs[0].normalized_at if sample.source_type == "live_api" else None,
        source_type=sample.source_type, is_demo=sample.is_demo, source_label=sample.source_label,
        dataset_version=sample.dataset_version, dataset_sha256=sample.dataset_sha256,
        algorithm_version=ALGORITHM_VERSION, extraction_version=EXTRACTION_VERSION,
        sample_size=len(sample.jobs), scorable_count=scorable_count,
        rows_examined=sample.rows_examined, skipped_rows=sample.skipped_rows,
        profile_skills=sorted(user_skills, key=lambda skill: skill.skill_id),
        skill_demand=demand, strengths=[item.skill_id for item in demand if item.user_level == "comfortable"],
        developing_skills=[item.skill_id for item in demand if item.user_level == "learning"],
        missing_skills=[item.skill_id for item in demand if item.user_level == "not-yet"],
        matches=matches, warnings=warnings,
    )
