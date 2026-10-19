"""Run from backend/: .venv/Scripts/python.exe scripts/setup_headhunter.py

Reads credentials without echo, exchanges them once at the official API, and
stores the token only in the ignored backend/.env. Never prints credentials.
"""

import getpass
from pathlib import Path
import re
import secrets

import httpx
from dotenv import dotenv_values, set_key

ENV = Path(__file__).resolve().parents[1] / ".env"


def main():
    print("Use this after your SkillBridge AI application is approved at https://dev.hh.ru/admin.")
    email = input("Your application's real contact email: ").strip()
    if not re.fullmatch(r"[^\s<>@()]+@[^\s<>@()]+\.[^\s<>@()]+", email):
        raise SystemExit("Please enter a valid contact email.")
    agent = f"SkillBridgeAI/0.1 ({email})"
    client_id = getpass.getpass("Application client ID (hidden): ").strip()
    client_secret = getpass.getpass("Application client secret (hidden): ").strip()
    if not client_id or not client_secret:
        raise SystemExit("No request made: both application credentials are required.")
    # No retries: requesting a replacement token invalidates the previous one.
    try:
        response = httpx.post("https://api.hh.ru/token", timeout=10, follow_redirects=False,
            headers={"HH-User-Agent": agent}, data={"grant_type": "client_credentials",
                "client_id": client_id, "client_secret": client_secret})
        if response.status_code != 200:
            raise SystemExit(f"Token request failed (HTTP {response.status_code}). Check application approval and credentials. No file changes made.")
        payload = response.json()
        token = payload.get("access_token") if isinstance(payload, dict) else None
        if not isinstance(token, str) or not token or any(char.isspace() for char in token):
            raise SystemExit("Token response was invalid. No file changes made.")
    except (httpx.RequestError, ValueError):
        raise SystemExit("Could not reach/read HeadHunter safely. No file changes made.") from None
    existing = dotenv_values(ENV) if ENV.exists() else {}
    if not ENV.exists():
        ENV.touch(mode=0o600)
    set_key(ENV, "HH_USER_AGENT", agent)
    set_key(ENV, "HH_ACCESS_TOKEN", token)
    if not existing.get("ANALYSIS_SIGNING_KEY"):
        set_key(ENV, "ANALYSIS_SIGNING_KEY", secrets.token_hex(32))
    print("Saved the application token, contact header, and snapshot signing key to backend/.env.")
    print("Restart FastAPI. Keep the signing key backed up privately: saved live results need the same key.")


if __name__ == "__main__":
    main()
