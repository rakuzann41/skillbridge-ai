"use client";

import { useI18n } from "@/components/preferences-provider";

import type { AnalysisResult } from "@/types/analysis";
import { levels } from "@/lib/skills";

export function ResultsMethod({ result }: { result: AnalysisResult }) {
  const { t, locale } = useI18n();
  return (
    <section className="results-method" aria-labelledby="method-heading">
      <p className="eyebrow">{t("TRANSPARENT BY DESIGN")}</p>
      <h2 id="method-heading">{t("A score you can trace.")}</h2>
      <p>
        {" "}
        {t(
          "Each comparison uses the confidence levels you saved and the distinct skills recognized in a vacancy. Every recognized skill has the same weight.",
        )}{" "}
      </p>
      <div className="confidence-key">
        <div>
          <strong>1</strong>
          <span>{t("Comfortable")}</span>
        </div>
        <div>
          <strong>0.5</strong>
          <span>{t("Learning")}</span>
        </div>
        <div>
          <strong>0</strong>
          <span>{t("Not yet or unlisted")}</span>
        </div>
      </div>
      <div className="method-formula">
        <span className="meta-label">{t("SKILL OVERLAP")}</span>
        <p>{t("Earned credits ÷ recognized vacancy skills × 100")}</p>
      </div>
      <p>
        {" "}
        {t(
          "The result is rounded to one decimal. Self-reported confidence is a starting point for learning; this weighting is a transparent heuristic, not a verified measure of ability or a hiring probability. A vacancy with no recognized skills stays unscored.",
        )}{" "}
      </p>
      <h3>{t("How priorities are ordered")}</h3>
      <p>
        {t(
          "Skills to learn are ordered by their frequency in this sample. Each skill counts once per vacancy. All {total} records, including {unscored} unscored records, are included in the denominator.",
          {
            total: result.sample_size,
            unscored: result.sample_size - result.scorable_count,
          },
        )}
      </p>
      <h3>{t("Where the skills come from")}</h3>
      <p>
        {" "}
        {t(
          "Structured tags take precedence. Conservative whole-word aliases supplement vacancy descriptions. Obvious negative clauses are skipped, and related skills are not added automatically. A mention does not prove a skill is mandatory; this analysis does not weight required and preferred skills differently.",
        )}{" "}
      </p>
      <details className="full-sample">
        <summary>{t("View all skill counts")}</summary>
        <div className="analysis-table-wrap">
          <table className="analysis-table">
            <caption className="sr-only">
              {t(
                "Skill counts across {count} vacancies and your saved confidence",
                { count: result.sample_size },
              )}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("Skill")}</th>
                <th scope="col">{t("In this sample")}</th>
                <th scope="col">{t("Your confidence")}</th>
              </tr>
            </thead>
            <tbody>
              {result.skill_demand.map((skill) => (
                <tr key={skill.skill_id}>
                  <th scope="row">{t(skill.skill_name || "")}</th>
                  <td>
                    {skill.vacancy_count}/{result.sample_size} ·{" "}
                    {new Intl.NumberFormat(locale, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    }).format(skill.percentage)}
                    %
                  </td>
                  <td>
                    {t(
                      levels.find((level) => level.value === skill.user_level)
                        ?.label || "",
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <details className="source-method-details">
        <summary>{t("Data source and calculation details")}</summary>
        <p>
          <strong>
            {result.is_demo ? t("Demo CSV:") : t("HeadHunter API:")}
          </strong>{" "}
          {result.is_demo
            ? t(
                "Fictional vacancy examples. Counts describe only this sample and do not represent real labor-market demand.",
              )
            : t(
                "A saved snapshot of the fetched sample, not the entire job market. Original vacancy availability may have changed.",
              )}
        </p>
        <p>
          {" "}
          {t("Scoring:")} {result.algorithm_version}
          <br /> {t("Extraction:")} {result.extraction_version}
          <br /> {t("Dataset:")} {result.dataset_version}
        </p>
        <p className="dataset-hash">
          {" "}
          {t("Source fingerprint:")} {result.dataset_sha256}
        </p>
        <ul>
          {result.warnings.map((warning) => (
            <li key={warning}>{t(warning)}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
