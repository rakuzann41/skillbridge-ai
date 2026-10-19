import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { DemoAnalysis } from "@/components/demo-analysis";

export const metadata: Metadata = {
  title: "Skill analysis",
  robots: { index: false, follow: false },
};
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
