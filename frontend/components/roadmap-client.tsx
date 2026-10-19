"use client";

import { useI18n } from "@/components/preferences-provider";
import { formatDate } from "@/lib/i18n";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  LoaderCircle,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConfigurationNotice } from "@/components/configuration-notice";
import {
  ApiError,
  createRoadmap,
  getRoadmap,
  saveRoadmapItem,
} from "@/lib/api";
import type { Roadmap } from "@/types/roadmap";

function RoadmapLoading({
  message = "Opening your saved roadmap…",
}: {
  message?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="roadmap-loading" role="status">
      <LoaderCircle size={20} className="loading-spinner" aria-hidden="true" />
      <p>{t(message || "")}</p>
    </div>
  );
}

function LoadedRoadmap({
  client,
  analysisId,
}: {
  client: SupabaseClient;
  analysisId?: string;
}) {
  const { t, locale } = useI18n();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<{
    status: number;
    creating: boolean;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [notice, setNotice] = useState<{ key: string; stage?: string } | null>(
    null,
  );
  const mutation = useRef<AbortController | null>(null);
  const router = useRouter();
  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getRoadmap(client, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) {
          setRoadmap(value);
          setSaveError(false);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setError({
            status: error instanceof ApiError ? error.status : 0,
            creating: false,
          });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [client, attempt]);

  async function create() {
    if (mutation.current) return;
    const controller = new AbortController();
    mutation.current = controller;
    setCreating(true);
    setError(null);
    try {
      const saved = await createRoadmap(client, analysisId, controller.signal);
      if (!controller.signal.aborted) {
        setRoadmap(saved);
        setNotice({
          key: "Your roadmap is saved. You can return to it any time.",
        });
      }
    } catch (error) {
      if (!controller.signal.aborted)
        setError({
          status: error instanceof ApiError ? error.status : 0,
          creating: true,
        });
    } finally {
      mutation.current = null;
      if (!controller.signal.aborted) setCreating(false);
    }
  }

  async function toggle(item: Roadmap["items"][number]) {
    if (mutation.current || saveError) return;
    const controller = new AbortController();
    mutation.current = controller;
    setPendingItem(item.id);
    setNotice({ key: "Saving {stage}…", stage: item.title });
    try {
      const saved = await saveRoadmapItem(
        client,
        item.id,
        !item.completed,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setRoadmap(saved);
        setNotice({
          key: item.completed
            ? "{stage} marked incomplete. Progress saved to your account."
            : "{stage} marked complete. Progress saved to your account.",
          stage: item.title,
        });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        if (error instanceof ApiError && error.status === 401)
          setError({ status: 401, creating: false });
        else setSaveError(true);
        setNotice(null);
      }
    } finally {
      mutation.current = null;
      if (!controller.signal.aborted) setPendingItem(null);
    }
  }

  async function reconnect() {
    if (mutation.current) return;
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      router.replace("/sign-in");
    } catch {
      setNotice({ key: "Couldn’t renew your session. Please try again." });
    }
  }

  const title = (
    <div className="roadmap-heading">
      <div>
        <p className="eyebrow">{t("JUNIOR DATA ANALYST")}</p>
        <h1>
          {" "}
          {t("Your learning")}{" "}
          <span className="serif-accent">{t("roadmap.")}</span>
        </h1>
        <p>{t("One focused path. A practical task at every stage.")}</p>
      </div>
      <Link className="text-link" href="/setup">
        {" "}
        {t("My skills")} <ArrowUpRight size={16} />
      </Link>
    </div>
  );
  if (loading || creating)
    return (
      <>
        {title}
        <RoadmapLoading
          message={
            creating ? t("Creating and saving your roadmap…") : undefined
          }
        />
      </>
    );
  if (error) {
    const expired = error.status === 401;
    const profile = error.creating && error.status === 409 && !analysisId;
    const source =
      error.creating && [404, 409, 422].includes(error.status) && analysisId;
    return (
      <>
        {title}
        <section className="roadmap-error" role="alert">
          <TriangleAlert size={24} aria-hidden="true" />
          <h2>
            {expired
              ? t("Let’s reconnect your account.")
              : profile
                ? t("Save your starting point first.")
                : source
                  ? t("This comparison isn’t available.")
                  : error.creating
                    ? t("Your roadmap couldn’t be created.")
                    : t("Your roadmap couldn’t be opened.")}
          </h2>
          <p>
            {expired
              ? t("Sign in again to open your private roadmap.")
              : profile
                ? t(
                    "Save your skills before creating a learning plan. Starting from scratch is welcome.",
                  )
                : source
                  ? t(
                      "You can create a roadmap from your saved profile, or run a new analysis first.",
                    )
                  : t(
                      "The service may be temporarily unavailable. Your saved progress is kept. Please try again.",
                    )}
          </p>
          <div className="result-state-actions">
            {expired ? (
              <button className="button button-primary" onClick={reconnect}>
                {" "}
                {t("Sign in again")}{" "}
              </button>
            ) : profile ? (
              <Link href="/setup" className="button button-primary">
                {" "}
                {t("Review my profile")}{" "}
              </Link>
            ) : source ? (
              <Link href="/roadmap" className="button button-primary">
                {" "}
                {t("Use my saved profile")}{" "}
              </Link>
            ) : (
              <button
                className="button button-primary"
                onClick={() =>
                  error.creating
                    ? void create()
                    : setAttempt((value) => value + 1)
                }
              >
                {" "}
                {t("Try again")}{" "}
              </button>
            )}
            <Link href="/analysis" className="text-link">
              {" "}
              {t("Back to analysis")}{" "}
            </Link>
          </div>
          {notice && (
            <p role="status">
              {t(notice.key, { stage: t(notice.stage || "") })}
            </p>
          )}
        </section>
      </>
    );
  }
  if (!roadmap)
    return (
      <>
        {title}
        <section className="roadmap-start">
          <BookOpen size={28} strokeWidth={1.5} aria-hidden="true" />
          <h2>{t("A clear place to begin.")}</h2>
          <p>
            {" "}
            {t(
              "Six stages covering Python, SQL, spreadsheets, analysis, visualization, and a small project. Each has a practice task and reviewed learning links.",
            )}{" "}
          </p>
          <p>
            {analysisId
              ? t(
                  "Use the skill gaps in your selected analysis to set the initial stage order.",
                )
              : t(
                  "Start with the foundation order and your saved skill confidence.",
                )}{" "}
            {t("Your checklist stays saved as you learn.")}{" "}
          </p>
          <button className="button button-primary" onClick={create}>
            {" "}
            {t("Create my roadmap")} <ArrowRight size={17} />
          </button>
          <p className="roadmap-caption">
            {" "}
            {t(
              "Creating another analysis will keep your roadmap and completed stages.",
            )}{" "}
          </p>
        </section>
      </>
    );

  const next = roadmap.items.find((item) => item.id === roadmap.next_item_id);
  return (
    <>
      {title}
      <section className="roadmap-progress" aria-labelledby="progress-heading">
        <div className="roadmap-progress-top">
          <div>
            <p className="eyebrow">{t("YOUR PROGRESS")}</p>
            <h2 id="progress-heading">
              {t("Stages complete: {count} of {total}", {
                count: roadmap.completed_count,
                total: roadmap.total_count,
              })}
            </h2>
          </div>
          <strong>{roadmap.progress_percentage}%</strong>
        </div>
        <progress
          max={roadmap.total_count}
          value={roadmap.completed_count}
          aria-label={t("Roadmap completion")}
        >
          {roadmap.progress_percentage}%
        </progress>
        {next ? (
          <a href={`#stage-${next.id}`} className="roadmap-next">
            <span>{t("Next incomplete stage")}</span>
            <strong>
              {t(next.title)} <ArrowDown size={16} />
            </strong>
          </a>
        ) : (
          <p className="roadmap-finished">
            {" "}
            {t(
              "All stages marked complete. Keep practicing, or uncheck a stage whenever you want to revisit it.",
            )}{" "}
          </p>
        )}
      </section>
      <div className="roadmap-context">
        <p>
          {roadmap.source_analysis_id ? (
            <>
              {" "}
              {t("Initial order based on your")}{" "}
              <Link href={`/analysis/${roadmap.source_analysis_id}`}>
                {roadmap.source_type === "live_api"
                  ? t("HeadHunter analysis")
                  : t("Demo CSV analysis")}
              </Link>
              {roadmap.analyzed_at
                ? t(" from {date}", {
                    date: formatDate(roadmap.analyzed_at, locale),
                  })
                : ""}{" "}
              {t(". Python stays before pandas; the project comes last.")}{" "}
            </>
          ) : (
            t(
              "A foundation order based on your saved profile at creation time.",
            )
          )}
        </p>
        <p>
          {" "}
          {t(
            "Completion is self-reported. Check a stage when you finish its practice task; uncheck it to undo.",
          )}{" "}
        </p>
      </div>
      <p className="roadmap-save-status" role="status" aria-live="polite">
        {notice
          ? t(notice.key, { stage: t(notice.stage || "") })
          : t("Progress is saved to your account after each change.")}
      </p>
      {saveError && (
        <div className="roadmap-save-error" role="alert">
          <p>
            {" "}
            {t(
              "We couldn’t confirm that change. Reload your progress to see the latest saved state before making another change.",
            )}{" "}
          </p>
          <button
            className="button button-outline"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RotateCcw size={15} /> {t("Reload progress")}{" "}
          </button>
        </div>
      )}
      <p className="roadmap-caption">
        {t("Learning resources may be in another language.")}
      </p>
      <ol className="roadmap-list" aria-label={t("Learning stages")}>
        {roadmap.items.map((item) => (
          <li
            id={`stage-${item.id}`}
            key={item.id}
            tabIndex={-1}
            className={item.completed ? "stage-completed" : undefined}
          >
            <div className="roadmap-stage-heading">
              <input
                type="checkbox"
                id={`complete-${item.id}`}
                checked={item.completed}
                aria-disabled={Boolean(pendingItem) || saveError}
                onChange={() => void toggle(item)}
                aria-describedby={`stage-status-${item.id}`}
              />
              <div>
                <span className="roadmap-stage-number">
                  {" "}
                  {t("STAGE")} {String(item.position).padStart(2, "0")}
                </span>
                <h2>
                  <label htmlFor={`complete-${item.id}`}>
                    {t(item.title || "")}
                  </label>
                </h2>
              </div>
              <span
                id={`stage-status-${item.id}`}
                className="roadmap-stage-state"
              >
                {pendingItem === item.id
                  ? t("Saving…")
                  : item.completed
                    ? t("Complete")
                    : t("To do")}
              </span>
            </div>
            <div className="roadmap-stage-body">
              <p>{t(item.description || "")}</p>
              {item.focus_skills.length > 0 && (
                <p className="roadmap-focus">
                  <span>{t("Practice focus")}</span>{" "}
                  {item.focus_skills.map((name) => t(name)).join(", ")}{" "}
                  {t("· based on your starting confidence")}{" "}
                </p>
              )}
              <div className="roadmap-outcome">
                <h3>{t("Try it yourself")}</h3>
                <p>{t(item.outcome || "")}</p>
              </div>
              <ul
                className="roadmap-resources"
                aria-label={t("Learning links for {stage}", {
                  stage: t(item.title),
                })}
              >
                {item.resources.map((resource) => (
                  <li key={resource.label}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(resource.label || "")}
                      <ArrowUpRight size={16} aria-hidden="true" />
                      <span className="sr-only">
                        {" "}
                        {t("(opens in a new tab)")}
                      </span>
                    </a>
                    <p>{t(resource.note || "")}</p>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      <footer className="roadmap-footer">
        <p>
          {" "}
          {t(
            "Your stage order and starting confidence are kept with this plan. New analyses and profile edits won’t reset your progress.",
          )}{" "}
        </p>
        <Link className="text-link" href="/analysis">
          {" "}
          {t("Compare my skills again")} <ArrowRight size={15} />
        </Link>
      </footer>
    </>
  );
}

export function RoadmapClient({ analysisId }: { analysisId?: string }) {
  const { t } = useI18n();
  const { client, session, loading, configured } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (configured && !loading && !session) router.replace("/sign-in");
  }, [configured, loading, session, router]);
  if (!configured) return <ConfigurationNotice />;
  if (loading || !session || !client)
    return <RoadmapLoading message={t("Checking your account…")} />;
  return (
    <LoadedRoadmap
      key={`${session.user.id}:${analysisId || "profile"}`}
      client={client}
      analysisId={analysisId}
    />
  );
}
