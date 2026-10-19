"use client";

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
          <h2 id="job-matches-heading">Explainable job matches</h2>
          <p>
            Ranked by recognized skill overlap. Scores estimate overlap with
            skill mentions, not your chance of being hired.
          </p>
        </div>
      </div>
      <div
        className="result-filters"
        role="group"
        aria-label="Filter job matches"
      >
        {filters.map((item) => (
          <button
            key={item.id}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            <span>{item.count}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        Showing {visible.length} vacancy comparisons
      </p>
      {visible.length ? (
        <div className="job-match-list">
          {visible.map((match) => (
            <article className="job-match-row" key={match.job.external_id}>
              <div className="job-match-heading">
                <div>
                  <span className="job-employer">
                    {match.job.employer || "Employer not provided"}
                  </span>
                  <h3>{match.job.title}</h3>
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
                      ? "Unscored"
                      : `${match.score.toFixed(1)}%`}
                  </strong>
                  <span>
                    {match.score === null
                      ? "No recognized skills"
                      : "skill overlap"}
                  </span>
                </div>
              </div>
              {match.score === null ? (
                <p className="match-reason">
                  There isn’t enough recognized skill information to calculate a
                  reliable score.
                </p>
              ) : (
                <div className="match-at-a-glance">
                  <p>
                    <span>Comfortable</span>
                    {skillNames(match.matching_skills, result.skill_demand)}
                  </p>
                  {match.developing_skills.length > 0 && (
                    <p>
                      <span>Learning</span>
                      {skillNames(match.developing_skills, result.skill_demand)}
                    </p>
                  )}
                  <p>
                    <span>Gaps</span>
                    {skillNames(match.missing_skills, result.skill_demand)}
                  </p>
                </div>
              )}
              <details className="score-explainer">
                <summary>
                  {match.score === null ? "Why no score?" : "Why this score?"}
                  <ChevronDown size={16} aria-hidden="true" />
                </summary>
                <div className="score-explainer-body">
                  <p>{match.explanation}</p>
                  {match.score !== null && (
                    <>
                      <dl className="credit-breakdown">
                        <div>
                          <dt>Comfortable · 1 credit</dt>
                          <dd>
                            {skillNames(
                              match.matching_skills,
                              result.skill_demand,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Learning · 0.5 credit</dt>
                          <dd>
                            {skillNames(
                              match.developing_skills,
                              result.skill_demand,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Not yet · 0 credits</dt>
                          <dd>
                            {skillNames(
                              match.missing_skills,
                              result.skill_demand,
                            )}
                          </dd>
                        </div>
                      </dl>
                      <p className="score-equation">
                        <span>
                          {match.earned_credits} credits ÷{" "}
                          {match.recognized_skill_count} recognized skills × 100
                        </span>
                        <strong>{match.score.toFixed(1)}%</strong>
                      </p>
                    </>
                  )}
                  <details className="source-excerpt">
                    <summary>View source description & evidence</summary>
                    <p className="vacancy-description">
                      {match.job.description || "No description was provided."}
                    </p>
                    {match.job.skills.length ? (
                      <ul className="evidence-list">
                        {match.job.skills.map((skill) => (
                          <li key={skill.skill_id}>
                            <strong>{skill.skill_name}</strong> — “
                            {skill.matched_alias}” in{" "}
                            {skill.source_field === "structured_skills"
                              ? "structured skills"
                              : "the description"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No canonical skill evidence was found.</p>
                    )}
                    <p className="source-record-note">
                      {match.job.is_demo ? "Demo CSV" : "HeadHunter API"} · {match.job.external_id} · Publication date{" "}
                      {match.job.published_at || "not provided"}.
                      {match.job.is_demo && " No live application link."}
                    </p>
                  </details>
                </div>
              </details>
              {!match.job.is_demo && /^https:\/\/hh\.ru\/vacancy\/[0-9]{1,20}$/.test(match.job.url || "") && (
                <a className="text-link original-vacancy" href={match.job.url!} target="_blank" rel="noopener noreferrer">View original vacancy on hh.ru<span className="sr-only"> (opens in a new tab)</span></a>
              )}
            </article>
          ))}
        </div>
      ) : (
        <ResultsEmpty
          title="No vacancies in this view."
          description="Choose another group to see the available comparisons."
          onReset={filter !== "all" ? () => setFilter("all") : undefined}
        />
      )}
    </section>
  );
}
