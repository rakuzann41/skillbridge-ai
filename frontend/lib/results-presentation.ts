import type { AnalysisResult } from "@/types/analysis";

export type GapFilter = "all" | "not-yet" | "learning";
export type MatchFilter = "all" | "scored" | "unscored";
export type ResultView = "gaps" | "matches" | "method";
export type AnalysisOperation = "create" | "load";
export type ResultsFailure = {
  title: string;
  description: string;
  action: "retry" | "profile" | "new-analysis" | "sign-in";
  actionLabel: string;
};

export function prioritySkills(
  result: AnalysisResult,
  filter: GapFilter = "all",
) {
  return result.skill_demand
    .filter(
      (skill) =>
        skill.user_level !== "comfortable" &&
        (filter === "all" || skill.user_level === filter),
    )
    .sort(
      (a, b) =>
        b.vacancy_count - a.vacancy_count ||
        (a.skill_id < b.skill_id ? -1 : a.skill_id > b.skill_id ? 1 : 0),
    );
}

export function filteredMatches(
  matches: AnalysisResult["matches"],
  filter: MatchFilter,
) {
  return matches.filter(
    (match) =>
      filter === "all" ||
      (filter === "scored" ? match.score !== null : match.score === null),
  );
}

export function skillNames(
  ids: string[],
  demand: AnalysisResult["skill_demand"],
) {
  return (
    ids
      .map(
        (id) => demand.find((skill) => skill.skill_id === id)?.skill_name || id,
      )
      .join(", ") || "None"
  );
}

export function resultsFailure(
  error: unknown,
  operation: AnalysisOperation,
): ResultsFailure {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  const sourceMessages: Record<string, string> = {
    not_configured: "HeadHunter access is awaiting application setup. You can compare your skills using the clearly labeled Demo CSV sample.",
    access_unavailable: "HeadHunter did not allow this request. Try later or use Demo CSV. We won’t bypass its access checks.",
    rate_limited: "HeadHunter has limited requests. Wait before retrying, or use Demo CSV.",
    no_results: "No usable junior Data Analyst vacancies were found in this bounded search. Try later or use Demo CSV.",
    busy: "Another vacancy collection is running. Try again shortly or use Demo CSV.",
    timeout: "HeadHunter did not respond in time. Try later or use Demo CSV.",
    invalid_response: "The vacancy source returned data we couldn’t safely analyze. Try later or use Demo CSV.",
    upstream_unavailable: "HeadHunter is temporarily unavailable. Try later or use Demo CSV.",
  };
  if (operation === "create" && typeof code === "string" && sourceMessages[code])
    return { title: "Live vacancies aren’t available right now.", description: sourceMessages[code], action: "retry", actionLabel: "Try live jobs again" };
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? error.status
      : undefined;
  if (status === 401)
    return {
      title: "Let’s reconnect your account.",
      description:
        "Your session needs to be renewed before you can open private results.",
      action: "sign-in",
      actionLabel: "Sign in again",
    };
  if (status === 404 || (status === 422 && operation === "load"))
    return {
      title: "We couldn’t find this analysis.",
      description:
        "This link isn’t available in your account. You can start a new comparison with your saved skills.",
      action: "new-analysis",
      actionLabel: "Start a new analysis",
    };
  if (status === 409 && operation === "create")
    return {
      title: "Save your starting point first.",
      description:
        "Review and save your profile before comparing it with vacancies. It’s fine to mark every skill Not yet.",
      action: "profile",
      actionLabel: "Review my profile",
    };
  if (status === 409)
    return {
      title: "It’s time for a fresh comparison.",
      description:
        "The source data or scoring method has changed. Your saved inputs are intact; a new analysis will use the current version.",
      action: "new-analysis",
      actionLabel: "Start a new analysis",
    };
  return {
    title:
      operation === "create"
        ? "The comparison couldn’t be completed."
        : "Your results couldn’t be loaded.",
    description:
      "The connection or service may be temporarily unavailable. Your saved profile is unchanged. Please try again.",
    action: "retry",
    actionLabel: "Try again",
  };
}
