import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "../components/global/Navbar";
import Footer from "../components/global/Footer";
import { Providers } from "../providers";
import SentryInit from "./sentry-client-init";

// Primary Font: Montserrat ExtraBold
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["800"], // ExtraBold
  display: "swap",
});

// Secondary Font: Poppins (Bold, Medium, Regular)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Regular, Medium, Bold
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finndex Africa",
  description: "Find your perfect home in Africa",
  icons: {
    icon: [
      { url: '/images/logos/logo1.png' },
      { url: '/favicon.ico' },
    ],
    apple: '/images/logos/logo1.png',
    shortcut: '/images/logos/logo1.png',
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
        className={`${montserrat.variable} ${poppins.variable} antialiased`}
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
