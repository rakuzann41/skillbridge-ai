import copy
import hashlib
import json
import unittest
from dataclasses import replace
from datetime import datetime, timedelta, timezone
from uuid import UUID

import httpx

import test_analysis_api as demo_tests
from app.core.config import Settings, get_settings
from app.main import app
from app.services.job_sources.headhunter import HeadHunterProvider, LiveSourceError, SourceState, get_live_provider, normalize_vacancy
from app.services.analysis_snapshot import snapshot_payload, sample_from_snapshot, signature, verify_signature
from app.services.matcher import analyze_sample

STAMP = datetime(2026, 10, 19, 12, tzinfo=timezone.utc)
SETTINGS = Settings("https://supabase.test", "test-public-key", "http://127.0.0.1:3000",
                    "test-hh-token", "SkillBridgeAI/0.1 (developer@example.com)", "test-signing-key-" * 4)


def vacancy(job_id="123", **changes):
    return {"id": job_id, "name": "Junior Data Analyst", "archived": False,
        "description": "<p>SQL and Python.</p><script>Excel</script>",
        "key_skills": [{"name": "SQL"}], "published_at": "2026-10-18T12:00:00+0300",
        "employer": {"name": "Test fixture company"}, "area": {"name": "Test fixture location"},
        "experience": {"id": "noExperience", "name": "No experience"},
        "alternate_url": "javascript:alert(1)", **changes}


class HeadHunterTests(unittest.IsolatedAsyncioTestCase):
    async def sample(self, handler, limit=2, state=None, settings=SETTINGS):
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            return await HeadHunterProvider(client, settings, state or SourceState()).load(limit, STAMP)

    async def test_bounded_collection_source_headers_deduplication_and_conservative_extraction(self):
        requests = []
        def handler(request):
            requests.append(request)
            self.assertEqual(request.url.host, "api.hh.ru")
            self.assertEqual(request.headers["authorization"], "Bearer test-hh-token")
            self.assertNotIn("apikey", request.headers)
            self.assertEqual(request.headers["HH-User-Agent"], SETTINGS.hh_user_agent)
            if request.url.path == "/vacancies":
                self.assertEqual(request.url.params.get_list("experience"), ["noExperience", "between1And3"])
                self.assertEqual(request.url.params["page"], "0")
                return httpx.Response(200, json={"items": [vacancy("123"), vacancy("123"), vacancy("124"), vacancy("125")]})
            return httpx.Response(200, json=vacancy(request.url.path.rsplit("/", 1)[1]))
        sample = await self.sample(handler)
        self.assertEqual(len(requests), 3)
        self.assertEqual((len(sample.jobs), sample.source_type, sample.is_demo), (2, "live_api", False))
        self.assertEqual([job.external_id for job in sample.jobs], ["123", "124"])
        job = sample.jobs[0]
        self.assertEqual(job.url, "https://hh.ru/vacancy/123")
        self.assertNotIn("script", job.description)
        self.assertEqual([skill.skill_id for skill in job.skills], ["python", "sql"])
        self.assertEqual(job.skills[1].source_field, "structured_skills")
        restored = sample_from_snapshot(snapshot_payload(sample), sample.dataset_sha256)
        self.assertEqual(restored, sample)

    async def test_malformed_archived_old_senior_unrelated_and_wrong_identity_are_skipped(self):
        invalid = [vacancy(archived=True), vacancy(name="Senior Data Analyst"), vacancy(name="Data Scientist"),
            vacancy(published_at="not-a-date"), vacancy(published_at="2026-01-01T00:00:00Z"),
            vacancy(published_at="2026-10-20T00:00:00Z"), vacancy(experience=None), vacancy(description=[]), vacancy(id="other")]
        for raw in invalid:
            self.assertIsNone(normalize_vacancy(raw, "123", STAMP))
        for changes in ({"key_skills": None}, {"employer": []}, {"area": {"name": 22}}):
            self.assertIsNotNone(normalize_vacancy(vacancy(**changes), "123", STAMP))

    async def test_partial_sample_uses_successful_denominator_and_no_demo_padding(self):
        def handler(request):
            if request.url.path == "/vacancies":
                return httpx.Response(200, json={"items": [vacancy("123"), vacancy("124")]})
            return httpx.Response(404) if request.url.path.endswith("124") else httpx.Response(200, json=vacancy())
        sample = await self.sample(handler)
        result = analyze_sample(sample, [], UUID(int=1), STAMP)
        self.assertEqual(result.sample_size, 1)
        self.assertTrue(all(skill.percentage == 100 for skill in result.skill_demand))
        self.assertTrue(any("Only 1" in warning for warning in result.warnings))
        self.assertFalse(result.is_demo)

    async def test_rate_limit_captcha_and_auth_stop_requests_without_retry_or_url_follow(self):
        for status in (401, 403, 429):
            calls, state = [], SourceState()
            def handler(request):
                calls.append(request)
                return httpx.Response(status, headers={"Retry-After": "120"}, json={"captcha_url": "https://bad.example/private"})
            with self.assertRaises(LiveSourceError) as caught:
                await self.sample(handler, state=state)
            self.assertEqual(caught.exception.retry_after, 120)
            self.assertEqual(len(calls), 1)
            with self.assertRaises(LiveSourceError):
                await self.sample(handler, state=state)
            self.assertEqual(len(calls), 1)

    async def test_timeout_bad_json_oversized_redirect_and_server_error_are_safe(self):
        for response in (httpx.Response(200, content=b"not-json"), httpx.Response(200, json=[]),
                         httpx.Response(200, content=b"x" * (1024 * 1024 + 1)),
                         httpx.Response(302, headers={"location": "https://bad.example"}), httpx.Response(500)):
            with self.assertRaises(LiveSourceError):
                await self.sample(lambda request: response)
        def timeout(request):
            raise httpx.ReadTimeout("secret diagnostic", request=request)
        with self.assertRaises(LiveSourceError) as caught:
            await self.sample(timeout)
        self.assertNotIn("secret diagnostic", str(caught.exception))

    async def test_missing_configuration_empty_search_and_request_limits(self):
        def never(request):
            self.fail("No network should be used")
        for settings in (replace(SETTINGS, hh_access_token=""), replace(SETTINGS, hh_user_agent="fake\r\nheader")):
            with self.assertRaises(LiveSourceError) as caught:
                await self.sample(never, settings=settings)
            self.assertEqual(caught.exception.code, "not_configured")
        for limit in (0, 11):
            with self.assertRaises(ValueError):
                await self.sample(never, limit=limit)
        for payload in ({"items": []}, {"items": None}, {}):
            with self.assertRaises(LiveSourceError):
                await self.sample(lambda request: httpx.Response(200, json=payload))

    async def test_cache_preserves_fetch_date_and_changed_credentials_cannot_reuse_cache(self):
        calls, state = [], SourceState()
        def handler(request):
            calls.append(request)
            return httpx.Response(200, json={"items": [vacancy()]}) if request.url.path == "/vacancies" else httpx.Response(200, json=vacancy())
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            provider = HeadHunterProvider(client, SETTINGS, state)
            sample = await provider.load(2, STAMP)
            self.assertEqual(await provider.load(2, STAMP + timedelta(minutes=1)), sample)
            self.assertEqual(len(calls), 2)
            with self.assertRaises(LiveSourceError):
                await provider.load(1, STAMP)
            await HeadHunterProvider(client, replace(SETTINGS, hh_access_token="different-token"), state).load(2, STAMP)
            self.assertEqual(len(calls), 4)

    async def test_snapshot_signature_binds_owner_facts_and_saved_profile(self):
        fields = {"profile_skills": [], "vacancy_snapshot": {"title": "test"}}
        owner = UUID(demo_tests.USER_A)
        signed = signature(owner, fields, SETTINGS.analysis_signing_key)
        verify_signature(owner, fields, signed, SETTINGS.analysis_signing_key)
        for changed_owner, changed_fields in ((UUID(demo_tests.USER_B), fields), (owner, {**fields, "profile_skills": [{"skill_id": "sql", "level": "comfortable"}]}), (owner, {**fields, "vacancy_snapshot": {"title": "forged"}})):
            with self.assertRaises(ValueError):
                verify_signature(changed_owner, changed_fields, signed, SETTINGS.analysis_signing_key)


