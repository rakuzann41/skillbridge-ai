import { messages } from "./messages.ts";

export const locales = ["en", "kk", "ru"] as const;
export type Locale = (typeof locales)[number];
export type Theme = "system" | "light" | "dark";
export type MessageValues = Record<string, string | number>;

// Only documented, deterministic service messages are parsed. Source vacancy text is never translated here.
const serviceMessages = [
  {
    pattern:
      /^(\d+) vacancies have no recognized skills and remain unscored; they still count in the sample denominator\.$/,
    key: "{count} vacancies have no recognized skills and remain unscored; they still count in the sample denominator.",
    names: ["count"],
  },
  {
    pattern: /^Skipped (\d+) malformed or duplicate CSV rows\.$/,
    key: "Skipped {count} malformed or duplicate CSV rows.",
    names: ["count"],
  },
  {
    pattern:
      /^Only (\d+) of up to (\d+) requested vacancies passed validation\. No demo records were mixed in\.$/,
    key: "Only {count} of up to {total} requested vacancies passed validation. No demo records were mixed in.",
    names: ["count", "total"],
  },
] as const;

export function validLocale(value: unknown): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}

export function validTheme(value: unknown): Theme {
  return value === "light" || value === "dark" ? value : "system";
}

export function translate(
  locale: Locale,
  key: string,
  values: MessageValues = {},
): string {
  for (const message of serviceMessages) {
    const match = key.match(message.pattern);
    if (match)
      return translate(
        locale,
        message.key,
        Object.fromEntries(
          message.names.map((name, index) => [name, match[index + 1]]),
        ),
      );
  }
  const entry = Object.prototype.hasOwnProperty.call(messages, key)
    ? messages[key]
    : undefined;
  const text = locale === "en" || !entry ? key : entry[locale === "kk" ? 0 : 1];
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(values, name)) return placeholder;
    return typeof values[name] === "number"
      ? new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
          values[name],
        )
      : String(values[name]);
  });
}

export const formatLocale: Record<Locale, string> = {
  en: "en-GB",
  kk: "kk-KZ",
  ru: "ru-RU",
};

// Numeric months also work in browsers with limited Kazakh month-name data.
export function formatDate(value: string, locale: Locale, includeTime = false) {
  return new Intl.DateTimeFormat(formatLocale[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime ? ({ hour: "2-digit", minute: "2-digit" } as const) : {}),
  }).format(new Date(value));
}
