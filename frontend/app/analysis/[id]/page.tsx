import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { DemoAnalysis } from "@/components/demo-analysis";

export const metadata: Metadata = {
  title: "Your results",
  robots: { index: false, follow: false },
};
export default async function SavedAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width analysis-main">
        <DemoAnalysis analysisId={id} />
      </main>
    </>
  );
}
