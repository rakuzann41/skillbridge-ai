import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { RoadmapClient } from "@/components/roadmap-client";

export const metadata: Metadata = {
  title: "Your learning roadmap",
  robots: { index: false, follow: false },
};

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
