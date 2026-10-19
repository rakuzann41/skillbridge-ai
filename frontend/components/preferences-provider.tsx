"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import {
  translate,
  type Locale,
  type MessageValues,
  type Theme,
} from "@/lib/i18n";
import { useRouter } from "next/navigation";

type Preferences = {
  locale: Locale;
  theme: Theme;
  dark: boolean;
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
  t: (key: string, values?: MessageValues) => string;
};
const Context = createContext<Preferences | null>(null);
const subscribe = (notify: () => void) => {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const systemDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;
const serverDark = () => false;

function remember(name: string, value: string) {
  try {
    document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    return document.cookie.split("; ").includes(`${name}=${value}`);
  } catch {
    return false;
  }
}

export function PreferencesProvider({
  children,
  initialLocale,
  initialTheme,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
}) {
  const [locale, updateLocale] = useState(initialLocale);
  const router = useRouter();
  const [theme, updateTheme] = useState(initialTheme);
  const prefersDark = useSyncExternalStore(subscribe, systemDark, serverDark);
  const dark = theme === "system" ? prefersDark : theme === "dark";
  const t = useCallback(
    (key: string, values?: MessageValues) => translate(locale, key, values),
    [locale],
  );
  function setLocale(value: Locale) {
    updateLocale(value);
    document.documentElement.lang = value;
    if (remember("sb-language", value)) router.refresh();
  }
  function toggleTheme() {
    const value = dark ? "light" : "dark";
    updateTheme(value);
    document.documentElement.dataset.theme = value;
    remember("sb-theme", value);
  }
  return (
    <Context.Provider
      value={{ locale, theme, dark, setLocale, toggleTheme, t }}
    >
      {children}
    </Context.Provider>
  );
}

export function useI18n() {
  const value = useContext(Context);
  if (!value) throw new Error("PreferencesProvider is required.");
  return value;
}

export function Text({ children }: { children: string }) {
  const { t } = useI18n();
  return <>{t(children)}</>;
}
