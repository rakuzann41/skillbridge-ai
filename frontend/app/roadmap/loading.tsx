"use client";

import { useI18n } from "@/components/preferences-provider";

import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  const { t } = useI18n();
  return (
    <>
      <SiteHeader setup />
      <main id="main" className="page-width roadmap-main">
        <p className="roadmap-loading" role="status">
          {" "}
          {t("Opening your roadmap…")}{" "}
        </p>
      </main>
    </>
  );
}
