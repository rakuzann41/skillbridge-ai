"""Bounded official API access. Never follow vacancy-provided URLs or retry a CAPTCHA."""

import asyncio
import hashlib
import json
import re
import threading
import time
from datetime import datetime, timedelta

import httpx
from fastapi import Depends
from pydantic import ValidationError

from app.core.config import Settings, get_settings
from app.schemas.analysis import NormalizedJob
from app.services.job_sources.base import JobSample, JobSourceError
from app.services.job_sources.csv_provider import clean_text, publication_date
from app.services.skill_extractor import extract_skills

DATASET_VERSION = "headhunter-snapshot-v1"
SEARCH_TEXT = '"data analyst" OR "аналитик данных"'
EXPERIENCE = {"noExperience", "between1And3"}
SENIOR = re.compile(r"\b(senior|lead|head|middle|principal|manager|старший|ведущий|руководитель|главный)\b", re.I)
ROLE = re.compile(r"\bdata\s+analyst\b|аналитик\w*\s+данных", re.I)
MAX_BODY = 1024 * 1024


class LiveSourceError(JobSourceError):
    def __init__(self, code: str, message: str, retry_after: int | None = None):
        super().__init__(message)
        self.code, self.retry_after = code, retry_after


class SourceState:
    """One bounded cache and one in-flight collection per process, shared across accounts."""
    def __init__(self):
        self.lock = threading.Lock()
        self.sample = None
        self.limit = 0
        self.expires = 0.0
        self.blocked_until = 0.0
        self.next_collection_at = 0.0
        self.configuration = ""


STATE = SourceState()


def get_live_provider(settings: Settings = Depends(get_settings)):
    # The HTTP client is opened lazily for a live request, never for demo/replay.
    return HeadHunterProvider(None, settings)


def text(value, size: int) -> str | None:
    if not isinstance(value, str):
        return None
    return clean_text(value)[:size] or None


def normalize_vacancy(raw: dict, expected_id: str, stamp: datetime) -> NormalizedJob | None:
    if not isinstance(raw, dict) or raw.get("id") != expected_id or raw.get("archived") is not False:
        return None
    title = text(raw.get("name"), 200)
    experience = raw.get("experience")
    if (not title or not ROLE.search(title) or SENIOR.search(title)
            or not isinstance(experience, dict) or experience.get("id") not in EXPERIENCE):
        return None
    published = publication_date(raw.get("published_at", "")) if isinstance(raw.get("published_at"), str) else None
    # Do not call undated, future-dated, or old records live vacancies.
    if not isinstance(published, datetime) or not stamp - timedelta(days=30) <= published <= stamp + timedelta(minutes=5):
        return None
    description = raw.get("description")
    if not isinstance(description, str) or len(description) > 100000:
        return None
    tags = raw.get("key_skills", [])
    if not isinstance(tags, list):
        tags = []
    structured = tuple(tag for item in tags[:100] if isinstance(item, dict)
                       and (tag := text(item.get("name"), 160)))
    def nested(field):
        value = raw.get(field)
        return text(value.get("name"), 160) if isinstance(value, dict) else None
    try:
        job = NormalizedJob(
            external_id=expected_id, title=title, employer=nested("employer"), location=nested("area"),
            description=clean_text(description)[:20000], experience=nested("experience"),
            published_at=published, normalized_at=stamp,
            # Construct a source URL from the numeric ID, never trust an upstream arbitrary URL.
            url=f"https://hh.ru/vacancy/{expected_id}", source="headhunter", source_type="live_api",
            is_demo=False, structured_skills=structured,
        )
        return job.model_copy(update={"skills": extract_skills(job)})
    except (ValidationError, ValueError):
        return None


