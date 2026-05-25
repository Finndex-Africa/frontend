import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConditionalNavbar from "../components/global/ConditionalNavbar";
import MobileBottomNav from "../components/global/MobileBottomNav";
import ConditionalFooter from "../components/global/ConditionalFooter";
import WhatsAppFloat from "../components/global/WhatsAppFloat";
import TestingDisclaimer from "../components/global/TestingDisclaimer";
import LaunchCelebrationOverlay from "../components/global/LaunchCelebrationOverlay";
import { Providers } from "../providers";

// Primary (Headings): Whitney Bold
const whitneyBold = localFont({
  src: "../../Whitney-Font/whitney-bold.otf",
  variable: "--font-whitney-bold",
  display: "swap",
});

// Secondary (Body): Whitney Medium
const whitneyMedium = localFont({
  src: "../../Whitney-Font/whitney-medium.otf",
  variable: "--font-whitney-medium",
  display: "swap",
});

const SITE_URL = "https://findafriq.com";
const SITE_NAME = "FindAfriq";
const SITE_DESCRIPTION =
  "FindAfriq is a digital real estate and services platform that connects home seekers with landlords, agents, and trusted service providers across Africa.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "FindAfriq",
    "real estate Africa",
    "rentals Africa",
    "landlords",
    "agents",
    "service providers",
    "Liberia rentals",
    "find a home Africa",
  ],
  alternates: {
    canonical: "/",
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
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        type: "image/png",
        alt: `${SITE_NAME} brand icon`,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning: avoids mismatch when browser extensions (e.g. security tools) inject attributes like bis_skin_checked into the DOM */}
      <body
        className={`${whitneyBold.variable} ${whitneyMedium.variable} font-body antialiased`}
        suppressHydrationWarning
      >
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
        </Providers>
      </body>
    </html>
  );
}
