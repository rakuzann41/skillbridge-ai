"use client";

import { useI18n } from "@/components/preferences-provider";
import { formatDate } from "@/lib/i18n";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Database, RefreshCw } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
import type { ResultView } from "@/lib/results-presentation";
import { SkillGaps } from "@/components/results/skill-gaps";
import { JobMatches } from "@/components/results/job-matches";
import { ResultsMethod } from "@/components/results/results-method";
import { ResultsEmpty } from "@/components/results/results-state";

const tabs: { id: ResultView; label: string }[] = [
  { id: "gaps", label: "Skill gaps" },
  { id: "matches", label: "Job matches" },
  { id: "method", label: "How it works" },
];

export function AnalysisResults({ result }: { result: AnalysisResult }) {
  const { t, locale } = useI18n();
  const [view, setView] = useState<ResultView>("gaps");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const prefix = useId();
  function switchView(id: ResultView) {
    setView(id);
    refs.current[tabs.findIndex((tab) => tab.id === id)]?.focus();
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    switchView(tabs[next].id);
  }
  return (
    <>
      <div className="results-title-row">
        <div>
          <p className="eyebrow">{t("JUNIOR DATA ANALYST")}</p>
          <h1>
            {" "}
            {t("Your next step,")}{" "}
            <span className="serif-accent">{t("a little clearer.")}</span>
          </h1>
          <p>
            {" "}
            {t(
              "See what you bring, where to focus, and how each vacancy compares.",
            )}{" "}
          </p>
        </div>
        <Link className="text-link" href="/setup">
          {" "}
          {t("Edit my skills")} <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="results-provenance">
        <span className="source-badge">
          <Database size={13} aria-hidden="true" />
          {result.is_demo ? t("Demo CSV") : t("HeadHunter API")}
        </span>
        <span>
          {t("Vacancies: {count} · Scored: {scored}", {
            count: result.sample_size,
            scored: result.scorable_count,
          })}
        </span>
        <time dateTime={result.analyzed_at}>
          {" "}
          {t("Analyzed")} {formatDate(result.analyzed_at, locale, true)}
        </time>
        <span className="saved-label">{t("Saved to your account")}</span>
        {result.source_fetched_at && (
          <time dateTime={result.source_fetched_at}>
            {t("Fetched")} {formatDate(result.source_fetched_at, locale, true)}
          </time>
        )}
      </div>
      <p className="sample-context">
        {result.is_demo
          ? t(
              "Fictional vacancy sample for exploring your skills. Counts describe this sample only.",
            )
          : t(
              "Saved HeadHunter vacancy sample. Counts describe this search only; availability may have changed. Check the original listing.",
            )}
      </p>
      <nav
        className="results-tabs"
        role="tablist"
        aria-label={t("Analysis results")}
      >
        {tabs.map((tab, index) => (
          <button
            role="tab"
            key={tab.id}
            id={`${prefix}-${tab.id}-tab`}
            aria-selected={view === tab.id}
            aria-controls={`${prefix}-${tab.id}-panel`}
            tabIndex={view === tab.id ? 0 : -1}
            ref={(node) => {
              refs.current[index] = node;
            }}
            onKeyDown={(event) => tabKey(event, index)}
            onClick={() => setView(tab.id)}
          >
            {t(tab.label || "")}
            {tab.id === "matches" && <span>{result.matches.length}</span>}
          </button>
        ))}
      </nav>
      {tabs.map((tab) => (
        <div
          role="tabpanel"
          key={tab.id}
          id={`${prefix}-${tab.id}-panel`}
          aria-labelledby={`${prefix}-${tab.id}-tab`}
          hidden={view !== tab.id}
          tabIndex={0}
          className="results-panel"
        >
          {view === tab.id &&
            (tab.id === "gaps" ? (
              <SkillGaps
                result={result}
                onViewMatches={() => switchView("matches")}
              />
            ) : tab.id === "matches" ? (
              <JobMatches result={result} />
            ) : (
              <ResultsMethod result={result} />
            ))}
        </div>
      ))}
      {!result.matches.length && (
        <ResultsEmpty
          title={t("No vacancy records to compare.")}
          description={t(
            "Start a new analysis to look for an available sample.",
          )}
        />
      )}
      <footer className="results-footer">
        <p>
          {" "}
          {t(
            "This result uses the skills saved at analysis time. Profile edits apply to your next comparison.",
          )}{" "}
        </p>
        <Link
          className="text-link"
          href={`/roadmap?analysis=${result.analysis_id}`}
        >
          {" "}
          {t("Open my roadmap")} <ArrowUpRight size={15} />
        </Link>
        <Link className="text-link" href="/analysis">
          <RefreshCw size={14} /> {t("New analysis")}{" "}
        </Link>
      </footer>
    </>
  );
}
