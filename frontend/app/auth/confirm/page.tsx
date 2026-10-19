import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { EmailConfirmation } from "@/components/email-confirmation";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};
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
