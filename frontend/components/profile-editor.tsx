"use client";

import { useI18n } from "@/components/preferences-provider";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth-provider";
import { ConfigurationNotice } from "@/components/configuration-notice";
import { ProfileForm } from "@/components/profile-form";
import { getProfile } from "@/lib/api";
import type { Profile } from "@/types/profile";

function LoadedProfile({ client }: { client: SupabaseClient }) {
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    getProfile(client, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setProfile(value);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "Could not load your profile.",
          );
      });
    return () => controller.abort();
  }, [client, attempt]);
  if (error)
    return (
      <div className="profile-state">
        <h1>{t("Your profile couldn’t be loaded.")}</h1>
        <p className="form-error" role="alert">
          {t(error || "")}
        </p>
        <button
          className="button button-outline"
          onClick={() => setAttempt(attempt + 1)}
        >
          {" "}
          {t("Try again")}{" "}
        </button>
      </div>
    );
  if (!profile)
    return (
      <p className="panel-status" role="status">
        {" "}
        {t("Loading your saved profile…")}{" "}
      </p>
    );
  return <ProfileForm initialProfile={profile} client={client} />;
}

export function ProfileEditor() {
  const { t } = useI18n();
  const { client, session, loading, configured } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (configured && !loading && !session) router.replace("/sign-in");
  }, [configured, loading, session, router]);
  if (!configured) return <ConfigurationNotice />;
  if (loading || !session || !client)
    return (
      <p className="panel-status" role="status">
        {loading ? t("Checking your session…") : t("Opening sign in…")}
      </p>
    );
  // A new account remounts the editor: the previous account's draft is discarded.
  return <LoadedProfile key={session.user.id} client={client} />;
}
