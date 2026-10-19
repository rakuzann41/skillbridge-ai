import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { PreferencesProvider, Text } from "@/components/preferences-provider";
import { getPreferences } from "@/lib/preferences-server";
import { translate } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getPreferences();
  return {
    title: {
      default: `SkillBridge AI — ${translate(locale, "A clearer path into data")}`,
      template: "%s | SkillBridge AI",
    },
    description: translate(
      locale,
      "A focused path toward Junior Data Analyst: understand job requirements, identify your skill gaps, and know what to learn next.",
    ),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, theme } = await getPreferences();
  return (
    <html lang={locale} data-theme={theme === "system" ? undefined : theme}>
      <body>
        <PreferencesProvider initialLocale={locale} initialTheme={theme}>
          <a className="skip-link" href="#main">
            <Text>Skip to content</Text>
          </a>
          <AuthProvider>{children}</AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
