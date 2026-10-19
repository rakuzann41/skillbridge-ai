"use client";

import { SiteHeader } from "@/components/site-header";
import { ResultsError } from "@/components/results/results-state";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width analysis-main">
        <ResultsError
          failure={{
            title: "This page couldn’t be opened.",
            description:
              "Something interrupted the page. Please try again to reopen your results.",
            action: "retry",
            actionLabel: "Try again",
          }}
          onRetry={retry}
        />
      </main>
    </>
  );
}
