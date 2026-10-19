"""Server-owned synthetic CSV. No uploads, scraping, or client-selected paths."""

import csv
import hashlib
import io
from datetime import date, datetime
from html.parser import HTMLParser
from itertools import islice
from pathlib import Path
from urllib.parse import urlsplit

from pydantic import ValidationError

from app.schemas.analysis import NormalizedJob
from app.services.job_sources.base import JobSample, JobSourceError
from app.services.skill_extractor import extract_skills

DEMO_CSV = Path(__file__).resolve().parents[3] / "data" / "demo_junior_data_analyst.csv"
DATASET_VERSION = "synthetic-da-v1"
MAX_BYTES = 1024 * 1024
MAX_SCANNED_ROWS = 100


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.hidden += 1
        if tag in ("p", "br", "li", "div"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.hidden:
            self.hidden -= 1
        if tag in ("p", "li", "div"):
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def clean_text(value: str) -> str:
    parser = PlainText()
    parser.feed(value)
    return "\n".join(" ".join(line.split()) for line in "".join(parser.parts).splitlines()).strip()


def safe_url(value: str) -> str | None:
    try:
        parts = urlsplit(value)
        if (parts.scheme not in ("http", "https") or not parts.hostname
                or parts.username or parts.password or any(char.isspace() or ord(char) < 32 for char in value)):
            return None
        _ = parts.port
        return value
    except ValueError:
        return None


def publication_date(value: str) -> datetime | date | None:
    if not value:
        return None
    try:
        if len(value) == 10:
            return date.fromisoformat(value)
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else None
    except ValueError:
        return None


class CsvDemoProvider:
    def __init__(self, path: Path = DEMO_CSV):
        self.path = path

    def load(self, limit: int, normalized_at: datetime) -> JobSample:
        if not 1 <= limit <= 50:
            raise ValueError("Sample limit must be between 1 and 50.")
        try:
            with self.path.open("rb") as file:
                content = file.read(MAX_BYTES + 1)
            if len(content) > MAX_BYTES:
                raise JobSourceError("The demo CSV exceeds the supported size.")
            reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")), strict=True)
            if not reader.fieldnames or not {"external_id", "title", "description"}.issubset(reader.fieldnames):
                raise JobSourceError("The demo CSV is missing required columns.")
            if len(reader.fieldnames) != len(set(reader.fieldnames)):
                raise JobSourceError("The demo CSV has duplicate column names.")
            jobs, seen, warnings = [], set(), set()
            skipped = examined = 0
            for row in islice(reader, MAX_SCANNED_ROWS):
                examined += 1
                if None in row or any(value is not None and len(value) > 20000 for value in row.values()):
                    skipped += 1
                    continue
                values = {key: (value or "").strip() for key, value in row.items()}
                external_id = values["external_id"]
                if not external_id or external_id in seen:
                    skipped += 1
                    continue
                raw_url = values.get("url", "")
                raw_date = values.get("published_at", "")
                url, published = safe_url(raw_url), publication_date(raw_date)
                if raw_url and not url:
                    warnings.add("An unsafe or malformed vacancy URL was omitted.")
                if raw_date and published is None:
                    warnings.add("An invalid or timezone-ambiguous publication date was omitted.")
                try:
                    job = NormalizedJob(
                        external_id=external_id, title=clean_text(values["title"]),
                        employer=clean_text(values.get("employer", "")) or None,
                        location=clean_text(values.get("location", "")) or None,
                        experience=clean_text(values.get("experience", "")) or None,
                        description=clean_text(values["description"]),
                        published_at=published, url=url,
                        source="skillbridge-synthetic-csv", source_type="csv_demo", is_demo=True,
                        normalized_at=normalized_at,
                        structured_skills=tuple(clean_text(tag) for tag in values.get("structured_skills", "").split("|") if tag.strip()),
                    )
                except ValidationError:
                    skipped += 1
                    continue
                jobs.append(job.model_copy(update={"skills": extract_skills(job)}))
                seen.add(external_id)
                if len(jobs) == limit:
                    break
            if examined == MAX_SCANNED_ROWS and len(jobs) < limit:
                warnings.add("The CSV scan reached the 100-row safety limit.")
            if not jobs:
                raise JobSourceError("The demo CSV contains no usable vacancy records.")
            if skipped:
                warnings.add(f"Skipped {skipped} malformed or duplicate CSV rows.")
            return JobSample(tuple(jobs), DATASET_VERSION, hashlib.sha256(content).hexdigest(),
                             examined, skipped, tuple(sorted(warnings)))
        except (OSError, UnicodeError, csv.Error):
            raise JobSourceError("The demo CSV could not be read safely.") from None