class HeadHunterProvider:
    def __init__(self, client: httpx.AsyncClient | None, settings: Settings, state: SourceState = STATE):
        self.client, self.settings, self.state = client, settings, state

    def configured(self):
        agent = self.settings.hh_user_agent
        token = self.settings.hh_access_token
        return (bool(token) and token.isascii() and not any(char.isspace() or ord(char) < 32 for char in token)
                and agent.isascii() and len(agent) <= 200
                and re.fullmatch(r"SkillBridgeAI/[\w.]+ \([^\s<>@()]+@[^\s<>@()]+\.[^\s<>@()]+\)", agent) is not None)

    async def request(self, path: str, params=None):
        async with self.client.stream("GET", f"https://api.hh.ru{path}", params=params, headers={
            "HH-User-Agent": self.settings.hh_user_agent,
            "Authorization": f"Bearer {self.settings.hh_access_token}",
            "Accept": "application/json",
        }) as response:
            if response.status_code in (401, 403, 429):
                retry = response.headers.get("Retry-After", "60")
                seconds = min(86400, max(60, int(retry))) if re.fullmatch(r"[0-9]{1,8}", retry) else 60
                self.state.blocked_until = time.monotonic() + seconds
                code = "rate_limited" if response.status_code == 429 else "access_unavailable"
                raise LiveSourceError(code, "HeadHunter has limited access. Try later or choose Demo CSV.", seconds)
            if response.status_code in (404, 410):
                return None
            if response.status_code != 200:
                raise LiveSourceError("upstream_unavailable", "HeadHunter is temporarily unavailable. Try later or choose Demo CSV.")
            body = bytearray()
            async for chunk in response.aiter_bytes():
                body.extend(chunk)
                if len(body) > MAX_BODY:
                    raise LiveSourceError("invalid_response", "HeadHunter returned an oversized response. Choose Demo CSV or try later.")
            try:
                value = json.loads(body)
                if not isinstance(value, dict):
                    raise ValueError()
                return value
            except (ValueError, UnicodeError):
                raise LiveSourceError("invalid_response", "HeadHunter returned an unreadable response. Choose Demo CSV or try later.") from None

    async def load(self, limit: int, stamp: datetime) -> JobSample:
        if not 1 <= limit <= 10:
            raise ValueError("Live sample limit must be 1–10.")
        if not self.configured():
            raise LiveSourceError("not_configured", "Live jobs need the application's HeadHunter token and contact header. Demo CSV is available.")
        if self.client is None:
            # Separate from Supabase transport: account tokens never go to HeadHunter.
            async with httpx.AsyncClient(timeout=httpx.Timeout(5, connect=3), follow_redirects=False) as client:
                return await HeadHunterProvider(client, self.settings, self.state).load(limit, stamp)
        config_id = hashlib.sha256((self.settings.hh_access_token + self.settings.hh_user_agent).encode()).hexdigest()
        if config_id != self.state.configuration:
            self.state.configuration = config_id
            self.state.sample = None
            self.state.blocked_until = self.state.next_collection_at = 0.0
        if time.monotonic() < self.state.blocked_until:
            raise LiveSourceError("rate_limited", "HeadHunter access is cooling down. Try later or choose Demo CSV.", max(1, int(self.state.blocked_until-time.monotonic())))
        if self.state.sample and self.state.limit == limit and time.monotonic() < self.state.expires:
            return self.state.sample
        if time.monotonic() < self.state.next_collection_at:
            raise LiveSourceError("rate_limited", "A sample was collected recently. Try again later or choose Demo CSV.", 60)
        if not self.state.lock.acquire(blocking=False):
            raise LiveSourceError("busy", "A vacancy collection is already running. Try again shortly.", 5)
        try:
            async with asyncio.timeout(22):
                sample = await self.collect(limit, stamp)
            self.state.sample, self.state.limit = sample, limit
            self.state.expires = time.monotonic() + 300
            self.state.next_collection_at = time.monotonic() + 60
            return sample
        except (httpx.RequestError, TimeoutError):
            self.state.blocked_until = time.monotonic() + 30
            raise LiveSourceError("timeout", "HeadHunter could not be reached in time. Try later or choose Demo CSV.") from None
        finally:
            self.state.lock.release()

    async def collect(self, limit, stamp):
        # A single page and at most ten detail requests; no crawl, background polling, or automatic retries.
        payload = await self.request("/vacancies", [
            ("text", SEARCH_TEXT), ("search_field", "name"), ("experience", "noExperience"),
            ("experience", "between1And3"), ("period", "30"), ("order_by", "publication_time"),
            ("per_page", "20"), ("page", "0"), ("locale", "EN"),
        ])
        if payload is None or not isinstance(payload.get("items"), list):
            raise LiveSourceError("invalid_response", "HeadHunter returned an invalid search result. Choose Demo CSV or try later.")
        candidates, seen = [], set()
        examined = 0
        for item in payload["items"][:20]:
            examined += 1
            if not isinstance(item, dict):
                continue
            job_id, title = item.get("id"), text(item.get("name"), 200)
            if (not isinstance(job_id, str) or not re.fullmatch(r"[0-9]{1,20}", job_id)
                    or job_id in seen or not title or not ROLE.search(title) or SENIOR.search(title)):
                continue
            seen.add(job_id)
            candidates.append(job_id)
            if len(candidates) == limit:
                break
        jobs = []
        # Sequential requests stop immediately on quota/auth errors and remain within a total deadline.
        for job_id in candidates:
            raw = await self.request(f"/vacancies/{job_id}", {"locale": "EN"})
            if raw is not None and (job := normalize_vacancy(raw, job_id, stamp)):
                jobs.append(job)
        if not jobs:
            raise LiveSourceError("no_results", "No usable junior Data Analyst vacancies were found in this search. Try later or choose Demo CSV.")
        content = json.dumps([job.model_dump(mode="json") for job in jobs], sort_keys=True, ensure_ascii=False, separators=(",", ":"))
        warnings = ["HeadHunter title search: data analyst / аналитик данных; no experience or 1–3 years; all regions; published within 30 days. Language coverage is limited to the current skill vocabulary.",
                    "Saved source snapshot; vacancy availability may have changed. Check the original listing."]
        if len(jobs) < limit:
            warnings.append(f"Only {len(jobs)} of up to {limit} requested vacancies passed validation. No demo records were mixed in.")
        return JobSample(tuple(jobs), DATASET_VERSION, hashlib.sha256(content.encode()).hexdigest(), examined,
                         examined-len(jobs), tuple(warnings), "live_api", False,
                         "HeadHunter API — saved vacancy snapshot")
