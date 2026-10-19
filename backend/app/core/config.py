import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


@dataclass(frozen=True)
class Settings:
    supabase_url: str
    supabase_publishable_key: str
    frontend_origin: str
    hh_access_token: str = field(default="", repr=False)
    hh_user_agent: str = ""
    analysis_signing_key: str = field(default="", repr=False)

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_publishable_key)


@lru_cache
def get_settings() -> Settings:
    return Settings(
        supabase_url=os.getenv("SUPABASE_URL", os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")).strip().rstrip("/"),
        supabase_publishable_key=os.getenv("SUPABASE_PUBLISHABLE_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "")).strip(),
        frontend_origin=os.getenv("FRONTEND_ORIGIN", os.getenv("RENDER_EXTERNAL_URL", "http://127.0.0.1:3000")).strip(),
        hh_access_token=os.getenv("HH_ACCESS_TOKEN", "").strip(),
        hh_user_agent=os.getenv("HH_USER_AGENT", "").strip(),
        analysis_signing_key=os.getenv("ANALYSIS_SIGNING_KEY", "").strip(),
    )
