import test from "node:test";
import assert from "node:assert/strict";
import {
  prioritySkills,
  filteredMatches,
  resultsFailure,
  originalVacancyUrl,
} from "../lib/results-presentation.ts";

const demand = [
  { skill_id: "python", user_level: "comfortable", vacancy_count: 8 },
  { skill_id: "sql", user_level: "learning", vacancy_count: 7 },
  { skill_id: "excel", user_level: "not-yet", vacancy_count: 4 },
  { skill_id: "data-cleaning", user_level: "not-yet", vacancy_count: 4 },
];

test("vacancy previews link only to the matching live HeadHunter record", () => {
  const job = { external_id: "123", source_type: "live_api", is_demo: false, url: "https://hh.ru/vacancy/123" };
  assert.equal(originalVacancyUrl(job), job.url);
  for (const changes of [
    { is_demo: true }, { source_type: "csv_demo" }, { external_id: "456" },
    { url: "javascript:alert(1)" }, { url: "https://hh.ru.attacker.example/vacancy/123" },
    { url: "https://hh.ru/vacancy/123?redirect=elsewhere" }, { url: null },
    { external_id: "../123" },
  ]) assert.equal(originalVacancyUrl({ ...job, ...changes }), null);
});

test("live storage outages offer a safe explicit fallback", () => {
  const failure = resultsFailure({ status: 503, code: "storage_unavailable", message: "42703 database secret" }, "create");
  assert.match(failure.description, /cannot be saved/);
  assert.match(failure.description, /Demo CSV/);
  assert.doesNotMatch(JSON.stringify(failure), /42703|secret/);
});

test("live-source failures explain the alternative without exposing provider diagnostics or changing saved-result recovery", () => {
  const error = { status: 503, code: "rate_limited", message: "private provider diagnostic" };
  const create = resultsFailure(error, "create");
  assert.match(create.title, /Live vacancies/);
  assert.match(create.description, /Demo CSV/);
  assert.equal(create.action, "retry");
  assert.doesNotMatch(JSON.stringify(create), /private provider diagnostic/);
  assert.doesNotMatch(resultsFailure(error, "load").title, /Live vacancies/);
});

test("priorities exclude strengths, use sample counts, and keep stable ties without mutating saved data", () => {
  const result = {
    skill_demand: demand.map((skill) => Object.freeze({ ...skill })),
  };
  Object.freeze(result.skill_demand);
  assert.deepEqual(
    prioritySkills(result).map((s) => s.skill_id),
    ["sql", "data-cleaning", "excel"],
  );
  assert.deepEqual(
    result.skill_demand.map((s) => s.skill_id),
    ["python", "sql", "excel", "data-cleaning"],
  );
  assert.deepEqual(
    prioritySkills(result, "learning").map((s) => s.skill_id),
    ["sql"],
  );
  assert.deepEqual(
    prioritySkills(result, "not-yet").map((s) => s.skill_id),
    ["data-cleaning", "excel"],
  );
});

test("empty and all-comfortable samples produce no invented priorities", () => {
  assert.deepEqual(prioritySkills({ skill_demand: [] }), []);
  assert.deepEqual(prioritySkills({ skill_demand: [demand[0]] }), []);
});

test("match filtering keeps zero overlap scored and preserves the backend ranking and values", () => {
  const matches = Object.freeze(
    [
      { id: "a", score: 50 },
      { id: "b", score: 0 },
      { id: "c", score: null },
    ].map(Object.freeze),
  );
  assert.deepEqual(filteredMatches(matches, "scored"), [
    matches[0],
    matches[1],
  ]);
  assert.deepEqual(filteredMatches(matches, "unscored"), [matches[2]]);
  assert.deepEqual(filteredMatches(matches, "all"), matches);
  assert.deepEqual(filteredMatches([], "all"), []);
});

test("private or invalid result links lead to a fresh comparison without disclosing ownership", () => {
  for (const status of [404, 422]) {
    const failure = resultsFailure(
      { status, message: "private owner detail" },
      "load",
    );
    assert.equal(failure.action, "new-analysis");
    assert.doesNotMatch(JSON.stringify(failure), /private owner detail/);
  }
});

test("version conflicts and unsaved profiles have different useful recovery paths", () => {
  assert.equal(resultsFailure({ status: 409 }, "load").action, "new-analysis");
  assert.equal(resultsFailure({ status: 409 }, "create").action, "profile");
  assert.equal(resultsFailure({ status: 401 }, "load").action, "sign-in");
});

test("outages and unexpected failures offer retry without displaying raw server details", () => {
  for (const error of [
    { status: 0 },
    { status: 503 },
    { status: 500, message: "secret diagnostic" },
    new Error("secret diagnostic"),
    null,
  ]) {
    for (const operation of ["load", "create"]) {
      const failure = resultsFailure(error, operation);
      assert.equal(failure.action, "retry");
      assert.doesNotMatch(JSON.stringify(failure), /secret diagnostic/);
    }
  }
});
