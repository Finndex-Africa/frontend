import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import ConditionalNavbar from "@/components/global/ConditionalNavbar";
import MobileBottomNav from "@/components/global/MobileBottomNav";
import ConditionalFooter from "@/components/global/ConditionalFooter";
import WhatsAppFloat from "@/components/global/WhatsAppFloat";
import TestingDisclaimer from "@/components/global/TestingDisclaimer";
import LaunchCelebrationOverlay from "@/components/global/LaunchCelebrationOverlay";
import CookieConsent from "@/components/global/CookieConsent";
import { Providers } from "@/providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  routing,
  localeHtmlLang,
  localeOgTag,
  type Locale,
} from "@/i18n/routing";

// Primary (Headings): Whitney Bold
const whitneyBold = localFont({
  src: "../../../Whitney-Font/whitney-bold.otf",
  variable: "--font-whitney-bold",
  display: "swap",
});

// Secondary (Body): Whitney Medium
const whitneyMedium = localFont({
  src: "../../../Whitney-Font/whitney-medium.otf",
  variable: "--font-whitney-medium",
  display: "swap",
});

const SITE_URL = "https://findafriq.com";
const SITE_NAME = "FindAfriq";

/** Pre-render both locales at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    keywords: t("keywords")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: {
      canonical: `/${locale}`,
      // hreflang alternates so Google serves the right language per visitor.
      languages: {
        en: "/en",
        fr: "/fr",
        "x-default": `/${routing.defaultLocale}`,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
        { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: SITE_NAME,
      description,
      url: `${SITE_URL}/${locale}`,
      images: [
        {
          url: "/icon-512.png",
          width: 512,
          height: 512,
          type: "image/png",
          alt: `${SITE_NAME} brand icon`,
        },
      ],
      locale: localeOgTag[locale as Locale] ?? localeOgTag.en,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description,
      images: ["/icon-512.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale's pages.
  setRequestLocale(locale);

  return (
    <html lang={localeHtmlLang[locale]} suppressHydrationWarning>
      {/* suppressHydrationWarning: avoids mismatch when browser extensions (e.g. security tools) inject attributes like bis_skin_checked into the DOM */}
      <body
        className={`${whitneyBold.variable} ${whitneyMedium.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          <Providers>
            <ConditionalNavbar />
            <main className="min-h-screen pt-16 md:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
              {children}
            </main>
            <MobileBottomNav />
            <ConditionalFooter />
            <WhatsAppFloat />
            <TestingDisclaimer />
            <LaunchCelebrationOverlay />
            <CookieConsent />
          </Providers>
        </NextIntlClientProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
