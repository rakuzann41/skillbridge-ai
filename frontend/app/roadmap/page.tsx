import { pageMetadata } from "@/lib/preferences-server";
import { SiteHeader } from "@/components/site-header";
import { RoadmapClient } from "@/components/roadmap-client";

export function generateMetadata() {
  return pageMetadata("Your learning roadmap", true);
}

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ analysis?: string | string[] }>;
}) {
  const { analysis } = await searchParams;
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width roadmap-main">
        <RoadmapClient
          analysisId={typeof analysis === "string" ? analysis : undefined}
        />
      </main>
    </>
  );
}
