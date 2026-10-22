"use client";

import { useI18n } from "@/components/preferences-provider";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ArrowRight, Database, FileSearch } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConfigurationNotice } from "@/components/configuration-notice";
import { AnalysisResults } from "@/components/results/analysis-results";
import {
  ResultsLoading,
  ResultsError,
} from "@/components/results/results-state";
import { ApiError, createAnalysis, getAnalysis } from "@/lib/api";
import {
  resultsFailure,
  type AnalysisOperation,
  type ResultsFailure,
} from "@/lib/results-presentation";
import type { AnalysisResult } from "@/types/analysis";

type AnalysisState =
  | { kind: "idle" }
  | { kind: "loading" | "creating" }
  | { kind: "ready"; result: AnalysisResult }
  | {
      kind: "error";
      failure: ResultsFailure;
      operation: AnalysisOperation;
      offerDemo?: boolean;
    };

function AnalysisContent({
  client,
  analysisId,
}: {
  client: SupabaseClient;
  analysisId?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>({
    kind: analysisId ? "loading" : "idle",
  });
  const [attempt, setAttempt] = useState(0);
  const [reconnecting, setReconnecting] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [source, setSource] = useState<"headhunter" | "csv_demo">("headhunter");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const creation = useRef<AbortController | null>(null);
  useEffect(() => () => creation.current?.abort(), []);
  useEffect(() => {
    if (!analysisId) return;
    const controller = new AbortController();
    setState({ kind: "loading" });
    getAnalysis(client, analysisId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setState({ kind: "ready", result });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            kind: "error",
            failure: resultsFailure(error, "load"),
            operation: "load",
          });
      });
    return () => controller.abort();
  }, [client, analysisId, attempt]);

  async function analyze(selectedSource = source) {
    if (creation.current && !creation.current.signal.aborted) return;
    if (selectedSource === "headhunter" && !acceptedTerms) return;
    setSource(selectedSource);
    const controller = new AbortController();
    creation.current = controller;
    setState({ kind: "creating" });
    try {
      const saved = await createAnalysis(
        client,
        selectedSource,
        acceptedTerms,
        controller.signal,
      );
      if (!controller.signal.aborted)
        router.push(`/analysis/${saved.analysis_id}`);
    } catch (error) {
      if (!controller.signal.aborted)
        setState({
          kind: "error",
          failure: resultsFailure(error, "create"),
          operation: "create",
          offerDemo:
            selectedSource === "headhunter" &&
            error instanceof ApiError &&
            Boolean(error.code),
        });
      creation.current = null;
    }
  }
  async function reconnect() {
    setReconnecting(true);
    setRecoveryError("");
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      router.replace("/sign-in");
    } catch {
      setRecoveryError("Couldn’t renew your session. Please try again.");
      setReconnecting(false);
    }
  }
  if (state.kind === "loading" || state.kind === "creating")
    return (
      <ResultsLoading phase={state.kind === "creating" ? "create" : "load"} />
    );
  if (state.kind === "ready") return <AnalysisResults result={state.result} />;
  if (state.kind === "error")
    return (
      <ResultsError
        failure={state.failure}
        onRetry={() =>
          state.operation === "load"
            ? setAttempt((value) => value + 1)
            : void analyze()
        }
        onSignIn={reconnect}
        pending={reconnecting}
        recoveryError={recoveryError}
        onDemo={state.offerDemo ? () => void analyze("csv_demo") : undefined}
      />
    );
  return (
    <>
      <div className="results-title-row">
        <div>
          <p className="eyebrow">{t("JUNIOR DATA ANALYST")}</p>
          <h1>
            {" "}
            {t("Your skills,")}{" "}
            <span className="serif-accent">{t("in context.")}</span>
          </h1>
          <p>{t("A clearer view of what you know and what to learn next.")}</p>
        </div>
        <Link href="/setup" className="text-link">
          {" "}
          {t("Edit my skills")} <ArrowRight size={16} />
        </Link>
      </div>
      <section className="analysis-start">
        <FileSearch size={30} strokeWidth={1.5} />
        <h2>{t("Find your next learning priority.")}</h2>
        <p>
          {t(
            "Compare your saved skills with up to eight vacancies. See your gaps, explore each match, and trace the calculation.",
          )}
        </p>
        <fieldset className="analysis-source-picker">
          <legend>{t("Vacancy source")}</legend>
          <label>
            <input
              type="radio"
              name="source"
              value="headhunter"
              checked={source === "headhunter"}
              onChange={() => setSource("headhunter")}
            />{" "}
            {t("HeadHunter API")}
          </label>
          <label>
            <input
              type="radio"
              name="source"
              value="csv_demo"
              checked={source === "csv_demo"}
              onChange={() => setSource("csv_demo")}
            />{" "}
            {t("Demo CSV")}
          </label>
        </fieldset>
        <div className="start-source">
          <span className="source-badge">
            <Database size={13} />
            {source === "csv_demo" ? t("Demo CSV") : t("HeadHunter API")}
          </span>
          <p>
            {source === "csv_demo"
              ? t(
                  "Fictional Junior Data Analyst vacancies, with repeatable results.",
                )
              : t(
                  "Data Analyst titles · no experience or 1–3 years · all regions · published within 30 days. Availability is checked when fetched.",
                )}
          </p>
        </div>
        {source === "headhunter" && (
          <label className="hh-agreement">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
            />{" "}
            <span>
              {t("I have read and accept HeadHunter’s")}{" "}
              <a
                href="https://hh.ru/account/agreement"
                target="_blank"
                rel="noopener noreferrer"
                lang="ru"
              >
                Соглашение об оказании услуг по содействию в трудоустройстве
                (оферта)
              </a>{" "}
              {t("(employment assistance agreement; opens in a new tab).")}
            </span>
          </label>
        )}
        <button
          className="button button-primary"
          onClick={() => void analyze()}
          disabled={source === "headhunter" && !acceptedTerms}
        >
          {" "}
          {t("Analyze vacancies")} <ArrowRight size={17} />
        </button>
        <p className="start-save-note">
          {" "}
          {t(
            "Save any profile edits first. Your comparison will be saved to your account.",
          )}{" "}
        </p>
      </section>
    </>
  );
}

export function DemoAnalysis({ analysisId }: { analysisId?: string }) {
  const { t } = useI18n();
  const { client, session, loading, configured } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (configured && !loading && !session) router.replace("/sign-in");
  }, [configured, loading, session, router]);
  if (!configured) return <ConfigurationNotice />;
  if (loading || !session || !client) return <ResultsLoading phase="session" />;
  return (
    <AnalysisContent
      key={`${session.user.id}:${analysisId || "new"}`}
      client={client}
      analysisId={analysisId}
    />
  );
}
