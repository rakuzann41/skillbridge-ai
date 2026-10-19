"use client";

import { SiteHeader } from "@/components/site-header";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width roadmap-main">
        <section className="roadmap-error" role="alert">
          <h1>Your roadmap couldn’t be opened.</h1>
          <p>Try opening the page again to restore your saved progress.</p>
          <div className="result-state-actions">
            <button onClick={retry} className="button button-primary">
              Try again
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
