"use client";

import { useI18n } from "@/components/preferences-provider";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import {
  filteredMatches,
  skillNames,
  type MatchFilter,
} from "@/lib/results-presentation";
import type { AnalysisResult } from "@/types/analysis";
import { ResultsEmpty } from "@/components/results/results-state";

export function JobMatches({ result }: { result: AnalysisResult }) {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<MatchFilter>("all");
  const visible = filteredMatches(result.matches, filter);
  const filters: { id: MatchFilter; label: string; count: number }[] = [
    { id: "all", label: "All vacancies", count: result.matches.length },
    {
      id: "scored",
      label: "Scored",
      count: result.matches.filter((match) => match.score !== null).length,
    },
    {
      id: "unscored",
      label: "Insufficient data",
      count: result.matches.filter((match) => match.score === null).length,
    },
  ];
  return (
    <section aria-labelledby="job-matches-heading">
      <div className="section-title-row">
        <div>
          <h2 id="job-matches-heading">{t("Explainable job matches")}</h2>
          <p>
            {" "}
            {t(
              "Ranked by recognized skill overlap. Scores estimate overlap with skill mentions, not your chance of being hired.",
            )}{" "}
          </p>
          <p>{t("Source text is shown in its original language.")}</p>
        </div>
      </div>
      <div
        className="result-filters"
        role="group"
        aria-label={t("Filter job matches")}
      >
        {filters.map((item) => (
          <button
            key={item.id}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {t(item.label || "")}
            <span>{item.count}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {t("Vacancy comparisons shown: {count}", { count: visible.length })}
      </p>
      {visible.length ? (
        <div className="job-match-list">
          {visible.map((match) => (
            <article className="job-match-row" key={match.job.external_id}>
              <div className="job-match-heading">
                <div>
                  <span className="job-employer">
                    {match.job.employer || t("Employer not provided")}
                  </span>
                  <h3 lang={match.job.is_demo ? "en" : undefined}>
                    {match.job.title}
                  </h3>
                  {match.job.location && (
                    <span className="job-location">
                      <MapPin size={12} aria-hidden="true" />
                      {match.job.location}
                    </span>
                  )}
                </div>
                <div className="overlap-score">
                  <strong>
                    {match.score === null
                      ? t("Unscored")
                      : `${new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(match.score)}%`}
                  </strong>
                  <span>
                    {match.score === null
                      ? t("No recognized skills")
                      : t("skill overlap")}
                  </span>
                </div>
              </div>
              {match.score === null ? (
                <p className="match-reason">
                  {" "}
                  {t(
                    "There isn’t enough recognized skill information to calculate a reliable score.",
                  )}{" "}
                </p>
              ) : (
                <div className="match-at-a-glance">
                  <p>
                    <span>{t("Comfortable")}</span>
                    {skillNames(match.matching_skills, result.skill_demand, t)}
                  </p>
                  {match.developing_skills.length > 0 && (
                    <p>
                      <span>{t("Learning")}</span>
                      {skillNames(
                        match.developing_skills,
                        result.skill_demand,
                        t,
                      )}
                    </p>
                  )}
                  <p>
                    <span>{t("Gaps")}</span>
                    {skillNames(match.missing_skills, result.skill_demand, t)}
                  </p>
                </div>
              )}
              <details className="score-explainer">
                <summary>
                  {match.score === null
                    ? t("Why no score?")
                    : t("Why this score?")}
                  <ChevronDown size={16} aria-hidden="true" />
                </summary>
                <div className="score-explainer-body">
                  <p>
                    {match.score === null
                      ? t(
                          "Insufficient data: no known skills were recognized, so no score is calculated.",
                        )
                      : t(
                          "{comfortable} comfortable, {learning} learning, and {missing} not yet out of {total} distinct recognized skill mentions.",
                          {
                            comfortable: match.matching_skills.length,
                            learning: match.developing_skills.length,
                            missing: match.missing_skills.length,
                            total: match.recognized_skill_count,
                          },
                        )}
                  </p>
                  {match.score !== null && (
                    <>
                      <dl className="credit-breakdown">
                        <div>
                          <dt>{t("Comfortable · 1 credit")}</dt>
                          <dd>
                            {skillNames(
                              match.matching_skills,
                              result.skill_demand,
                              t,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>{t("Learning · 0.5 credit")}</dt>
                          <dd>
                            {skillNames(
                              match.developing_skills,
                              result.skill_demand,
                              t,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>{t("Not yet · 0 credits")}</dt>
                          <dd>
                            {skillNames(
                              match.missing_skills,
                              result.skill_demand,
                              t,
                            )}
                          </dd>
                        </div>
                      </dl>
                      <p className="score-equation">
                        <span>
                          {t(
                            "{credits} credits ÷ {total} recognized skills × 100",
                            {
                              credits: match.earned_credits,
                              total: match.recognized_skill_count,
                            },
                          )}
                        </span>
                        <strong>
                          {new Intl.NumberFormat(locale, {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          }).format(match.score)}
                          %
                        </strong>
                      </p>
                    </>
                  )}
                  <details className="source-excerpt">
                    <summary>{t("View source description & evidence")}</summary>
                    <p
                      className="vacancy-description"
                      lang={match.job.is_demo ? "en" : undefined}
                    >
                      {match.job.description ||
                        t("No description was provided.")}
                    </p>
                    {match.job.skills.length ? (
                      <ul className="evidence-list">
                        {match.job.skills.map((skill) => (
                          <li key={skill.skill_id}>
                            <strong>{t(skill.skill_name || "")}</strong> — “
                            {skill.matched_alias}
                            {t("” in")}{" "}
                            {skill.source_field === "structured_skills"
                              ? t("structured skills")
                              : t("the description")}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{t("No canonical skill evidence was found.")}</p>
                    )}
                    <p className="source-record-note">
                      {match.job.is_demo ? t("Demo CSV") : t("HeadHunter API")}{" "}
                      · {match.job.external_id} {t("· Publication date")}{" "}
                      {match.job.published_at || t("not provided")}.
                      {match.job.is_demo && t(" No live application link.")}
                    </p>
                  </details>
                </div>
              </details>
              {!match.job.is_demo &&
                /^https:\/\/hh\.ru\/vacancy\/[0-9]{1,20}$/.test(
                  match.job.url || "",
                ) && (
                  <a
                    className="text-link original-vacancy"
                    href={match.job.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("View original vacancy on hh.ru")}
                    <span className="sr-only">
                      {" "}
                      {t("(opens in a new tab)")}
                    </span>
                  </a>
                )}
            </article>
          ))}
        </div>
      ) : (
        <ResultsEmpty
          title={t("No vacancies in this view.")}
          description={t(
            "Choose another group to see the available comparisons.",
          )}
          onReset={filter !== "all" ? () => setFilter("all") : undefined}
        />
      )}
    </section>
  );
}
