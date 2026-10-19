import httpx
from fastapi import Depends, HTTPException
from pydantic import ValidationError

from app.core.auth import CurrentUser, get_current_user, get_http_client, unauthorized
from app.core.config import get_settings
from app.schemas.profile import ProfileResponse, ProfileWrite


class ProfileRepository:
    def __init__(self, client: httpx.AsyncClient, user: CurrentUser):
        self.client = client
        self.user = user
        settings = get_settings()
        self.base_url = f"{settings.supabase_url}/rest/v1"
        # A user's access token keeps RLS active. No service-role key is used.
        self.headers = {
            "apikey": settings.supabase_publishable_key,
            "Authorization": f"Bearer {user.access_token}",
        }

    async def request(self, method: str, path: str, headers_override: dict | None = None, **kwargs) -> httpx.Response:
        try:
            response = await self.client.request(
                method, f"{self.base_url}/{path}", headers={**self.headers, **(headers_override or {})}, **kwargs
            )
        except httpx.RequestError:
            raise HTTPException(503, "Profile storage is unavailable. Please try again.") from None
        if response.status_code == 401:
            raise unauthorized()
        if response.status_code == 403:
            raise HTTPException(403, "You do not have access to this profile.")
        if not response.is_success:
            # Do not expose upstream database errors or request headers.
            raise HTTPException(503, "Could not access your profile. Check the database setup or try again.")
        return response

    async def get(self) -> ProfileResponse:
        response = await self.request("GET", "profiles", params={
            "user_id": f"eq.{self.user.id}",
            "select": "display_name,education,experience,target_role,updated_at,user_skills(skill_id,level)",
        })
        try:
            rows = response.json()
            if not isinstance(rows, list) or len(rows) > 1:
                raise ValueError("Unexpected profile response")
            if not rows:
                return ProfileResponse(skills=[])
            row = rows[0]
            return ProfileResponse.model_validate({
                **{key: value for key, value in row.items() if key != "user_skills"},
                "skills": row["user_skills"],
            })
        except (ValueError, TypeError, KeyError, AttributeError, ValidationError):
            raise HTTPException(503, "Profile storage returned an invalid response.") from None

    async def save(self, profile: ProfileWrite) -> ProfileResponse:
        # One PostgreSQL transaction updates the profile and replaces its skills.
        response = await self.request("POST", "rpc/save_my_profile", json={
            "p_display_name": profile.display_name,
            "p_education": profile.education,
            "p_experience": profile.experience,
            "p_skills": [skill.model_dump() for skill in profile.skills],
        })
        try:
            return ProfileResponse.model_validate(response.json())
        except (ValueError, TypeError, ValidationError):
            raise HTTPException(503, "The save could not be confirmed. Reload your profile before trying again.") from None


def get_profile_repository(
    user: CurrentUser = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_http_client),
) -> ProfileRepository:
    return ProfileRepository(client, user)
