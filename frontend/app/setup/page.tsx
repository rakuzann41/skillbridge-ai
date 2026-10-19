import { pageMetadata } from "@/lib/preferences-server";
import { SiteHeader } from "@/components/site-header";
import { ProfileEditor } from "@/components/profile-editor";
import { Text } from "@/components/preferences-provider";

export function generateMetadata() {
  return pageMetadata("Your starting point", true);
}

export default function SetupPage() {
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width setup-main">
        <ProfileEditor />
      </main>
      <footer className="site-footer page-width">
        <span>SkillBridge AI</span>
        <p>
          <Text>Self-reported confidence, a starting point for learning.</Text>
        </p>
      </footer>
    </>
  );
}
