"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConfigurationNotice } from "@/components/configuration-notice";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const {
    client,
    session,
    loading,
    configured,
    error: sessionError,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const router = useRouter();
  const signup = mode === "sign-up";

  useEffect(() => {
    if (!loading && session) router.replace("/setup");
  }, [session, loading, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || busy) return;
    setBusy(true);
    setError("");
    try {
      const { data, error } = signup
        ? await client.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/confirm`,
            },
          })
        : await client.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
      if (error) {
        if (error.status === 429)
          setError("Too many attempts. Wait a little and try again.");
        else if (error.code === "email_not_confirmed")
          setError(
            "Confirm your email using the link in your inbox, then sign in.",
          );
        else if (signup && error.code === "weak_password")
          setError(
            "Choose a stronger password using a mix of letters, numbers, and symbols.",
          );
        else
          setError(
            signup
              ? "Could not create your account. Check your details and try again."
              : "Could not sign in. Check your email and password and try again.",
          );
        return;
      }
      setPassword("");
      if (signup && !data.session) setConfirmation(true);
      else router.replace("/setup");
    } catch {
      setError(
        "Cannot reach the account service. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!configured) return <ConfigurationNotice />;
  if (loading || session)
    return (
      <p className="panel-status" role="status">
        {session ? "Opening your profile…" : "Checking your session…"}
      </p>
    );
  if (confirmation)
    return (
      <div className="auth-confirmation" role="status">
        <Mail size={26} />
        <h2>Check your inbox.</h2>
        <p>
          If this address is eligible for a new account, a confirmation email
          will arrive. Open the link to confirm your email and continue.
        </p>
        <p>Already have an account? Sign in instead.</p>
        <Link className="button button-primary" href="/sign-in">
          Go to sign in <ArrowRight size={17} />
        </Link>
      </div>
    );

  return (
    <form onSubmit={submit} className="auth-form">
      <div className="form-heading">
        <span className="eyebrow">
          {signup ? "YOUR NEXT STEP STARTS HERE" : "WELCOME BACK"}
        </span>
        <h1>{signup ? "Create your account." : "Continue your journey."}</h1>
        <p>
          {signup
            ? "Keep your profile and skills in one place."
            : "Sign in to return to your saved profile."}
        </p>
      </div>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        maxLength={254}
        required
        disabled={busy}
        onChange={(event) => setEmail(event.target.value)}
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete={signup ? "new-password" : "current-password"}
        minLength={signup ? 8 : 1}
        maxLength={128}
        required
        disabled={busy}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-describedby={signup ? "password-help" : undefined}
      />
      {signup && (
        <p className="field-hint" id="password-help">
          Use at least 8 characters. Mix letters, numbers, and symbols for a
          stronger password.
        </p>
      )}
      {signup && <p className="field-hint">By creating an account, you confirm that you have read and accept HeadHunter’s <a href="https://hh.ru/account/agreement" target="_blank" rel="noopener noreferrer" lang="ru" style={{ textDecoration: "underline" }}>Соглашение об оказании услуг по содействию в трудоустройстве (оферта)</a> (employment assistance agreement; opens in a new tab).</p>}
      {(error || sessionError) && (
        <p role="alert" className="form-error">
          {error || sessionError}
        </p>
      )}
      <button type="submit" disabled={busy} className="button button-primary">
        {busy
          ? signup
            ? "Creating account…"
            : "Signing in…"
          : signup
            ? "Create account"
            : "Sign in"}
        <ArrowRight size={17} />
      </button>
      <p className="auth-switch">
        {signup ? "Already have an account?" : "New to SkillBridge?"}{" "}
        <Link href={signup ? "/sign-in" : "/sign-up"}>
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
