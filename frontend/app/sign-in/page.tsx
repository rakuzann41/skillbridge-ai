import { pageMetadata } from "@/lib/preferences-server";
import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";

export function generateMetadata() {
  return pageMetadata("Sign in");
}
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
