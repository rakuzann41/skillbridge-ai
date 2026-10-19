import csv
import io
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from typing import get_args
from uuid import UUID

from app.schemas.analysis import NormalizedJob, SkillEvidence
from app.schemas.profile import SkillId, UserSkill
from app.services.job_sources.base import JobSample, JobSourceError
from app.services.job_sources.csv_provider import CsvDemoProvider, MAX_BYTES, clean_text, publication_date, safe_url
from app.services.matcher import analyze_sample, match_job
from app.services.skill_extractor import extract_skills
from app.services.skills import SKILLS

NOW = datetime(2026, 10, 19, 12, tzinfo=timezone.utc)
ANALYSIS_ID = UUID("30000000-0000-0000-0000-000000000001")


def job(description="", tags=(), external_id="fixture-1"):
    return NormalizedJob(external_id=external_id, title="[Demo] Fixture", description=description,
                         structured_skills=tags, source="test-csv", source_type="csv_demo", is_demo=True,
                         normalized_at=NOW)


def extracted(description="", tags=(), external_id="fixture-1"):
    value = job(description, tags, external_id)
    return value.model_copy(update={"skills": extract_skills(value)})


class ExtractionTests(unittest.TestCase):
    def test_vocabulary_agrees_with_profile_validation(self):
        self.assertEqual(set(SKILLS), set(get_args(SkillId)))

    def test_structured_aliases_are_deduplicated_and_preferred(self):
        skills = extract_skills(job("Power BI and SQL", ("PowerBI", "power bi", "Postgres", "SQL")))
        self.assertEqual([skill.skill_id for skill in skills], ["power-bi", "relational-databases", "sql"])
        self.assertTrue(all(skill.source_field == "structured_skills" for skill in skills))
        self.assertTrue(all(skill.requirement_status == "mentioned" for skill in skills))

    def test_descriptions_supplement_structured_fields(self):
        skills = extract_skills(job("Python and pandas. Data cleaning and data visualisation.", ("SQL",)))
        self.assertEqual({item.skill_id for item in skills}, {"sql", "python", "pandas", "data-cleaning", "data-visualization"})

    def test_boundaries_avoid_substring_false_positives(self):
        self.assertEqual(extract_skills(job("NoSQL SQLAlchemy GitHub excellent pythonic excels")), ())

    def test_no_related_skill_is_invented(self):
        ids = {item.skill_id for item in extract_skills(job("pandas and PostgreSQL"))}
        self.assertEqual(ids, {"pandas", "relational-databases"})

    def test_negation_and_contrast(self):
        ids = {item.skill_id for item in extract_skills(job("Python is not required, but SQL is required. No Excel needed. Statistics matters."))}
        self.assertEqual(ids, {"sql", "statistics"})

    def test_unknown_tags_and_generic_words_are_not_skills(self):
        self.assertEqual(extract_skills(job("Teamwork and business reports", ("communication", "reporting", "data"))), ())

    def test_unicode_case_and_whitespace(self):
        ids = {item.skill_id for item in extract_skills(job("ＰＹＴＨＯＮ; POWER\u00a0BI; SQL", ("MS Excel",)))}
        self.assertEqual(ids, {"python", "power-bi", "sql", "excel"})

    def test_script_and_style_are_not_used_as_skill_evidence(self):
        cleaned = clean_text("<script>Python</script><style>SQL</style><p>Excel &amp; data cleaning</p>")
        ids = {item.skill_id for item in extract_skills(job(cleaned))}
        self.assertEqual(ids, {"excel", "data-cleaning"})
        self.assertNotIn("<", cleaned)


