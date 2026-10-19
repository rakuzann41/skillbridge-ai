"""Verify access tokens with Supabase Auth; never trust a client-supplied user ID."""

from dataclasses import dataclass, field
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings

bearer = HTTPBearer(auto_error=False)


async def get_http_client():
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=False) as client:
        yield client


@dataclass(frozen=True)
class CurrentUser:
    id: UUID
    access_token: str = field(repr=False)


def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=401,
        detail="Your session is missing or expired. Please sign in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    client: httpx.AsyncClient = Depends(get_http_client),
) -> CurrentUser:
    if credentials is None or len(credentials.credentials) > 16384:
        raise unauthorized()
    settings = get_settings()
    if not settings.supabase_configured:
        raise HTTPException(503, "Account storage is not configured yet.")
    try:
        response = await client.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={
                "apikey": settings.supabase_publishable_key,
                "Authorization": f"Bearer {credentials.credentials}",
            },
        )
    except httpx.RequestError:
        raise HTTPException(503, "Cannot reach the account service. Please try again.") from None
    if response.status_code in (401, 403):
        raise unauthorized()
    if response.status_code != 200:
        raise HTTPException(503, "The account service is temporarily unavailable.")
    try:
        user_id = UUID(response.json()["id"])
    except (ValueError, KeyError, TypeError, AttributeError):
        raise HTTPException(503, "The account service returned an invalid response.") from None
    return CurrentUser(id=user_id, access_token=credentials.credentials)
