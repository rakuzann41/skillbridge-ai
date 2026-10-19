"use client";

import { useI18n } from "@/components/preferences-provider";

import Link from "next/link";
import { Info } from "lucide-react";

export function ConfigurationNotice() {
  const { t } = useI18n();
  return (
    <div className="configuration-notice" role="status">
      <Info size={22} />
      <h2>{t("Accounts are ready to connect.")}</h2>
      <p>
        {" "}
        {t(
          "The owner needs to connect the Supabase project before you can create an account or save your profile.",
        )}{" "}
      </p>
      <Link className="text-link" href="/">
        {" "}
        {t("Back to overview")}{" "}
      </Link>
    </div>
  );
}
