import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ProfileEditor } from "@/components/profile-editor";

export const metadata: Metadata = { title: "Your starting point" };

export default function SetupPage() {
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width setup-main">
        <ProfileEditor />
      </main>
      <footer className="site-footer page-width">
        <span>SkillBridge AI</span>
        <p>Self-reported confidence, a starting point for learning.</p>
      </footer>
    </>
  );
}
