"use client";

import { useI18n } from "@/components/preferences-provider";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { prioritySkills, type GapFilter } from "@/lib/results-presentation";
import type { AnalysisResult } from "@/types/analysis";
import { ResultsEmpty } from "@/components/results/results-state";

export function SkillGaps({
  result,
  onViewMatches,
}: {
  result: AnalysisResult;
  onViewMatches: () => void;
}) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<GapFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const allPriorities = prioritySkills(result);
  const selected = prioritySkills(result, filter);
  const shown = showAll ? selected : selected.slice(0, 3);
  const focus = allPriorities[0];
  const strengths = result.skill_demand.filter(
    (skill) => skill.user_level === "comfortable",
  );
  const filters: { id: GapFilter; label: string; count: number }[] = [
    { id: "all", label: "All priorities", count: allPriorities.length },
    {
      id: "not-yet",
      label: "Not yet",
      count: allPriorities.filter((skill) => skill.user_level === "not-yet")
        .length,
    },
    {
      id: "learning",
      label: "Learning",
      count: allPriorities.filter((skill) => skill.user_level === "learning")
        .length,
    },
  ];
  return (
    <div className="gap-layout">
      <div className="gap-main">
        {focus ? (
          <section className="focus-next">
            <span className="eyebrow">{t("A PRACTICAL PLACE TO FOCUS")}</span>
            <h2>{t("Practice {skill}", { skill: t(focus.skill_name) })}</h2>
            <p>
              {t(
                "{skill} appears in {count} of {total} vacancies in this sample.",
                {
                  skill: t(focus.skill_name),
                  count: focus.vacancy_count,
                  total: result.sample_size,
                },
              )}{" "}
              {focus.user_level === "learning"
                ? t("You’re already learning it—give it some focused practice.")
                : t("You marked it Not yet, so it’s a useful gap to explore.")}
            </p>
            <span className="focus-footnote">
              {" "}
              {t(
                "Highest-frequency gap in this sample · self-reported confidence",
              )}{" "}
            </span>
          </section>
        ) : (
          <section className="focus-next">
            <span className="eyebrow">{t("YOUR STARTING POINT")}</span>
            <h2>
              {result.skill_demand.length
                ? t("A foundation to build on.")
                : t("More detail is needed.")}
            </h2>
            <p>
              {result.skill_demand.length
                ? t(
                    "You marked every recognized skill in this sample Comfortable. Review the job explanations to see what each comparison covers.",
                  )
                : t(
                    "No known skills were recognized in these vacancy records. We can’t identify sample-supported gaps yet.",
                  )}
            </p>
          </section>
        )}
        <section
          className="priority-section"
          aria-labelledby="priority-heading"
        >
          <div className="section-title-row">
            <div>
              <h2 id="priority-heading">{t("Your skill priorities")}</h2>
              <p>
                {" "}
                {t(
                  "Ordered by mentions in this sample, with each vacancy counted once.",
                )}{" "}
              </p>
            </div>
            <span className="quiet-count">
              {t("Skill gaps: {count}", { count: allPriorities.length })}
            </span>
          </div>
          <div
            className="result-filters"
            role="group"
            aria-label={t("Filter skill priorities")}
          >
            {filters.map((item) => (
              <button
                key={item.id}
                aria-pressed={filter === item.id}
                onClick={() => {
                  setFilter(item.id);
                  setShowAll(false);
                }}
              >
                {t(item.label || "")}
                <span>{item.count}</span>
              </button>
            ))}
          </div>
          <div aria-live="polite" className="result-filter-status sr-only">
            {t("Showing {count} of {total} skill priorities", {
              count: shown.length,
              total: selected.length,
            })}
          </div>
          {shown.length ? (
            <ol className="priority-list">
              {shown.map((skill) => (
                <li key={skill.skill_id}>
                  <div>
                    <h3>{t(skill.skill_name || "")}</h3>
                    <span
                      className={`confidence-label ${skill.user_level === "learning" ? "is-learning" : ""}`}
                    >
                      {skill.user_level === "learning"
                        ? t("Still learning")
                        : t("Not yet explored")}
                    </span>
                  </div>
                  <div className="priority-demand">
                    <strong>
                      {skill.vacancy_count}
                      <span>/{result.sample_size}</span>
                    </strong>
                    <small>{t("vacancies mention it")}</small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <ResultsEmpty
              title={
                allPriorities.length
                  ? t("No skills in this group.")
                  : t("No gaps identified in this sample.")
              }
              description={
                allPriorities.length
                  ? t(
                      "Try another confidence group to see the rest of your priorities.",
                    )
                  : t(
                      "This reflects your saved confidence and the skills recognized in this sample.",
                    )
              }
              onReset={
                filter !== "all"
                  ? () => {
                      setFilter("all");
                      setShowAll(false);
                    }
                  : undefined
              }
            />
          )}
          {selected.length > 3 && (
            <button
              className="show-more-button"
              aria-expanded={showAll}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? t("Show fewer priorities")
                : t("Show all priorities ({count})", {
                    count: selected.length,
                  })}
            </button>
          )}
        </section>
        <div className="results-next-action">
          <div>
            <h3>{t("Turn your gaps into practice.")}</h3>
            <p>
              {" "}
              {t(
                "Follow six focused stages with learning links and saved progress.",
              )}{" "}
            </p>
          </div>
          <Link
            className="button button-primary"
            href={`/roadmap?analysis=${result.analysis_id}`}
          >
            {" "}
            {t("Open my roadmap")} <ArrowRight size={17} />
          </Link>
          <button
            className="text-link results-review-button"
            onClick={onViewMatches}
          >
            {" "}
            {t("Review job matches")} <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <aside className="results-sidebar">
        <section className="strengths-panel">
          <span className="eyebrow">{t("SKILLS TO BUILD ON")}</span>
          <h2>{t("Your strengths")}</h2>
          <p>
            {t("Skills you marked Comfortable that appear in this sample.")}
          </p>
          {strengths.length ? (
            <ul>
              {strengths.map((skill) => (
                <li key={skill.skill_id}>
                  <span>{t(skill.skill_name || "")}</span>
                  <small>
                    {skill.vacancy_count}/{result.sample_size} {t("mentions")}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="strengths-empty">
              {" "}
              {t(
                "No skills marked Comfortable yet. Learning skills and starting from scratch are both valid starting points.",
              )}{" "}
            </p>
          )}
          <Link href="/setup" className="text-link">
            {" "}
            {t("Update your skills")} <ArrowUpRight size={15} />
          </Link>
        </section>
        <div className="snapshot-note">
          <h3>{t("Based on your saved skills")}</h3>
          <p>
            {" "}
            {t(
              "This comparison keeps the confidence levels you had when it was created. Editing your profile won’t change these results.",
            )}{" "}
          </p>
        </div>
      </aside>
    </div>
  );
}
