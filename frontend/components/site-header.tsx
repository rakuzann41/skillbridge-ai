"use client";

import { useI18n } from "@/components/preferences-provider";

import Link from "next/link";
import { ArrowUpRight, Layers2 } from "lucide-react";
import { AccountNav } from "@/components/account-nav";
import { DisplayPreferences } from "@/components/display-preferences";

export function SiteHeader({ setup = false }: { setup?: boolean }) {
  const { t } = useI18n();
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label={t("SkillBridge AI home")}>
        <span className="brand-symbol">
          <Layers2 size={22} strokeWidth={1.7} />
        </span>
        SkillBridge<span className="brand-ai">AI</span>
      </Link>
      <nav aria-label={t("Main navigation")} className="main-nav">
        <Link href="/#how-it-works">{t("How it works")}</Link>
        <Link href="/#learning-path">{t("The learning path")}</Link>
      </nav>
      <div className="header-actions">
        {setup && (
          <Link className="header-link overview-link" href="/">
            {" "}
            {t("Overview")} <ArrowUpRight size={16} />
          </Link>
        )}
        <AccountNav />
      </div>
      <DisplayPreferences />
    </header>
  );
}
