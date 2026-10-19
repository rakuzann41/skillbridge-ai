import { pageMetadata } from "@/lib/preferences-server";
import { SiteHeader } from "@/components/site-header";
import { AuthForm } from "@/components/auth-form";

export function generateMetadata() {
  return pageMetadata("Create an account");
}
export default function SignUpPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="auth-main page-width">
        <section className="auth-panel">
          <AuthForm mode="sign-up" />
        </section>
      </main>
    </>
  );
}
