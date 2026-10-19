"use client";

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
            <span className="eyebrow">A PRACTICAL PLACE TO FOCUS</span>
            <h2>
              {focus.user_level === "learning"
                ? "Build on your "
                : "Start with "}
              <span className="serif-accent">{focus.skill_name}</span>
              {focus.user_level === "learning" ? " skills." : "."}
            </h2>
            <p>
              {focus.skill_name} appears in{" "}
              <strong>
                {focus.vacancy_count} of {result.sample_size}
              </strong>{" "}
              vacancies in this sample.{" "}
              {focus.user_level === "learning"
                ? "You’re already learning it—give it some focused practice."
                : "You marked it Not yet, so it’s a useful gap to explore."}
            </p>
            <span className="focus-footnote">
              Highest-frequency gap in this sample · self-reported confidence
            </span>
          </section>
        ) : (
          <section className="focus-next">
            <span className="eyebrow">YOUR STARTING POINT</span>
            <h2>
              {result.skill_demand.length
                ? "A foundation to build on."
                : "More detail is needed."}
            </h2>
            <p>
              {result.skill_demand.length
                ? "You marked every recognized skill in this sample Comfortable. Review the job explanations to see what each comparison covers."
                : "No known skills were recognized in these vacancy records. We can’t identify sample-supported gaps yet."}
            </p>
          </section>
        )}
        <section
          className="priority-section"
          aria-labelledby="priority-heading"
        >
          <div className="section-title-row">
            <div>
              <h2 id="priority-heading">Your skill priorities</h2>
              <p>
                Ordered by mentions in this sample, with each vacancy counted
                once.
              </p>
            </div>
            <span className="quiet-count">{allPriorities.length} gaps</span>
          </div>
          <div
            className="result-filters"
            role="group"
            aria-label="Filter skill priorities"
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
                {item.label}
                <span>{item.count}</span>
              </button>
            ))}
          </div>
          <div aria-live="polite" className="result-filter-status sr-only">
            Showing {shown.length} of {selected.length} skill priorities
          </div>
          {shown.length ? (
            <ol className="priority-list">
              {shown.map((skill) => (
                <li key={skill.skill_id}>
                  <div>
                    <h3>{skill.skill_name}</h3>
                    <span
                      className={`confidence-label ${skill.user_level === "learning" ? "is-learning" : ""}`}
                    >
                      {skill.user_level === "learning"
                        ? "Still learning"
                        : "Not yet explored"}
                    </span>
                  </div>
                  <div className="priority-demand">
                    <strong>
                      {skill.vacancy_count}
                      <span>/{result.sample_size}</span>
                    </strong>
                    <small>vacancies mention it</small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <ResultsEmpty
              title={
                allPriorities.length
                  ? "No skills in this group."
                  : "No gaps identified in this sample."
              }
              description={
                allPriorities.length
                  ? "Try another confidence group to see the rest of your priorities."
                  : "This reflects your saved confidence and the skills recognized in this sample."
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
                ? "Show fewer priorities"
                : `Show all ${selected.length} priorities`}
            </button>
          )}
        </section>
        <div className="results-next-action">
          <div>
            <h3>Turn your gaps into practice.</h3>
            <p>
              Follow six focused stages with learning links and saved progress.
            </p>
          </div>
          <Link
            className="button button-primary"
            href={`/roadmap?analysis=${result.analysis_id}`}
          >
            Open my roadmap <ArrowRight size={17} />
          </Link>
          <button
            className="text-link results-review-button"
            onClick={onViewMatches}
          >
            Review job matches <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <aside className="results-sidebar">
        <section className="strengths-panel">
          <span className="eyebrow">SKILLS TO BUILD ON</span>
          <h2>Your strengths</h2>
          <p>Skills you marked Comfortable that appear in this sample.</p>
          {strengths.length ? (
            <ul>
              {strengths.map((skill) => (
                <li key={skill.skill_id}>
                  <span>{skill.skill_name}</span>
                  <small>
                    {skill.vacancy_count}/{result.sample_size} mentions
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="strengths-empty">
              No skills marked Comfortable yet. Learning skills and starting
              from scratch are both valid starting points.
            </p>
          )}
          <Link href="/setup" className="text-link">
            Update your skills <ArrowUpRight size={15} />
          </Link>
        </section>
        <div className="snapshot-note">
          <h3>Based on your saved skills</h3>
          <p>
            This comparison keeps the confidence levels you had when it was
            created. Editing your profile won’t change these results.
          </p>
        </div>
      </aside>
    </div>
  );
}
