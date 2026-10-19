"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ConfigurationNotice } from "@/components/configuration-notice";

export function EmailConfirmation() {
  const { session, loading, configured } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (session) router.replace("/setup");
  }, [session, router]);
  if (!configured) return <ConfigurationNotice />;
  if (loading || session)
    return (
      <p role="status" className="panel-status">
        Confirming your session…
      </p>
    );
  return (
    <div className="auth-confirmation">
      <h1>Continue to your account.</h1>
      <p>
        If your email was confirmed, sign in to continue. If the link expired,
        return to account creation to request another confirmation.
      </p>
      <Link className="button button-primary" href="/sign-in">
        Sign in
      </Link>
      <Link className="text-link" href="/sign-up">
        Create an account
      </Link>
    </div>
  );
}
