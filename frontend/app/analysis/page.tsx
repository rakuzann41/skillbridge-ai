import { pageMetadata } from "@/lib/preferences-server";
import { SiteHeader } from "@/components/site-header";
import { DemoAnalysis } from "@/components/demo-analysis";

export function generateMetadata() {
  return pageMetadata("Skill analysis", true);
}
export default function AnalysisPage() {
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width analysis-main">
        <DemoAnalysis />
      </main>
    </>
  );
}
