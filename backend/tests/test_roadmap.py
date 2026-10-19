import copy
import json
import os
import unittest
from datetime import datetime, timezone
from unittest.mock import patch
from uuid import UUID

import httpx
from fastapi.testclient import TestClient

from app.core.auth import get_http_client
from app.core.config import get_settings
from app.main import app
from app.services.job_sources.csv_provider import CsvDemoProvider
from app.services.matcher import analyze_sample
from app.services.roadmap import reviewed_stages, stage_order
from app.schemas.profile import UserSkill

USER_A = "10000000-0000-0000-0000-000000000001"
USER_B = "10000000-0000-0000-0000-000000000002"
STAMP = "2026-10-19T12:00:00Z"


class RoadmapServiceTests(unittest.TestCase):
    def test_reviewed_resources_are_https_and_prerequisites_are_preserved(self):
        stages = reviewed_stages()
        self.assertEqual(len(stages), 6)
        self.assertTrue(all(resource.url.startswith("https://") for stage in stages for resource in stage.resources))
        self.assertEqual(stage_order(), ["python", "sql", "excel", "pandas", "visualization", "project"])

    def test_gap_counts_personalize_order_without_altering_scores(self):
        now = datetime.now(timezone.utc)
        sample = CsvDemoProvider().load(8, now)
        analysis = analyze_sample(sample, [UserSkill(skill_id="python", level="comfortable"), UserSkill(skill_id="sql", level="learning")], UUID(int=1), now)
        original = analysis.model_dump()
        order = stage_order(analysis)
        self.assertEqual(order[:2], ["sql", "excel"])
        self.assertLess(order.index("python"), order.index("pandas"))
        self.assertEqual(order[-1], "project")
        self.assertEqual(stage_order(analysis), order)
        self.assertEqual(analysis.model_dump(), original)


class RoadmapApiTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {"SUPABASE_URL": "https://supabase.test", "SUPABASE_PUBLISHABLE_KEY": "test-public-key"})
        self.env.start()
        get_settings.cache_clear()
        self.records, self.requests = {}, []
        self.saved_profile = True
        self.failure = False
        self.corruption = None
        self.analysis_record = None
        self.bad_create_reply = None
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
        token = request.headers["authorization"]
        owner = {"Bearer test-a": USER_A, "Bearer test-b": USER_B}.get(token)
        self.assertEqual(request.headers["apikey"], "test-public-key")
        if request.url.path == "/auth/v1/user":
            return httpx.Response(200, json={"id": owner}) if owner else httpx.Response(401)
        if self.failure:
            return httpx.Response(500, json={"detail": "private database diagnostic"})
        if request.url.path == "/rest/v1/profiles":
            self.assertEqual(request.url.params["user_id"], f"eq.{owner}")
            return httpx.Response(200, json=[{"display_name": "", "education": "", "experience": "", "target_role": "Junior Data Analyst", "updated_at": STAMP, "user_skills": []}] if self.saved_profile else [])
        if request.url.path == "/rest/v1/analyses":
            self.assertEqual(request.url.params["user_id"], f"eq.{owner}")
            owned = self.analysis_record if owner == USER_A and self.analysis_record and request.url.params["id"] == f"eq.{self.analysis_record['id']}" else None
            return httpx.Response(200, json=[owned] if owned else [])
        body = json.loads(request.content)
        if request.url.path == "/rest/v1/rpc/get_my_roadmap":
            self.assertEqual(body, {})
            record = copy.deepcopy(self.records.get(owner))
            if record and self.corruption:
                self.corruption(record)
            return httpx.Response(200, content=json.dumps(record), headers={"Content-Type": "application/json"})
        if request.url.path == "/rest/v1/rpc/create_my_roadmap":
            self.assertEqual(set(body), {"p_source_analysis_id", "p_stage_order"})
            if self.bad_create_reply:
                return httpx.Response(200, content=json.dumps(self.bad_create_reply[0]))
            if owner not in self.records:
                number = 100 if owner == USER_A else 200
                catalog = {stage.stage_key: stage.model_dump() for stage in reviewed_stages()}
                self.records[owner] = {"id": str(UUID(int=number)), "target_role": "Junior Data Analyst", "template_version": "junior-da-v1", "created_at": STAMP, "updated_at": STAMP,
                    "source_analysis_id": body["p_source_analysis_id"], "source_type": self.analysis_record["source_type"] if body["p_source_analysis_id"] else None, "analyzed_at": STAMP if body["p_source_analysis_id"] else None, "profile_skills": self.analysis_record["profile_skills"] if body["p_source_analysis_id"] else [],
                    "items": [{**catalog[key], "id": str(UUID(int=number+i)), "position": i, "completed": False, "completed_at": None} for i, key in enumerate(body["p_stage_order"], 1)]}
            return httpx.Response(200, json=self.records[owner]["id"])
        self.assertEqual(request.url.path, "/rest/v1/rpc/set_my_roadmap_item")
        self.assertEqual(set(body), {"p_item_id", "p_completed"})
        owned_item = next((item for item in self.records.get(owner, {}).get("items", []) if item["id"] == body["p_item_id"]), None)
        if owned_item is None:
            return httpx.Response(200, json=False)
        owned_item.update(completed=body["p_completed"], completed_at=STAMP if body["p_completed"] else None)
        return httpx.Response(200, json=True)

    def create(self, user="a", **body):
        return self.client.post("/roadmap", headers=self.headers(user), json=body)

    def test_all_private_operations_require_valid_identity(self):
        for headers in ({}, {"Authorization": "Bearer invalid"}):
            for method, path, body in (("GET", "/roadmap", None), ("POST", "/roadmap", {}), ("PUT", f"/roadmap/items/{UUID(int=1)}", {"completed": True})):
                response = self.client.request(method, path, headers=headers, json=body)
                self.assertEqual(response.status_code, 401)
        self.assertTrue(all(request.url.path == "/auth/v1/user" for request in self.requests))

    def test_create_save_reload_undo_and_idempotent_creation(self):
        blank = self.client.get("/roadmap", headers=self.headers())
        self.assertIsNone(blank.json())
        created = self.create()
        self.assertEqual(created.status_code, 200)
        self.assertEqual(created.headers["cache-control"], "no-store")
        plan = created.json()
        self.assertEqual((plan["completed_count"], plan["total_count"], plan["progress_percentage"]), (0, 6, 0))
        first_id = plan["items"][0]["id"]
        updated = self.client.put(f"/roadmap/items/{first_id}", headers=self.headers(), json={"completed": True}).json()
        self.assertEqual((updated["completed_count"], updated["progress_percentage"]), (1, 17))
        self.assertEqual(updated["next_item_id"], plan["items"][1]["id"])
        self.assertTrue(updated["items"][0]["completed_at"])
        self.assertEqual(self.client.get("/roadmap", headers=self.headers()).json(), updated)
        # New analyses/visits must not reset an already-created plan, even if the
        # requested source is no longer readable. Creation returns the saved plan.
        self.assertEqual(self.create(analysis_id=str(UUID(int=999))).json(), updated)
        self.assertEqual(sum(request.url.path.endswith("create_my_roadmap") for request in self.requests), 1)
        undone = self.client.put(f"/roadmap/items/{first_id}", headers=self.headers(), json={"completed": False}).json()
        self.assertEqual(undone["progress_percentage"], 0)
        self.assertIsNone(undone["items"][0]["completed_at"])

    def test_other_account_cannot_read_or_complete_a_stage(self):
        a = self.create().json()
        self.assertIsNone(self.client.get(f"/roadmap?user_id={USER_A}", headers=self.headers("b")).json())
        b = self.create("b").json()
        self.assertNotEqual(a["id"], b["id"])
        response = self.client.put(f"/roadmap/items/{a['items'][0]['id']}", headers=self.headers("b"), json={"completed": True})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(self.client.get("/roadmap", headers=self.headers()).json()["completed_count"], 0)

    def test_client_cannot_set_owner_content_order_or_completion_timestamp(self):
        for body in ({"user_id": USER_B}, {"resources": []}, {"items": []}, {"stage_order": []}, {"analysis_id": "invalid"}):
            self.assertEqual(self.create(**body).status_code, 422)
        plan = self.create().json()
        for body in ({"completed": "true"}, {"completed": 1}, {"completed": True, "completed_at": STAMP}, {"completed": True, "user_id": USER_B}, {}):
            self.assertEqual(self.client.put(f"/roadmap/items/{plan['items'][0]['id']}", headers=self.headers(), json=body).status_code, 422)

    def test_missing_profile_and_inaccessible_source_do_not_create_a_plan(self):
        self.saved_profile = False
        self.assertEqual(self.create().status_code, 409)
        self.assertEqual(self.create(analysis_id=str(UUID(int=99))).status_code, 404)
        self.assertEqual(self.records, {})

    def test_all_complete_has_no_next_stage_and_repeated_updates_are_safe(self):
        plan = self.create().json()
        for item in plan["items"]:
            result = self.client.put(f"/roadmap/items/{item['id']}", headers=self.headers(), json={"completed": True}).json()
        self.assertEqual(result["progress_percentage"], 100)
        self.assertIsNone(result["next_item_id"])
        repeat = self.client.put(f"/roadmap/items/{item['id']}", headers=self.headers(), json={"completed": True}).json()
        self.assertEqual(result, repeat)

    def test_creation_uses_only_owned_replayed_analysis_and_preserves_its_basis(self):
        sample = CsvDemoProvider().load(8, datetime.now(timezone.utc))
        self.analysis_record = {"id": str(UUID(int=888)), "created_at": STAMP, "source_type": "csv_demo", "sample_limit": 8,
            "profile_skills": [{"skill_id": "python", "level": "comfortable"}, {"skill_id": "sql", "level": "learning"}],
            "dataset_sha256": sample.dataset_sha256, "dataset_version": sample.dataset_version,
            "algorithm_version": "skill-overlap-v1", "extraction_version": "canonical-aliases-v1"}
        self.assertEqual(self.create("b", analysis_id=self.analysis_record["id"]).status_code, 404)
        response = self.create(analysis_id=self.analysis_record["id"])
        self.assertEqual(response.status_code, 200)
        plan = response.json()
        self.assertEqual([item["stage_key"] for item in plan["items"]][:2], ["sql", "excel"])
        self.assertEqual(plan["source_analysis_id"], self.analysis_record["id"])
        self.assertEqual(plan["items"][0]["focus_skills"], ["SQL", "Relational databases"])
        self.analysis_record["dataset_sha256"] = "0" * 64
        # Existing progress remains readable without reopening a now-stale dataset.
        self.assertEqual(self.client.get("/roadmap", headers=self.headers()).json(), plan)
        self.assertEqual(self.create(analysis_id=self.analysis_record["id"]).json(), plan)

    def test_live_snapshot_can_seed_a_roadmap_without_refetching_or_resetting_progress(self):
        import hashlib
        from app.services.analysis_snapshot import signature, snapshot_payload
        from app.services.job_sources.headhunter import normalize_vacancy
        from app.services.job_sources.base import JobSample
        from app.repositories.analyses import SIGNED_FIELDS

        key = "test-private-signing-key-" * 3
        with patch.dict(os.environ, {"ANALYSIS_SIGNING_KEY": key}):
            get_settings.cache_clear()
            stamp = datetime(2026, 10, 19, 12, tzinfo=timezone.utc)
            job = normalize_vacancy({"id": "123", "name": "Junior Data Analyst", "archived": False,
                "published_at": "2026-10-18T12:00:00Z", "experience": {"id": "noExperience"},
                "description": "SQL and Python", "key_skills": [{"name": "SQL"}]}, "123", stamp)
            fingerprint = hashlib.sha256(json.dumps([job.model_dump(mode="json")], sort_keys=True,
                ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
            sample = JobSample((job,), "headhunter-snapshot-v1", fingerprint, 1, 0, (), "live_api", False, "HeadHunter API — saved vacancy snapshot")
            record = {"id": str(UUID(int=888)), "created_at": STAMP, "source_type": "live_api", "sample_limit": 8,
                "profile_skills": [], "dataset_sha256": fingerprint, "dataset_version": sample.dataset_version,
                "algorithm_version": "skill-overlap-v1", "extraction_version": "canonical-aliases-v1",
                "vacancy_snapshot": snapshot_payload(sample)}
            record["snapshot_signature"] = signature(UUID(USER_A), {field: record[field] for field in SIGNED_FIELDS}, key)
            self.analysis_record = record
            response = self.create(analysis_id=record["id"])
            self.assertEqual(response.status_code, 200, response.text)
            plan = response.json()
            self.assertEqual(plan["source_type"], "live_api")
            self.assertEqual(plan["items"][0]["stage_key"], "python")
            updated = self.client.put(f"/roadmap/items/{plan['items'][0]['id']}", headers=self.headers(), json={"completed": True}).json()
            self.assertEqual(self.create(analysis_id=str(UUID(int=999))).json(), updated)
            self.assertFalse(any("hh.ru" in str(request.url) for request in self.requests))

    def test_malformed_save_confirmation_is_a_safe_service_error(self):
        for payload in ({}, [], False, None, "invalid-uuid"):
            self.bad_create_reply = (payload,)
            response = self.create()
            self.assertEqual(response.status_code, 503)
            self.assertNotIn("Traceback", response.text)

    def test_outage_never_reports_saved_progress_or_leaks_diagnostics(self):
        plan = self.create().json()
        self.failure = True
        response = self.client.put(f"/roadmap/items/{plan['items'][0]['id']}", headers=self.headers(), json={"completed": True})
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("private database diagnostic", response.text)
        self.assertFalse(self.records[USER_A]["items"][0]["completed"])

    def test_unreviewed_links_invalid_timestamps_or_partial_templates_fail_closed(self):
        self.create()
        mutations = [lambda record: record["items"][0]["resources"][0].update(url="javascript:alert(1)"),
            lambda record: record["items"].pop(),
            lambda record: record["items"][0].update(completed=True),
            lambda record: record.update(template_version="unreviewed")]
        for mutation in mutations:
            self.corruption = mutation
            self.assertEqual(self.client.get("/roadmap", headers=self.headers()).status_code, 503)
