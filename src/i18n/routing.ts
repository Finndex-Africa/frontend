import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Human-readable names for the language switcher, in their own language. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/** BCP-47 tags used for <html lang>, hreflang and Intl formatting. */
export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  fr: "fr",
};

/** OpenGraph locale tags. */
export const localeOgTag: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every URL carries its locale (/en/..., /fr/...) so both languages are
  // independently indexable and shareable.
  localePrefix: "always",
  // Remember the visitor's choice across navigations.
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});
