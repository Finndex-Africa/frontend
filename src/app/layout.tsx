'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import { Providers } from "../providers";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  // Hide navbar and footer for dashboard routes
  const isDashboardRoute = pathname?.startsWith('/routes/management-dashboard') ||
                           pathname?.startsWith('/routes/properties') ||
                           pathname?.startsWith('/routes/services');

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {!isDashboardRoute && <Navbar />}
          <main className="min-h-screen">
            {children}
          </main>
          {!isDashboardRoute && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
