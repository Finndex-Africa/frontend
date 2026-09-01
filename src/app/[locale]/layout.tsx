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
import AssistantWidget from "@/components/global/AssistantWidget";
import TestingDisclaimer from "@/components/global/TestingDisclaimer";
import LaunchCelebrationOverlay from "@/components/global/LaunchCelebrationOverlay";
import CookieConsent from "@/components/global/CookieConsent";
import { Providers } from "@/providers";
import JsonLd, { siteJsonLd } from "@/components/global/JsonLd";
import ConsentedAnalytics from "@/components/global/ConsentedAnalytics";
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

/*
  The home page fetches properties, services and buy&sell from the API before it
  can render a single card, so the API origin sits on the critical path to LCP:
  HTML -> JS -> API -> images. Preconnecting gets DNS + TLS out of the way while
  the JS is still downloading. Lighthouse estimated ~320 ms.
*/
const API_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "").origin;
  } catch {
    return null;
  }
})();
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

  // Sitewide Organization + WebSite graph. Server-rendered so crawlers that
  // don't run JavaScript still see it.
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const siteSchema = siteJsonLd(locale as Locale, tMeta("description"));

  return (
    <html lang={localeHtmlLang[locale]} suppressHydrationWarning>
      <head>
        {/* Same-origin as the page? Then it's already connected and this is a no-op. */}
        {API_ORIGIN && API_ORIGIN !== SITE_URL && (
          <>
            {/*
              Both variants on purpose. A preconnect opens a socket in one of
              two pools and only a matching request reuses it: `crossorigin`
              gives the anonymous-CORS pool (what fetch/XHR to another origin
              uses), the bare one gives the non-CORS pool. Production Lighthouse
              reported "Unused preconnect. Check that the crossorigin attribute
              is used properly" with only the CORS variant present, while still
              listing this origin as worth ~300 ms — so cover both rather than
              guess. Cost is one extra idle socket.
            */}
            <link rel="preconnect" href={API_ORIGIN} crossOrigin="" />
            <link rel="preconnect" href={API_ORIGIN} />
            {/* Fallback for browsers that ignore preconnect. */}
            <link rel="dns-prefetch" href={API_ORIGIN} />
          </>
        )}
      </head>
      {/* suppressHydrationWarning: avoids mismatch when browser extensions (e.g. security tools) inject attributes like bis_skin_checked into the DOM */}
      <body
        className={`${whitneyBold.variable} ${whitneyMedium.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <JsonLd data={siteSchema} />
        <NextIntlClientProvider>
          <Providers>
            <ConditionalNavbar />
            <main className="min-h-screen pt-16 md:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
              {children}
            </main>
            <MobileBottomNav />
            <ConditionalFooter />
            <WhatsAppFloat />
            <AssistantWidget />
            <TestingDisclaimer />
            <LaunchCelebrationOverlay />
            <CookieConsent />
          </Providers>
        </NextIntlClientProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <ConsentedAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
