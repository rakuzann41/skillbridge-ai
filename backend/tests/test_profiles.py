"""Exercise the API with a fake Supabase transport; no real accounts or data."""

import json
import os
import unittest
from unittest.mock import patch
from uuid import UUID

import httpx
from fastapi.testclient import TestClient

from app.core.auth import CurrentUser, get_http_client
from app.core.config import get_settings
from app.main import app

USER_A = "10000000-0000-0000-0000-000000000001"
USER_B = "10000000-0000-0000-0000-000000000002"
TOKENS = {"test-a": USER_A, "test-b": USER_B}


class ProfileTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {
            "SUPABASE_URL": "https://supabase.test",
            "SUPABASE_PUBLISHABLE_KEY": "test-publishable-key",
        })
        self.env.start()
        get_settings.cache_clear()
        self.rows = {}
        self.requests = []
        self.auth_status = 200
        self.database_status = 200
        self.auth_timeout = False
        self.database_timeout = False
        self.invalid_auth = False
        self.invalid_database = False

        async def fake_client():
            async with httpx.AsyncClient(transport=httpx.MockTransport(self.transport)) as client:
                yield client

        app.dependency_overrides[get_http_client] = fake_client
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()
        app.dependency_overrides.clear()
        self.env.stop()
        get_settings.cache_clear()

    def transport(self, request):
        self.requests.append(request)
        self.assertEqual(request.headers["apikey"], "test-publishable-key")
        token = request.headers["authorization"].removeprefix("Bearer ")
        owner = TOKENS.get(token)
        if request.url.path == "/auth/v1/user":
            if self.auth_timeout:
                raise httpx.ReadTimeout("upstream unavailable", request=request)
            if not owner or self.auth_status != 200:
                return httpx.Response(self.auth_status if owner else 401, json={"error": "private upstream detail"})
            return httpx.Response(200, json={"id": "malformed" if self.invalid_auth else owner})
        if self.database_timeout:
            raise httpx.ConnectTimeout("upstream unavailable", request=request)
        if self.database_status != 200:
            return httpx.Response(self.database_status, json={"message": "private database detail"})
        if self.invalid_database:
            return httpx.Response(200, json={"unexpected": True})
        if request.method == "GET":
            self.assertEqual(request.url.path, "/rest/v1/profiles")
            self.assertEqual(request.url.params["user_id"], f"eq.{owner}")
            row = self.rows.get(owner)
            return httpx.Response(200, json=[{
                **{k: v for k, v in row.items() if k != "skills"}, "user_skills": row["skills"],
            }] if row else [])
        self.assertEqual(request.url.path, "/rest/v1/rpc/save_my_profile")
        data = json.loads(request.content)
        self.assertEqual(set(data), {"p_display_name", "p_education", "p_experience", "p_skills"})
        row = {"display_name": data["p_display_name"], "education": data["p_education"],
               "experience": data["p_experience"], "target_role": "Junior Data Analyst",
               "skills": data["p_skills"], "updated_at": "2026-10-19T10:00:00Z"}
        self.rows[owner] = row
        return httpx.Response(200, json=row)

    def headers(self, token="test-a"):
        return {"Authorization": f"Bearer {token}"}

    def profile(self, name="Student A"):
        return {"display_name": name, "education": "Studying economics", "experience": "",
                "target_role": "Junior Data Analyst", "skills": [{"skill_id": "sql", "level": "learning"}]}

    def test_private_routes_require_bearer_token(self):
        for headers in ({}, {"Authorization": "Basic invalid"}, {"Authorization": "Bearer"}):
            for method in ("get", "put"):
                with self.subTest(headers=headers, method=method):
                    kwargs = {"json": self.profile()} if method == "put" else {}
                    response = getattr(self.client, method)("/profile", headers=headers, **kwargs)
                    self.assertEqual(response.status_code, 401)
        self.assertEqual(self.requests, [])

    def test_invalid_and_expired_tokens_are_rejected_before_database_access(self):
        for token in ("invalid", "expired"):
            response = self.client.get("/profile", headers=self.headers(token))
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.headers["www-authenticate"], "Bearer")
        self.assertTrue(all(request.url.path == "/auth/v1/user" for request in self.requests))

    def test_new_user_has_a_blank_profile(self):
        response = self.client.get("/profile", headers=self.headers())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["skills"], [])
        self.assertIsNone(response.json()["updated_at"])
        self.assertEqual(response.headers["cache-control"], "no-store")

    def test_profile_and_skills_round_trip_and_replace(self):
        data = self.profile()
        data["display_name"] = "  Student A  "
        saved = self.client.put("/profile", headers=self.headers(), json=data)
        self.assertEqual(saved.status_code, 200)
        self.assertEqual(saved.json()["display_name"], "Student A")
        restored = self.client.get("/profile", headers=self.headers())
        self.assertEqual(restored.json(), saved.json())
        data["skills"] = []
        self.assertEqual(self.client.put("/profile", headers=self.headers(), json=data).status_code, 200)
        self.assertEqual(self.client.get("/profile", headers=self.headers()).json()["skills"], [])
        writes = [request for request in self.requests if request.method == "POST"]
        self.assertEqual(len(writes), 2)
        self.assertTrue(all(request.url.path.endswith("/rpc/save_my_profile") for request in writes))

    def test_two_users_do_not_share_profiles_or_skill_values(self):
        self.client.put("/profile", headers=self.headers(), json=self.profile("Student A"))
        data = self.profile("Student B")
        data["skills"] = [{"skill_id": "excel", "level": "comfortable"}]
        self.client.put("/profile", headers=self.headers("test-b"), json=data)
        a = self.client.get(f"/profile?user_id={USER_B}", headers=self.headers()).json()
        b = self.client.get("/profile", headers=self.headers("test-b")).json()
        self.assertEqual(a["display_name"], "Student A")
        self.assertEqual(a["skills"][0]["skill_id"], "sql")
        self.assertEqual(b["display_name"], "Student B")
        self.assertEqual(b["skills"][0]["skill_id"], "excel")

    def test_client_cannot_choose_owner_or_other_career_track(self):
        for field, value in (("user_id", USER_B), ("target_role", "Software Engineer")):
            with self.subTest(field=field):
                self.assertEqual(self.client.put("/profile", headers=self.headers(), json={**self.profile(), field: value}).status_code, 422)
        self.assertEqual(self.rows, {})

    def test_unknown_duplicate_or_invalid_skill_is_rejected(self):
        cases = [
            [{"skill_id": "invented", "level": "learning"}],
            [{"skill_id": "sql", "level": "expert"}],
            [{"skill_id": "sql", "level": "learning"}] * 2,
            [{"skill_id": "sql", "level": "learning", "user_id": USER_B}],
        ]
        for skills in cases:
            with self.subTest(skills=skills):
                response = self.client.put("/profile", headers=self.headers(), json={**self.profile(), "skills": skills})
                self.assertEqual(response.status_code, 422)
        self.assertEqual(self.rows, {})

    def test_missing_skills_and_oversized_fields_are_rejected(self):
        for field, value in (("display_name", "a" * 81), ("education", "a" * 201), ("experience", "a" * 501), ("skills", [{}] * 12)):
            with self.subTest(field=field):
                self.assertEqual(self.client.put("/profile", headers=self.headers(), json={**self.profile(), field: value}).status_code, 422)
        self.assertEqual(self.client.put("/profile", headers=self.headers(), json={}).status_code, 422)

    def test_auth_failures_are_non_leaking_and_fail_closed(self):
        for status in (429, 500):
            self.auth_status = status
            response = self.client.get("/profile", headers=self.headers())
            self.assertEqual(response.status_code, 503)
            self.assertNotIn("private", response.text)
        self.auth_status = 200
        self.auth_timeout = True
        self.assertEqual(self.client.get("/profile", headers=self.headers()).status_code, 503)
        self.assertTrue(all(request.url.path == "/auth/v1/user" for request in self.requests))

    def test_invalid_auth_response_is_rejected(self):
        self.invalid_auth = True
        self.assertEqual(self.client.get("/profile", headers=self.headers()).status_code, 503)

    def test_storage_failure_is_not_a_successful_save(self):
        self.database_status = 500
        response = self.client.put("/profile", headers=self.headers(), json=self.profile())
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("private database detail", response.text)
        self.assertEqual(self.rows, {})
        self.database_status = 200
        self.database_timeout = True
        self.assertEqual(self.client.get("/profile", headers=self.headers()).status_code, 503)

    def test_malformed_storage_response_is_rejected(self):
        self.invalid_database = True
        self.assertEqual(self.client.get("/profile", headers=self.headers()).status_code, 503)
        self.assertEqual(self.client.put("/profile", headers=self.headers(), json=self.profile()).status_code, 503)

    def test_unconfigured_storage_fails_closed(self):
        with patch.dict(os.environ, {"SUPABASE_URL": "", "SUPABASE_PUBLISHABLE_KEY": ""}):
            get_settings.cache_clear()
            self.assertEqual(self.client.get("/profile", headers=self.headers()).status_code, 503)
            self.assertEqual(self.client.get("/profile").status_code, 401)
        self.assertEqual(self.requests, [])

    def test_cors_allows_authenticated_browser_save(self):
        response = self.client.options("/profile", headers={
            "Origin": "http://127.0.0.1:3000", "Access-Control-Request-Method": "PUT",
            "Access-Control-Request-Headers": "authorization,content-type",
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://127.0.0.1:3000")

    def test_token_is_not_in_principal_representation(self):
        self.assertNotIn("test-a", repr(CurrentUser(UUID(USER_A), "test-a")))
