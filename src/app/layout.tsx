import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "../components/global/Navbar";
import ConditionalFooter from "../components/global/ConditionalFooter";
import WhatsAppFloat from "../components/global/WhatsAppFloat";
import TestingDisclaimer from "../components/global/TestingDisclaimer";
import { Providers } from "../providers";
import SentryInit from "./sentry-client-init";

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

export const metadata: Metadata = {
  title: "Finndex Africa",
  description: "Find your perfect home in Africa",
  icons: {
    icon: [
      { url: '/images/logos/Finndex Africa Updated Logo.png' },
      { url: '/favicon.ico' },
    ],
    apple: '/images/logos/Finndex Africa Updated Logo.png',
    shortcut: '/images/logos/Finndex Africa Updated Logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${whitneyBold.variable} ${whitneyMedium.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <SentryInit>
            <Navbar />
            <main className="min-h-screen pt-16 md:pt-0">{children}</main>
            <ConditionalFooter />
            <WhatsAppFloat />
            <TestingDisclaimer />
          </SentryInit>
        </Providers>
      </body>
    </html>
  );
}