class ProviderTests(unittest.TestCase):
    def load(self, rows, limit=50, headers=None):
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=headers or ["external_id", "title", "description", "structured_skills", "url", "published_at"])
        writer.writeheader()
        writer.writerows(rows)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixtures.csv"
            path.write_text(output.getvalue(), encoding="utf-8-sig")
            return CsvDemoProvider(path).load(limit, NOW)

    def test_bundled_data_is_synthetic_and_has_one_unscorable_record(self):
        sample = CsvDemoProvider().load(8, NOW)
        self.assertEqual(len(sample.jobs), 8)
        self.assertEqual(sum(bool(value.skills) for value in sample.jobs), 7)
        self.assertTrue(all(value.is_demo and value.source_type == "csv_demo" for value in sample.jobs))
        self.assertTrue(all(value.url is None and value.published_at is None for value in sample.jobs))
        self.assertTrue(all(value.title.startswith("[Demo]") for value in sample.jobs))

    def test_invalid_rows_and_duplicates_do_not_inflate_denominator(self):
        sample = self.load([
            {"external_id": "a", "title": "A", "description": "SQL"},
            {"external_id": "a", "title": "Duplicate", "description": "SQL"},
            {"external_id": "b", "title": "", "description": "SQL"},
            {"external_id": "c", "title": "C", "description": "No known skills"},
        ])
        self.assertEqual(len(sample.jobs), 2)
        self.assertEqual(sample.skipped_rows, 2)
        result = analyze_sample(sample, [], ANALYSIS_ID, NOW)
        self.assertEqual(result.skill_demand[0].percentage, 50.0)
        self.assertEqual(result.sample_size, 2)

    def test_missing_optional_fields_remain_unknown(self):
        sample = self.load([{"external_id": "a", "title": "A", "description": "SQL"}], headers=["external_id", "title", "description"])
        self.assertIsNone(sample.jobs[0].employer)
        self.assertIsNone(sample.jobs[0].url)
        self.assertEqual(sample.jobs[0].skills[0].skill_id, "sql")

    def test_invalid_optional_url_and_date_are_omitted_with_warnings(self):
        sample = self.load([{"external_id": "a", "title": "A", "description": "SQL", "url": "javascript:alert(1)", "published_at": "yesterday"}])
        self.assertIsNone(sample.jobs[0].url)
        self.assertIsNone(sample.jobs[0].published_at)
        self.assertEqual(len(sample.warnings), 2)

    def test_safe_links_and_publication_precision(self):
        for invalid in ("javascript:alert(1)", "data:text/html,hi", "https://user:pass@example.com", "https://example.com/a b", "//example.com"):
            self.assertIsNone(safe_url(invalid))
        self.assertEqual(safe_url("https://example.com/job/1"), "https://example.com/job/1")
        self.assertEqual(publication_date("2026-10-19").isoformat(), "2026-10-19")
        self.assertIsNone(publication_date("2026-10-19T12:00:00"))
        self.assertIsNotNone(publication_date("2026-10-19T12:00:00Z"))

    def test_selection_is_bounded_and_in_file_order(self):
        rows = [{"external_id": str(index), "title": "Fixture", "description": "SQL"} for index in range(120)]
        sample = self.load(rows, limit=3)
        self.assertEqual([value.external_id for value in sample.jobs], ["0", "1", "2"])
        self.assertEqual(sample.rows_examined, 3)

    def test_scan_cap_even_when_rows_are_invalid(self):
        rows = [{"external_id": str(index), "title": "A" if index == 0 else "", "description": "SQL"} for index in range(120)]
        sample = self.load(rows)
        self.assertEqual(sample.rows_examined, 100)
        self.assertEqual(len(sample.jobs), 1)
        self.assertTrue(any("100-row" in value for value in sample.warnings))

    def test_scan_does_not_parse_a_malformed_record_beyond_the_cap(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixtures.csv"
            path.write_text('external_id,title,description\nfirst,Fixture,SQL\n' + 'invalid,,SQL\n' * 99
                            + 'outside,Fixture,"unterminated', encoding="utf-8")
            sample = CsvDemoProvider(path).load(8, NOW)
            self.assertEqual(sample.rows_examined, 100)
            self.assertEqual(len(sample.jobs), 1)

    def test_empty_bad_header_missing_file_and_oversized_file_fail(self):
        with self.assertRaises(JobSourceError):
            self.load([])
        with self.assertRaises(JobSourceError):
            self.load([], headers=["title"])
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixtures.csv"
            with self.assertRaises(JobSourceError):
                CsvDemoProvider(path).load(8, NOW)
            path.write_bytes(b"x" * (MAX_BYTES + 1))
            with self.assertRaises(JobSourceError):
                CsvDemoProvider(path).load(8, NOW)
            path.write_bytes(b"\xff\xff")
            with self.assertRaises(JobSourceError):
                CsvDemoProvider(path).load(8, NOW)

    def test_malformed_csv_fails_instead_of_returning_partial_success(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixtures.csv"
            path.write_text('external_id,title,description\na,A,"unterminated', encoding="utf-8")
            with self.assertRaises(JobSourceError):
                CsvDemoProvider(path).load(8, NOW)


class MatchingTests(unittest.TestCase):
    def test_matching_accepts_normalized_data_independent_of_provider(self):
        fixture = extracted("SQL")
        demo = JobSample((fixture,), "fixture", "a" * 64, 1, 0)
        other = JobSample((fixture.model_copy(update={"source_type": "live_api", "is_demo": False}),),
                          "test-other-provider", "b" * 64, 1, 0,
                          source_type="live_api", is_demo=False, source_label="Other provider test fixture")
        first = analyze_sample(demo, [], ANALYSIS_ID, NOW)
        second = analyze_sample(other, [], ANALYSIS_ID, NOW)
        self.assertEqual(first.matches[0].score, second.matches[0].score)
        self.assertEqual(second.source_type, "live_api")
        self.assertFalse(second.is_demo)

    def test_explicit_half_credit_formula_and_partitions(self):
        result = match_job(extracted("SQL Python Excel"), [UserSkill(skill_id="sql", level="comfortable"), UserSkill(skill_id="python", level="learning")])
        self.assertEqual(result.score, 50.0)
        self.assertEqual(result.earned_credits, 1.5)
        self.assertEqual(result.matching_skills, ["sql"])
        self.assertEqual(result.developing_skills, ["python"])
        self.assertEqual(result.missing_skills, ["excel"])

    def test_no_skills_is_unscored_but_zero_overlap_is_zero(self):
        self.assertIsNone(match_job(extracted("Unknown requirements"), []).score)
        self.assertEqual(match_job(extracted("SQL"), []).score, 0.0)

    def test_full_overlap_and_unrelated_user_skills(self):
        value = extracted("SQL SQL SQL", ("SQL", "SQL"))
        match = match_job(value, [UserSkill(skill_id="sql", level="comfortable"), UserSkill(skill_id="python", level="comfortable")])
        self.assertEqual(match.score, 100.0)
        self.assertEqual(match.recognized_skill_count, 1)

    def test_rounding_is_one_decimal_half_up(self):
        self.assertEqual(match_job(extracted("SQL Python Excel"), [UserSkill(skill_id="sql", level="comfortable")]).score, 33.3)
        self.assertEqual(match_job(extracted("SQL Python Excel"), [UserSkill(skill_id="sql", level="learning")]).score, 16.7)

    def test_repeatability_stable_ties_and_unique_frequency(self):
        values = (extracted("SQL SQL SQL", external_id="b"), extracted("SQL", external_id="a"), extracted("unknown", external_id="c"))
        sample = JobSample(values, "fixture", "a" * 64, 3, 0)
        first = analyze_sample(sample, [], ANALYSIS_ID, NOW)
        self.assertEqual(first.model_dump(), analyze_sample(sample, [], ANALYSIS_ID, NOW).model_dump())
        self.assertEqual([item.job.external_id for item in first.matches], ["a", "b", "c"])
        self.assertEqual(first.skill_demand[0].vacancy_count, 2)
        self.assertEqual(first.skill_demand[0].percentage, 66.7)
        self.assertEqual(first.scorable_count, 2)

    def test_empty_duplicate_or_mislabeled_input_is_rejected(self):
        value = extracted("SQL")
        for values in ((), (value, value), (value.model_copy(update={"is_demo": False}),)):
            with self.subTest(values=values), self.assertRaises(ValueError):
                analyze_sample(JobSample(values, "fixture", "a" * 64, len(values), 0), [], ANALYSIS_ID, NOW)

    def test_skill_input_order_does_not_change_results(self):
        sample = JobSample((extracted("Python SQL"),), "fixture", "a" * 64, 1, 0)
        skills = [UserSkill(skill_id="sql", level="learning"), UserSkill(skill_id="python", level="comfortable")]
        self.assertEqual(analyze_sample(sample, skills, ANALYSIS_ID, NOW).model_dump(),
                         analyze_sample(sample, list(reversed(skills)), ANALYSIS_ID, NOW).model_dump())
