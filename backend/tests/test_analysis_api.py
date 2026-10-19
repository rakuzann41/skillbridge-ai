import json
import os
import unittest
from unittest.mock import patch
from uuid import UUID

import httpx
from fastapi.testclient import TestClient

from app.api.analyses import get_demo_provider
from app.core.auth import get_http_client
from app.core.config import get_settings
from app.main import app
from app.services.job_sources.base import JobSourceError
from app.services.job_sources.csv_provider import CsvDemoProvider

USER_A = "10000000-0000-0000-0000-000000000001"
USER_B = "10000000-0000-0000-0000-000000000002"


class AnalysisApiTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {"SUPABASE_URL": "https://supabase.test", "SUPABASE_PUBLISHABLE_KEY": "test-public-key"})
        self.env.start()
        get_settings.cache_clear()
        self.records, self.requests = {}, []
        self.profile_saved = True
        self.skills = [{"skill_id": "sql", "level": "comfortable"}, {"skill_id": "python", "level": "learning"}]
        self.database_failure = False
        self.snapshot_columns_available = True
        self.project_selected_columns = True
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

    def headers(self, user="a"):
        return {"Authorization": f"Bearer test-{user}"}

    def transport(self, request):
        self.requests.append(request)
        self.assertEqual(request.headers["apikey"], "test-public-key")
        token = request.headers["authorization"]
        owner = {"Bearer test-a": USER_A, "Bearer test-b": USER_B}.get(token)
        if request.url.path == "/auth/v1/user":
            return httpx.Response(200, json={"id": owner}) if owner else httpx.Response(401)
        if request.url.path == "/rest/v1/profiles":
            self.assertEqual(request.url.params["user_id"], f"eq.{owner}")
            return httpx.Response(200, json=[{
                "display_name": "Test fixture", "education": "", "experience": "",
                "target_role": "Junior Data Analyst", "updated_at": "2026-10-19T10:00:00Z",
                "user_skills": self.skills,
            }] if self.profile_saved else [])
        self.assertEqual(request.url.path, "/rest/v1/analyses")
        selected_columns = set(request.url.params["select"].split(","))
        if not self.snapshot_columns_available and selected_columns & {"vacancy_snapshot", "snapshot_signature"}:
            return httpx.Response(400, json={"code": "42703", "message": "column analyses.vacancy_snapshot does not exist"})
        if self.database_failure:
            return httpx.Response(500, json={"detail": "do not expose this"})
        if request.method == "POST":
            data = json.loads(request.content)
            self.assertEqual(set(data), {"user_id", "sample_limit", "profile_skills", "dataset_sha256"})
            self.assertEqual(data["user_id"], owner)
            self.assertEqual(request.headers["prefer"], "return=representation")
            analysis_id = str(UUID(int=len(self.records) + 1))
            record = {"id": analysis_id, "created_at": "2026-10-19T12:00:00Z", "source_type": "csv_demo",
                      "sample_limit": data["sample_limit"], "profile_skills": data["profile_skills"],
                      "dataset_sha256": data["dataset_sha256"], "dataset_version": "synthetic-da-v1",
                      "algorithm_version": "skill-overlap-v1", "extraction_version": "canonical-aliases-v1"}
            self.records[analysis_id] = (owner, record)
            return httpx.Response(201, json=[record])
        self.assertEqual(request.url.params["user_id"], f"eq.{owner}")
        requested = request.url.params["id"].removeprefix("eq.")
        stored = self.records.get(requested)
        rows = []
        if stored and stored[0] == owner:
            rows = [{key: stored[1].get(key) for key in selected_columns}
                    if self.project_selected_columns else stored[1]]
        return httpx.Response(200, json=rows)

    def create(self, user="a", **body):
        return self.client.post("/analyses", headers=self.headers(user), json={"source": "csv_demo", **body})

    def test_missing_or_invalid_auth_does_not_access_profiles(self):
        for headers in ({}, {"Authorization": "Bearer invalid"}):
            response = self.client.post("/analyses", headers=headers, json={"source": "csv_demo"})
            self.assertEqual(response.status_code, 401)
        self.assertTrue(all(value.url.path == "/auth/v1/user" for value in self.requests))

    def test_create_has_demo_provenance_evidence_and_versioned_scores(self):
        response = self.create()
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data["is_demo"])
        self.assertEqual(data["source_type"], "csv_demo")
        self.assertEqual(data["sample_size"], 8)
        self.assertEqual(data["scorable_count"], 7)
        self.assertEqual(data["algorithm_version"], "skill-overlap-v1")
        self.assertEqual(data["extraction_version"], "canonical-aliases-v1")
        self.assertIsNone(data["matches"][-1]["score"])
        self.assertTrue(data["matches"][0]["job"]["skills"][0]["source_field"])
        self.assertEqual(response.headers["cache-control"], "no-store")

    def test_analysis_does_not_modify_the_saved_profile(self):
        original = [dict(value) for value in self.skills]
        self.assertEqual(self.create().status_code, 201)
        self.assertEqual(self.skills, original)
        profile_requests = [request for request in self.requests if request.url.path == "/rest/v1/profiles"]
        self.assertEqual([request.method for request in profile_requests], ["GET"])

    def test_snapshot_replays_after_profile_changes(self):
        first = self.create().json()
        self.skills = []
        restored = self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers())
        self.assertEqual(restored.status_code, 200)
        self.assertEqual(restored.json(), first)

    def test_csv_save_and_restore_work_before_live_snapshot_migration(self):
        self.snapshot_columns_available = False
        created = self.create()
        self.assertEqual(created.status_code, 201, created.text)
        first = created.json()
        self.skills = []
        restored = self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers())
        self.assertEqual(restored.status_code, 200, restored.text)
        self.assertEqual(restored.json(), first)
        for request in self.requests:
            if request.url.path == "/rest/v1/analyses":
                self.assertNotIn("vacancy_snapshot", request.url.params["select"])
                self.assertNotIn("snapshot_signature", request.url.params["select"])
        other_user = self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers("b"))
        self.assertEqual(other_user.status_code, 404)

    def test_other_account_cannot_read_analysis_even_with_owner_query(self):
        first = self.create().json()
        response = self.client.get(f"/analyses/{first['analysis_id']}?user_id={USER_A}", headers=self.headers("b"))
        self.assertEqual(response.status_code, 404)
        own = self.create("b").json()
        self.assertNotEqual(first["analysis_id"], own["analysis_id"])

    def test_never_accept_client_scores_skills_paths_or_owner(self):
        for key, value in (("scores", [100]), ("user_id", USER_B), ("skills", []), ("path", "C:/private.csv")):
            with self.subTest(key=key):
                self.assertEqual(self.create(**{key: value}).status_code, 422)
        self.assertEqual(self.records, {})

    def test_limit_and_source_validation(self):
        for source in ("headhunter", "csv_static", "unknown"):
            self.assertEqual(self.create(source=source).status_code, 422)
        for limit in (0, 51, "8", True):
            self.assertEqual(self.create(sample_limit=limit).status_code, 422)
        self.assertEqual(self.create(sample_limit=3).json()["sample_size"], 3)

    def test_unsaved_profile_requires_explicit_save_but_empty_skills_are_valid(self):
        self.profile_saved = False
        self.assertEqual(self.create().status_code, 409)
        self.assertEqual(self.records, {})
        self.profile_saved = True
        self.skills = []
        result = self.create().json()
        self.assertTrue(all(value["score"] in (0.0, None) for value in result["matches"]))

    def test_dataset_failure_does_not_save_partial_analysis(self):
        class BrokenProvider:
            def load(self, limit, normalized_at):
                raise JobSourceError("Demo fixture unavailable.")
        app.dependency_overrides[get_demo_provider] = lambda: BrokenProvider()
        self.assertEqual(self.create().status_code, 503)
        self.assertEqual(self.records, {})

    def test_version_or_dataset_change_never_silently_changes_saved_results(self):
        first = self.create().json()
        record = self.records[first["analysis_id"]][1]
        for key in ("dataset_sha256", "algorithm_version", "extraction_version", "dataset_version"):
            with self.subTest(key=key):
                original = record[key]
                record[key] = "0" * 64 if key == "dataset_sha256" else "unsupported-version"
                response = self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers())
                self.assertEqual(response.status_code, 409)
                record[key] = original

    def test_storage_outage_is_not_reported_as_saved(self):
        self.database_failure = True
        response = self.create()
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("do not expose this", response.text)
        self.assertEqual(self.records, {})

    def test_stored_forged_score_fields_are_not_trusted(self):
        first = self.create().json()
        # Simulate an upstream response violating the requested projection.
        self.project_selected_columns = False
        self.records[first["analysis_id"]][1]["score"] = 100
        response = self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers())
        self.assertEqual(response.status_code, 503)

    def test_cors_allows_analysis_post(self):
        response = self.client.options("/analyses", headers={"Origin": "http://127.0.0.1:3000", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,content-type"})
        self.assertEqual(response.status_code, 200)
