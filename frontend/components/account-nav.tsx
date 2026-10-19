"use client";

import { useI18n } from "@/components/preferences-provider";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function AccountNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { client, session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function signOut() {
    if (!client) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setError("Could not sign out. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <span className="account-loading" role="status">
        {" "}
        {t("Loading account…")}{" "}
      </span>
    );
  if (!session)
    return (
      <Link href="/sign-in" className="header-link">
        {" "}
        {t("Sign in")}{" "}
      </Link>
    );
  return (
    <nav className="account-nav" aria-label={t("Your account")}>
      <Link
        href="/setup"
        className="header-link"
        aria-current={pathname === "/setup" ? "page" : undefined}
      >
        {" "}
        {t("My profile")}{" "}
      </Link>
      <Link
        href="/roadmap"
        className="header-link"
        aria-current={pathname === "/roadmap" ? "page" : undefined}
      >
        {" "}
        {t("My roadmap")}{" "}
      </Link>
      <button className="sign-out-button" disabled={busy} onClick={signOut}>
        {busy ? t("Signing out…") : t("Sign out")}
      </button>
      {error && (
        <p className="account-error" role="alert">
          {t(error || "")}
        </p>
      )}
    </nav>
  );
}
