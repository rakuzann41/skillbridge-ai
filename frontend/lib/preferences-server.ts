import { cookies } from "next/headers";
import { translate, validLocale, validTheme } from "@/lib/i18n";

export async function getPreferences() {
  const store = await cookies();
  return {
    locale: validLocale(store.get("sb-language")?.value),
    theme: validTheme(store.get("sb-theme")?.value),
  };
}

export async function pageMetadata(title: string, privatePage = false) {
  const { locale } = await getPreferences();
  return {
    title: translate(locale, title),
    ...(privatePage ? { robots: { index: false, follow: false } } : {}),
  };
}
