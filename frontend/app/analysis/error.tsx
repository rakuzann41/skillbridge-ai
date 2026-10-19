"use client";

import { useI18n } from "@/components/preferences-provider";

import { SiteHeader } from "@/components/site-header";
import { ResultsError } from "@/components/results/results-state";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width analysis-main">
        <ResultsError
          failure={{
            title: t("This page couldn’t be opened."),
            description: t(
              "Something interrupted the page. Please try again to reopen your results.",
            ),
            action: "retry",
            actionLabel: t("Try again"),
          }}
          onRetry={retry}
        />
      </main>
    </>
  );
}
