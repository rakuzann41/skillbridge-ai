import { SiteHeader } from "@/components/site-header";
import { ResultsLoading } from "@/components/results/results-state";

export default function Loading() {
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width analysis-main">
        <ResultsLoading />
      </main>
    </>
  );
}
