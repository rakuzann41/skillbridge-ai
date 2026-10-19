import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };
export default function SignInPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="auth-main page-width">
        <section className="auth-panel">
          <AuthForm mode="sign-in" />
        </section>
      </main>
    </>
  );
}
