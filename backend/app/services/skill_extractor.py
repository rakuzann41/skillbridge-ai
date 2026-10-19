"""Conservative alias extraction with explicit evidence and no LLM calls."""

import re
import unicodedata

from app.schemas.analysis import NormalizedJob, SkillEvidence
from app.services.skills import SKILLS

EXTRACTION_VERSION = "canonical-aliases-v1"
CLAUSES = re.compile(r"[.;!?\n]+|\bbut\b", re.IGNORECASE)
# Omit uncertain negative clauses rather than converting negation into demand.
NEGATION = re.compile(r"\b(?:no|not|without|never|unnecessary)\b|\bnot[- ]required\b", re.IGNORECASE)


def normalize_text(text: str) -> str:
    return " ".join(unicodedata.normalize("NFKC", text).casefold().split())


PATTERNS = {
    skill_id: tuple((alias, re.compile(r"(?<!\w)" + re.escape(alias) + r"(?!\w)"))
                    for alias in sorted(aliases, key=lambda value: (-len(value), value)))
    for skill_id, (_, aliases) in SKILLS.items()
}


def extract_skills(job: NormalizedJob) -> tuple[SkillEvidence, ...]:
    found = {}
    for tag in job.structured_skills:
        normalized = normalize_text(tag)
        for skill_id, (name, aliases) in SKILLS.items():
            if normalized in aliases and skill_id not in found:
                found[skill_id] = SkillEvidence(
                    skill_id=skill_id, skill_name=name,
                    source_field="structured_skills", matched_alias=normalized,
                )
    for clause in CLAUSES.split(job.description):
        normalized = normalize_text(clause)
        if NEGATION.search(normalized):
            continue
        for skill_id, patterns in PATTERNS.items():
            if skill_id in found:
                continue
            for alias, pattern in patterns:
                if pattern.search(normalized):
                    found[skill_id] = SkillEvidence(
                        skill_id=skill_id, skill_name=SKILLS[skill_id][0],
                        source_field="description", matched_alias=alias,
                    )
                    break
    return tuple(found[skill_id] for skill_id in sorted(found))
