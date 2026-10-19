import { pageMetadata } from "@/lib/preferences-server";
import { SiteHeader } from "@/components/site-header";
import { DemoAnalysis } from "@/components/demo-analysis";

export function generateMetadata() {
  return pageMetadata("Your results", true);
}
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
