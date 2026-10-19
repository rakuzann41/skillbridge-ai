import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import type { ResultsFailure } from "@/lib/results-presentation";

export function ResultsLoading({
  phase = "load",
}: {
  phase?: "session" | "load" | "create";
}) {
  const label =
    phase === "session"
      ? "Checking your account…"
      : phase === "create"
        ? "Comparing your skills…"
        : "Opening your saved results…";
  return (
    <section
      className="results-loading"
      aria-busy="true"
      aria-label="Loading analysis"
    >
      <div role="status" aria-live="polite" className="loading-message">
        <LoaderCircle size={20} className="loading-spinner" />
        <div>
          <h2>{label}</h2>
          <p>
            {phase === "create"
              ? "We’re comparing the sample and saving your results."
              : "Your comparison will appear here once it’s ready."}
          </p>
        </div>
      </div>
      <div className="results-skeleton" aria-hidden="true">
        <span />
        <span />
        <div>
          <i />
          <i />
          <i />
        </div>
      </div>
    </section>
  );
}

export function ResultsError({
  failure,
  onRetry,
  onSignIn,
  pending = false,
  recoveryError = "",
  onDemo,
}: {
  failure: ResultsFailure;
  onRetry: () => void;
  onSignIn?: () => void;
  pending?: boolean;
  recoveryError?: string;
  onDemo?: () => void;
}) {
  return (
    <section
      className="results-error"
      role="alert"
      aria-labelledby="results-error-heading"
    >
      <TriangleAlert size={24} strokeWidth={1.5} />
      <h2 id="results-error-heading">{failure.title}</h2>
      <p>{failure.description}</p>
      <div className="result-state-actions">
        {failure.action === "retry" ? (
          <button
            className="button button-primary"
            onClick={onRetry}
            disabled={pending}
          >
            {failure.actionLabel}
            <ArrowRight size={16} />
          </button>
        ) : failure.action === "sign-in" && onSignIn ? (
          <button
            className="button button-primary"
            disabled={pending}
            onClick={onSignIn}
          >
            {pending ? "Reconnecting…" : failure.actionLabel}
            <ArrowRight size={16} />
          </button>
        ) : (
          <Link
            className="button button-primary"
            href={
              failure.action === "profile"
                ? "/setup"
                : failure.action === "sign-in"
                  ? "/sign-in"
                  : "/analysis"
            }
          >
            {failure.actionLabel}
            <ArrowRight size={16} />
          </Link>
        )}
        {onDemo && <button className="button button-outline" onClick={onDemo}>Use Demo CSV instead</button>}
        <Link className="text-link" href="/setup">
          Back to my profile
        </Link>
      </div>
      {recoveryError && <p className="form-error">{recoveryError}</p>}
    </section>
  );
}

export function ResultsEmpty({
  title,
  description,
  onReset,
}: {
  title: string;
  description: string;
  onReset?: () => void;
}) {
  return (
    <div className="results-empty">
      <FileSearch size={25} strokeWidth={1.5} />
      <h3>{title}</h3>
      <p>{description}</p>
      {onReset && (
        <button className="button button-outline" onClick={onReset}>
          Show all
        </button>
      )}
    </div>
  );
}
