import type { MetadataRoute } from "next";

const SITE_URL = "https://findafriq.com";

/**
 * Static sitemap of public-facing routes.
 *
 * Submitting (or simply having) a sitemap nudges Google to re-crawl the
 * homepage, which is what triggers a favicon re-fetch in search results.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
        { path: "/", changeFrequency: "weekly", priority: 1.0 },
        { path: "/routes/properties", changeFrequency: "daily", priority: 0.9 },
        { path: "/routes/services", changeFrequency: "daily", priority: 0.9 },
        { path: "/routes/about", changeFrequency: "monthly", priority: 0.6 },
        { path: "/routes/pricing", changeFrequency: "monthly", priority: 0.6 },
        { path: "/routes/help", changeFrequency: "monthly", priority: 0.5 },
        { path: "/routes/terms", changeFrequency: "yearly", priority: 0.3 },
        { path: "/routes/privacy", changeFrequency: "yearly", priority: 0.3 },
        { path: "/routes/platform-policy", changeFrequency: "yearly", priority: 0.3 },
    ];

    return routes.map((route) => ({
        url: `${SITE_URL}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
}
