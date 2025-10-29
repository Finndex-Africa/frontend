import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import { Providers } from "../providers";
import SentryInit from "./sentry-client-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <SentryInit>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </SentryInit>
        </Providers>
      </body>
    </html>
  );
}
