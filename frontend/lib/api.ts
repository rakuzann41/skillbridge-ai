import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, ProfileInput } from "@/types/profile";
import type { AnalysisResult } from "@/types/analysis";
import type { Roadmap } from "@/types/roadmap";

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

async function requestApi<T>(
  client: SupabaseClient,
  path: string,
  method: "GET" | "PUT" | "POST",
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const { data, error } = await client.auth.getSession();
  if (error || !data.session)
    throw new ApiError(401, "Please sign in again to access your account.");
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.any([
        AbortSignal.timeout(path === "/analyses" && method === "POST" ? 65000 : 35000),
        ...(signal ? [signal] : []),
      ]),
    });
  } catch {
    if (signal?.aborted)
      throw new DOMException("Request cancelled", "AbortError");
    throw new ApiError(
      0,
      "Cannot reach the service. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    if (response.status === 503 && path === "/analyses" && method === "POST") {
      const detail = await response.json().catch(() => null);
      const code = detail?.detail?.code;
      if (detail?.detail?.fallback_available === true && ["not_configured", "access_unavailable", "rate_limited", "upstream_unavailable", "invalid_response", "timeout", "busy", "no_results"].includes(code)) {
        throw new ApiError(503, "Live vacancies are unavailable. You can use Demo CSV instead.", code);
      }
    }
    let message = "The request could not be completed. Please try again.";
    if (response.status === 401)
      message = "Your session has expired. Sign out, then sign in again.";
    else if (response.status === 422)
      message = "Check your inputs, then try again.";
    else if (response.status === 404)
      message = "This record was not found in your account.";
    else if (response.status === 409)
      message =
        method === "POST"
          ? "Save your profile before starting an analysis. All skills may be marked Not yet."
          : "This analysis uses an older data or scoring version. Start a new analysis to continue.";
    else if (response.status === 503)
      message =
        "The service is temporarily unavailable. Please try again shortly.";
    throw new ApiError(response.status, message);
  }
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      503,
      "The service returned an unreadable response. Please try again.",
    );
  }
}

export function getRoadmap(client: SupabaseClient, signal?: AbortSignal) {
  return requestApi<Roadmap | null>(
    client,
    "/roadmap",
    "GET",
    undefined,
    signal,
  );
}

export function createRoadmap(
  client: SupabaseClient,
  analysisId?: string,
  signal?: AbortSignal,
) {
  return requestApi<Roadmap>(
    client,
    "/roadmap",
    "POST",
    { analysis_id: analysisId || null },
    signal,
  );
}

export function saveRoadmapItem(
  client: SupabaseClient,
  itemId: string,
  completed: boolean,
  signal?: AbortSignal,
) {
  return requestApi<Roadmap>(
    client,
    `/roadmap/items/${encodeURIComponent(itemId)}`,
    "PUT",
    { completed },
    signal,
  );
}

export function getProfile(client: SupabaseClient, signal?: AbortSignal) {
  return requestApi<Profile>(client, "/profile", "GET", undefined, signal);
}
export function saveProfile(client: SupabaseClient, profile: ProfileInput) {
  return requestApi<Profile>(client, "/profile", "PUT", profile);
}

export function createDemoAnalysis(
  client: SupabaseClient,
  signal?: AbortSignal,
) {
  return requestApi<AnalysisResult>(
    client,
    "/analyses",
    "POST",
    {
      source: "csv_demo",
      sample_limit: 8,
    },
    signal,
  );
}

export function createAnalysis(client: SupabaseClient, source: "headhunter" | "csv_demo", acceptHhTerms: boolean, signal?: AbortSignal) {
  return requestApi<AnalysisResult>(client, "/analyses", "POST", {
    source, sample_limit: 8, accept_hh_terms: source === "headhunter" && acceptHhTerms,
  }, signal);
}

export function getAnalysis(
  client: SupabaseClient,
  id: string,
  signal?: AbortSignal,
) {
  return requestApi<AnalysisResult>(
    client,
    `/analyses/${encodeURIComponent(id)}`,
    "GET",
    undefined,
    signal,
  );
}
