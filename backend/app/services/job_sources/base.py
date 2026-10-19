from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Protocol

from app.schemas.analysis import NormalizedJob


class JobSourceError(Exception):
    """A source could not provide a usable, bounded sample."""


@dataclass(frozen=True)
class JobSample:
    jobs: tuple[NormalizedJob, ...]
    dataset_version: str
    dataset_sha256: str
    rows_examined: int
    skipped_rows: int
    warnings: tuple[str, ...] = ()
    source_type: Literal["csv_demo", "csv_static", "live_api"] = "csv_demo"
    is_demo: bool = True
    source_label: str = "Synthetic demo CSV — fictional vacancies, not live jobs"


class JobProvider(Protocol):
    def load(self, limit: int, normalized_at: datetime) -> JobSample: ...
