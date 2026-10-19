import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width roadmap-main">
        <p className="roadmap-loading" role="status">
          Opening your roadmap…
        </p>
      </main>
    </>
  );
}
