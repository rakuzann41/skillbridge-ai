"use client";

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
  return (
    <div className="roadmap-loading" role="status">
      <LoaderCircle size={20} className="loading-spinner" aria-hidden="true" />
      <p>{message}</p>
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
  const [notice, setNotice] = useState("");
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
        setNotice("Your roadmap is saved. You can return to it any time.");
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
    setNotice(`Saving ${item.title}…`);
    try {
      const saved = await saveRoadmapItem(
        client,
        item.id,
        !item.completed,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setRoadmap(saved);
        setNotice(
          `${item.title} marked ${item.completed ? "incomplete" : "complete"}. Progress saved to your account.`,
        );
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        if (error instanceof ApiError && error.status === 401)
          setError({ status: 401, creating: false });
        else setSaveError(true);
        setNotice("");
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
      setNotice("Couldn’t renew your session. Please try again.");
    }
  }

  const title = (
    <div className="roadmap-heading">
      <div>
        <p className="eyebrow">JUNIOR DATA ANALYST</p>
        <h1>
          Your learning <span className="serif-accent">roadmap.</span>
        </h1>
        <p>One focused path. A practical task at every stage.</p>
      </div>
      <Link className="text-link" href="/setup">
        My skills <ArrowUpRight size={16} />
      </Link>
    </div>
  );
  if (loading || creating)
    return (
      <>
        {title}
        <RoadmapLoading
          message={creating ? "Creating and saving your roadmap…" : undefined}
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
              ? "Let’s reconnect your account."
              : profile
                ? "Save your starting point first."
                : source
                  ? "This comparison isn’t available."
                  : error.creating
                    ? "Your roadmap couldn’t be created."
                    : "Your roadmap couldn’t be opened."}
          </h2>
          <p>
            {expired
              ? "Sign in again to open your private roadmap."
              : profile
                ? "Save your skills before creating a learning plan. Starting from scratch is welcome."
                : source
                  ? "You can create a roadmap from your saved profile, or run a new analysis first."
                  : "The service may be temporarily unavailable. Your saved progress is kept. Please try again."}
          </p>
          <div className="result-state-actions">
            {expired ? (
              <button className="button button-primary" onClick={reconnect}>
                Sign in again
              </button>
            ) : profile ? (
              <Link href="/setup" className="button button-primary">
                Review my profile
              </Link>
            ) : source ? (
              <Link href="/roadmap" className="button button-primary">
                Use my saved profile
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
                Try again
              </button>
            )}
            <Link href="/analysis" className="text-link">
              Back to analysis
            </Link>
          </div>
          {notice && <p role="status">{notice}</p>}
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
          <h2>A clear place to begin.</h2>
          <p>
            Six stages covering Python, SQL, spreadsheets, analysis,
            visualization, and a small project. Each has a practice task and
            reviewed learning links.
          </p>
          <p>
            {analysisId
              ? "Use the skill gaps in your selected analysis to set the initial stage order."
              : "Start with the foundation order and your saved skill confidence."}{" "}
            Your checklist stays saved as you learn.
          </p>
          <button className="button button-primary" onClick={create}>
            Create my roadmap <ArrowRight size={17} />
          </button>
          <p className="roadmap-caption">
            Creating another analysis will keep your roadmap and completed
            stages.
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
            <p className="eyebrow">YOUR PROGRESS</p>
            <h2 id="progress-heading">
              {roadmap.completed_count} of {roadmap.total_count} stages complete
            </h2>
          </div>
          <strong>{roadmap.progress_percentage}%</strong>
        </div>
        <progress
          max={roadmap.total_count}
          value={roadmap.completed_count}
          aria-label="Roadmap completion"
        >
          {roadmap.progress_percentage}%
        </progress>
        {next ? (
          <a href={`#stage-${next.id}`} className="roadmap-next">
            <span>Next incomplete stage</span>
            <strong>
              {next.title} <ArrowDown size={16} />
            </strong>
          </a>
        ) : (
          <p className="roadmap-finished">
            All stages marked complete. Keep practicing, or uncheck a stage
            whenever you want to revisit it.
          </p>
        )}
      </section>
      <div className="roadmap-context">
        <p>
          {roadmap.source_analysis_id ? (
            <>
              Initial order based on your{" "}
              <Link href={`/analysis/${roadmap.source_analysis_id}`}>
                {roadmap.source_type === "live_api" ? "HeadHunter analysis" : "Demo CSV analysis"}
              </Link>
              {roadmap.analyzed_at
                ? ` from ${new Date(roadmap.analyzed_at).toLocaleDateString()}`
                : ""}
              . Python stays before pandas; the project comes last.
            </>
          ) : (
            "A foundation order based on your saved profile at creation time."
          )}
        </p>
        <p>
          Completion is self-reported. Check a stage when you finish its
          practice task; uncheck it to undo.
        </p>
      </div>
      <p className="roadmap-save-status" role="status" aria-live="polite">
        {notice || "Progress is saved to your account after each change."}
      </p>
      {saveError && (
        <div className="roadmap-save-error" role="alert">
          <p>
            We couldn’t confirm that change. Reload your progress to see the
            latest saved state before making another change.
          </p>
          <button
            className="button button-outline"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RotateCcw size={15} />
            Reload progress
          </button>
        </div>
      )}
      <ol className="roadmap-list" aria-label="Learning stages">
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
                  STAGE {String(item.position).padStart(2, "0")}
                </span>
                <h2>
                  <label htmlFor={`complete-${item.id}`}>{item.title}</label>
                </h2>
              </div>
              <span
                id={`stage-status-${item.id}`}
                className="roadmap-stage-state"
              >
                {pendingItem === item.id
                  ? "Saving…"
                  : item.completed
                    ? "Complete"
                    : "To do"}
              </span>
            </div>
            <div className="roadmap-stage-body">
              <p>{item.description}</p>
              {item.focus_skills.length > 0 && (
                <p className="roadmap-focus">
                  <span>Practice focus</span> {item.focus_skills.join(", ")} ·
                  based on your starting confidence
                </p>
              )}
              <div className="roadmap-outcome">
                <h3>Try it yourself</h3>
                <p>{item.outcome}</p>
              </div>
              <ul
                className="roadmap-resources"
                aria-label={`Learning links for ${item.title}`}
              >
                {item.resources.map((resource) => (
                  <li key={resource.label}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {resource.label}
                      <ArrowUpRight size={16} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <p>{resource.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      <footer className="roadmap-footer">
        <p>
          Your stage order and starting confidence are kept with this plan. New
          analyses and profile edits won’t reset your progress.
        </p>
        <Link className="text-link" href="/analysis">
          Compare my skills again <ArrowRight size={15} />
        </Link>
      </footer>
    </>
  );
}

export function RoadmapClient({ analysisId }: { analysisId?: string }) {
  const { client, session, loading, configured } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (configured && !loading && !session) router.replace("/sign-in");
  }, [configured, loading, session, router]);
  if (!configured) return <ConfigurationNotice />;
  if (loading || !session || !client)
    return <RoadmapLoading message="Checking your account…" />;
  return (
    <LoadedRoadmap
      key={`${session.user.id}:${analysisId || "profile"}`}
      client={client}
      analysisId={analysisId}
    />
  );
}
