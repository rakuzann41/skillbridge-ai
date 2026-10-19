import type { AnalysisResult } from "@/types/analysis";
import { levels } from "@/lib/skills";

export function ResultsMethod({ result }: { result: AnalysisResult }) {
  return (
    <section className="results-method" aria-labelledby="method-heading">
      <p className="eyebrow">TRANSPARENT BY DESIGN</p>
      <h2 id="method-heading">A score you can trace.</h2>
      <p>
        Each comparison uses the confidence levels you saved and the distinct
        skills recognized in a vacancy. Every recognized skill has the same
        weight.
      </p>
      <div className="confidence-key">
        <div>
          <strong>1</strong>
          <span>Comfortable</span>
        </div>
        <div>
          <strong>0.5</strong>
          <span>Learning</span>
        </div>
        <div>
          <strong>0</strong>
          <span>Not yet or unlisted</span>
        </div>
      </div>
      <div className="method-formula">
        <span className="meta-label">SKILL OVERLAP</span>
        <p>Earned credits ÷ recognized vacancy skills × 100</p>
      </div>
      <p>
        The result is rounded to one decimal. Self-reported confidence is a
        starting point for learning; this weighting is a transparent heuristic,
        not a verified measure of ability or a hiring probability. A vacancy
        with no recognized skills stays unscored.
      </p>
      <h3>How priorities are ordered</h3>
      <p>
        Your learning and missing skills are ordered by how many vacancies in
        this sample mention them. A skill counts once per vacancy. All{" "}
        {result.sample_size} analyzed records are included in the denominator,
        including {result.sample_size - result.scorable_count} unscored{" "}
        {result.sample_size - result.scorable_count === 1
          ? "record"
          : "records"}
        .
      </p>
      <h3>Where the skills come from</h3>
      <p>
        Structured tags take precedence. Conservative whole-word aliases
        supplement vacancy descriptions. Obvious negative clauses are skipped,
        and related skills are not added automatically. A mention does not prove
        a skill is mandatory; this analysis does not weight required and
        preferred skills differently.
      </p>
      <details className="full-sample">
        <summary>View all skill counts</summary>
        <div className="analysis-table-wrap">
          <table className="analysis-table">
            <caption className="sr-only">
              Skill mentions across {result.sample_size} {result.is_demo ? "demo" : "HeadHunter"} vacancies and your
              saved confidence
            </caption>
            <thead>
              <tr>
                <th scope="col">Skill</th>
                <th scope="col">In this sample</th>
                <th scope="col">Your confidence</th>
              </tr>
            </thead>
            <tbody>
              {result.skill_demand.map((skill) => (
                <tr key={skill.skill_id}>
                  <th scope="row">{skill.skill_name}</th>
                  <td>
                    {skill.vacancy_count}/{result.sample_size} ·{" "}
                    {skill.percentage.toFixed(1)}%
                  </td>
                  <td>
                    {
                      levels.find((level) => level.value === skill.user_level)
                        ?.label
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <details className="source-method-details">
        <summary>Data source and calculation details</summary>
        <p>
          <strong>{result.is_demo ? "Demo CSV:" : "HeadHunter API:"}</strong>{" "}
          {result.is_demo ? "Fictional vacancy examples. Counts describe only this sample and do not represent real labor-market demand." : "A saved snapshot of the fetched sample, not the entire job market. Original vacancy availability may have changed."}
        </p>
        <p>
          Scoring: {result.algorithm_version}
          <br />
          Extraction: {result.extraction_version}
          <br />
          Dataset: {result.dataset_version}
        </p>
        <p className="dataset-hash">
          Source fingerprint: {result.dataset_sha256}
        </p>
        <ul>
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
