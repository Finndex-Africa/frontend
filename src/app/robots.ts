import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = "https://findafriq.com";

/** Private routes, expressed without a locale prefix. */
const PRIVATE_PATHS = [
    "/routes/messages",
    "/routes/notifications",
    "/routes/profile",
    "/routes/my-listings",
    "/routes/my-services",
    "/routes/bookings",
    "/routes/favorites",
    "/routes/login",
    "/routes/verify-email",
    "/routes/verify-identity",
    "/forgot-password",
    "/reset-password",
];

/**
 * Explicit robots policy.
 *
 * Important: do NOT disallow `/favicon.ico` — Google's favicon fetcher needs
 * to read it before it will refresh the icon shown in search results.
 */
export default function robots(): MetadataRoute.Robots {
    // Every private path is disallowed under each locale prefix (/en/…, /fr/…).
    const localizedDisallow = routing.locales.flatMap((locale) =>
        PRIVATE_PATHS.map((path) => `/${locale}${path}`),
    );

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/chat/", ...localizedDisallow],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
