import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "../components/global/Navbar";
import ConditionalFooter from "../components/global/ConditionalFooter";
import WhatsAppFloat from "../components/global/WhatsAppFloat";
import TestingDisclaimer from "../components/global/TestingDisclaimer";
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

export const metadata: Metadata = {
  title: "FindAfriq",
  description: "Find your perfect home in Africa",
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon-32.png',
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
            <Navbar />
            <main className="min-h-screen pt-16 md:pt-0">{children}</main>
            <ConditionalFooter />
            <WhatsAppFloat />
            <TestingDisclaimer />
        </Providers>
      </body>
    </html>
  );
}
