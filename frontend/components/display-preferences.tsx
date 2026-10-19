"use client";

import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/components/preferences-provider";
import { validLocale } from "@/lib/i18n";

export function DisplayPreferences() {
  const { locale, setLocale, dark, toggleTheme, t } = useI18n();
  return (
    <div className="display-preferences">
      <label className="sr-only" htmlFor="site-language">
        {t("Language")}
      </label>
      <select
        id="site-language"
        value={locale}
        onChange={(event) => setLocale(validLocale(event.target.value))}
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="kk" lang="kk">
          Қазақша
        </option>
        <option value="ru" lang="ru">
          Русский
        </option>
      </select>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={t(dark ? "Switch to light theme" : "Switch to dark theme")}
        title={t(dark ? "Switch to light theme" : "Switch to dark theme")}
      >
        {dark ? (
          <Sun size={19} aria-hidden="true" />
        ) : (
          <Moon size={19} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
