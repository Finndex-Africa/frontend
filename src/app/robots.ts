import type { MetadataRoute } from "next";

const SITE_URL = "https://findafriq.com";

/**
 * Explicit robots policy.
 *
 * Important: do NOT disallow `/favicon.ico` — Google's favicon fetcher needs
 * to read it before it will refresh the icon shown in search results.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/chat/",
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
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