class LiveAnalysisApiTests(unittest.TestCase):
    headers = demo_tests.AnalysisApiTests.headers

    def setUp(self):
        demo_tests.AnalysisApiTests.setUp(self)
        self.env_live = demo_tests.patch.dict(demo_tests.os.environ, {
            "ANALYSIS_SIGNING_KEY": SETTINGS.analysis_signing_key,
            "HH_ACCESS_TOKEN": "", "HH_USER_AGENT": ""})
        self.env_live.start()
        get_settings.cache_clear()
        self.live_calls = 0
        async def provider():
            fixture = self
            class LiveProvider:
                async def load(self, limit, stamp):
                    fixture.live_calls += 1
                    async with httpx.AsyncClient(transport=httpx.MockTransport(lambda req: httpx.Response(200, json={"items": [vacancy()]} if req.url.path == "/vacancies" else vacancy()))) as client:
                        return await HeadHunterProvider(client, SETTINGS, SourceState()).load(limit, STAMP)
            return LiveProvider()
        app.dependency_overrides[get_live_provider] = provider

    def tearDown(self):
        self.env_live.stop()
        demo_tests.AnalysisApiTests.tearDown(self)

    def transport(self, request):
        if request.url.path == "/rest/v1/analyses" and request.method == "POST":
            data = json.loads(request.content)
            if data.get("source_type") == "live_api":
                self.requests.append(request)
                self.assertEqual(request.headers["authorization"], "Bearer test-a")
                self.assertEqual(data["user_id"], demo_tests.USER_A)
                record = {key: value for key, value in data.items() if key != "user_id"}
                record.update(id=str(UUID(int=1)), created_at="2026-10-19T12:00:00Z",
                              algorithm_version="skill-overlap-v1", extraction_version="canonical-aliases-v1")
                self.records[record["id"]] = (data["user_id"], record)
                return httpx.Response(201, json=[record])
        return demo_tests.AnalysisApiTests.transport(self, request)

    def create(self, **extra):
        return self.client.post("/analyses", headers=self.headers(), json={"source": "headhunter", "accept_hh_terms": True, **extra})

    def test_live_save_refresh_uses_signed_snapshot_and_never_refetches(self):
        response = self.create()
        self.assertEqual(response.status_code, 201, response.text)
        first = response.json()
        self.assertFalse(first["is_demo"])
        self.assertEqual(first["source_type"], "live_api")
        self.assertEqual(self.live_calls, 1)
        self.skills = []
        restored = self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers())
        self.assertEqual(restored.json(), first)
        self.assertEqual(self.live_calls, 1)
        reads = [request for request in self.requests if request.url.path == "/rest/v1/analyses" and request.method == "GET" and request.url.params.get("limit") != "0"]
        self.assertEqual(len(reads), 2)
        self.assertNotIn("vacancy_snapshot", reads[0].url.params["select"])
        self.assertIn("vacancy_snapshot", reads[1].url.params["select"])
        self.assertIn("snapshot_signature", reads[1].url.params["select"])
        for request in reads:
            self.assertEqual(request.headers["authorization"], "Bearer test-a")
            self.assertEqual(request.url.params["user_id"], f"eq.{demo_tests.USER_A}")
            self.assertEqual(request.url.params["id"], f"eq.{first['analysis_id']}")
        self.assertEqual(self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers("b")).status_code, 404)
        self.assertNotIn("signature", response.text)
        self.assertNotIn(SETTINGS.analysis_signing_key, response.text)

    def test_modified_vacancy_skills_profile_signature_or_version_fail_closed(self):
        first = self.create().json()
        row = self.records[first["analysis_id"]][1]
        original = copy.deepcopy(row)
        for mutate in (
            lambda value: value["vacancy_snapshot"]["jobs"][0].update(title="forged"),
            lambda value: value["vacancy_snapshot"]["jobs"][0].update(skills=[]),
            lambda value: value.update(profile_skills=[]),
            lambda value: value.update(snapshot_signature="0" * 64),
            lambda value: value.update(dataset_version="forged"),
        ):
            changed = copy.deepcopy(original)
            mutate(changed)
            self.records[first["analysis_id"]] = (demo_tests.USER_A, changed)
            self.assertEqual(self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers()).status_code, 503)

    def test_live_restore_requires_snapshot_columns_and_preserves_ownership(self):
        first = self.create().json()
        self.snapshot_columns_available = False
        restored = self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers())
        self.assertEqual(restored.status_code, 503)
        self.assertNotIn("vacancy_snapshot", restored.text)
        self.assertNotIn("42703", restored.text)
        other_user = self.client.get(f"/analyses/{first['analysis_id']}", headers=self.headers("b"))
        self.assertEqual(other_user.status_code, 404)
        self.assertEqual(self.live_calls, 1)

    def test_missing_live_storage_is_detected_before_headhunter_and_offers_explicit_demo(self):
        self.snapshot_columns_available = False
        failed = self.create()
        self.assertEqual(failed.status_code, 503)
        self.assertEqual(failed.json()["detail"]["code"], "storage_unavailable")
        self.assertTrue(failed.json()["detail"]["fallback_available"])
        self.assertNotIn("vacancy_snapshot", failed.text)
        self.assertNotIn("42703", failed.text)
        self.assertEqual(self.live_calls, 0)
        self.assertEqual(self.records, {})
        checks = [r for r in self.requests if r.url.params.get("limit") == "0"]
        self.assertEqual(len(checks), 1)
        self.assertEqual(checks[0].url.params["user_id"], f"eq.{demo_tests.USER_A}")
        self.assertEqual(checks[0].headers["authorization"], "Bearer test-a")
        fallback = self.client.post("/analyses", headers=self.headers(), json={"source": "csv_demo"})
        self.assertEqual(fallback.status_code, 201)

    def test_live_validation_auth_and_no_client_scores_or_automatic_fallback(self):
        for body in ({"accept_hh_terms": False}, {"accept_hh_terms": "true"}, {"sample_limit": 11}, {"vacancies": []}, {"scores": [100]}):
            self.assertEqual(self.create(**body).status_code, 422)
        self.assertEqual(self.client.post("/analyses", json={"source": "headhunter", "accept_hh_terms": True}).status_code, 401)
        self.assertEqual(self.live_calls, 0)
        class Failed:
            async def load(self, limit, stamp):
                raise LiveSourceError("rate_limited", "Use demo instead", 120)
        app.dependency_overrides[get_live_provider] = lambda: Failed()
        failed = self.create()
        self.assertEqual(failed.status_code, 503)
        self.assertEqual(failed.headers["retry-after"], "120")
        self.assertTrue(failed.json()["detail"]["fallback_available"])
        self.assertEqual(self.records, {})
        fallback = self.client.post("/analyses", headers=self.headers(), json={"source": "csv_demo"})
        self.assertEqual(fallback.status_code, 201)
        self.assertTrue(fallback.json()["is_demo"])
