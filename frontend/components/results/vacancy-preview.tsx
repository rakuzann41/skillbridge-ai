"use client";

import { ChevronDown } from "lucide-react";
import { useI18n } from "@/components/preferences-provider";
import { formatDate } from "@/lib/i18n";
import type { AnalysisResult } from "@/types/analysis";

export function VacancyPreview({
  job,
}: {
  job: AnalysisResult["matches"][number]["job"];
}) {
  const { t, locale } = useI18n();
  const published =
    job.published_at && Number.isFinite(Date.parse(job.published_at))
      ? job.published_at
      : null;

  return (
    <details className="score-explainer vacancy-preview">
      <summary>
        {t("Vacancy preview")}
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div className="score-explainer-body vacancy-preview-body">
        <dl className="vacancy-facts">
          <div>
            <dt>{t("Publication date")}</dt>
            <dd>
              {published ? (
                <time dateTime={published}>{formatDate(published, locale)}</time>
              ) : t("not provided")}
            </dd>
          </div>
          {job.experience && (
            <div>
              <dt>{t("Experience")}</dt>
              <dd>{job.experience}</dd>
            </div>
          )}
        </dl>
        <p className="source-record-note">
          {job.is_demo
            ? t("Demo CSV")
            : t(
                "HeadHunter API excerpt. Availability may have changed; check the original listing.",
              )}
        </p>
        <p className="vacancy-description" lang={job.is_demo ? "en" : undefined}>
          {job.description || t("No description was provided.")}
        </p>
      </div>
    </details>
  );
}
