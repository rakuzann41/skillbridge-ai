"use client";

import { useI18n } from "@/components/preferences-provider";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ConfigurationNotice } from "@/components/configuration-notice";

export function EmailConfirmation() {
  const { t } = useI18n();
  const { session, loading, configured } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (session) router.replace("/setup");
  }, [session, router]);
  if (!configured) return <ConfigurationNotice />;
  if (loading || session)
    return (
      <p role="status" className="panel-status">
        {" "}
        {t("Confirming your session…")}{" "}
      </p>
    );
  return (
    <div className="auth-confirmation">
      <h1>{t("Continue to your account.")}</h1>
      <p>
        {" "}
        {t(
          "If your email was confirmed, sign in to continue. If the link expired, return to account creation to request another confirmation.",
        )}{" "}
      </p>
      <Link className="button button-primary" href="/sign-in">
        {" "}
        {t("Sign in")}{" "}
      </Link>
      <Link className="text-link" href="/sign-up">
        {" "}
        {t("Create an account")}{" "}
      </Link>
    </div>
  );
}
