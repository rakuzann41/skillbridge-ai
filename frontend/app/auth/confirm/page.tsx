import { pageMetadata } from "@/lib/preferences-server";
import { SiteHeader } from "@/components/site-header";
import { EmailConfirmation } from "@/components/email-confirmation";

export function generateMetadata() {
  return pageMetadata("Confirm your email", true);
}
export default function ConfirmPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="auth-main page-width">
        <section className="auth-panel">
          <EmailConfirmation />
        </section>
      </main>
    </>
  );
}
