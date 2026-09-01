import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = "https://findafriq.com";

function getApiBase(): string {
    return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(/\/$/, "");
}

/**
 * How many listings to submit, at most.
 *
 * Google's limit is 50,000 URLs per sitemap file, and each listing is emitted
 * once per locale — so the ceiling here is half that, minus the static routes.
 * If the catalogue ever approaches this, split into a sitemap index rather than
 * quietly truncating.
 */
const MAX_LISTINGS_PER_TYPE = 5_000;
const PAGE_SIZE = 100;

type ListingRow = { _id?: string; updatedAt?: string; createdAt?: string };

/**
 * Pages through a listing endpoint and returns id + last-modified only.
 *
 * Never throws: a sitemap that 500s because the API blipped is worse than one
 * carrying only the static routes, since search engines will happily re-crawl
 * a thin sitemap but treat repeated errors as a reason to back off.
 */
async function fetchListings(path: string): Promise<ListingRow[]> {
    const rows: ListingRow[] = [];
    try {
        for (let page = 1; rows.length < MAX_LISTINGS_PER_TYPE; page += 1) {
            const sep = path.includes("?") ? "&" : "?";
            const res = await fetch(
                `${getApiBase()}${path}${sep}page=${page}&limit=${PAGE_SIZE}`,
                {
                    headers: { Accept: "application/json" },
                    // Listings change through the day; an hour keeps the sitemap
                    // fresh without re-paging the catalogue on every crawl.
                    next: { revalidate: 3600 },
                },
            );
            if (!res.ok) break;

            const body = await res.json();
            // The API returns { success, data, pagination } on some routes and a
            // bare array on others — accept both.
            const batch: ListingRow[] = Array.isArray(body)
                ? body
                : Array.isArray(body?.data)
                  ? body.data
                  : Array.isArray(body?.data?.data)
                    ? body.data.data
                    : [];
            if (batch.length === 0) break;

            rows.push(...batch);

            const totalPages =
                body?.pagination?.totalPages ?? body?.data?.pagination?.totalPages;
            if (totalPages ? page >= totalPages : batch.length < PAGE_SIZE) break;
        }
    } catch {
        // Fall through with whatever was collected before the failure.
    }
    return rows.filter((r) => r?._id).slice(0, MAX_LISTINGS_PER_TYPE);
}

function lastModified(row: ListingRow, fallback: Date): Date {
    const raw = row.updatedAt || row.createdAt;
    if (!raw) return fallback;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? fallback : d;
}

/** Emits one entry per locale, cross-linked with hreflang alternates. */
function perLocale(
    path: string,
    opts: {
        lastModified: Date;
        changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
        priority: number;
    },
): MetadataRoute.Sitemap {
    return routing.locales.map((locale) => ({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: opts.lastModified,
        changeFrequency: opts.changeFrequency,
        priority: opts.priority,
        alternates: {
            languages: Object.fromEntries(
                routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
            ),
        },
    }));
}

/**
 * Sitemap of public routes plus every published listing, emitted once per
 * locale with hreflang alternates so Google indexes both languages
 * independently.
 *
 * Listings are the point: they are the long tail of this site, and a static
 * sitemap left several hundred detail pages with no path in from search other
 * than internal crawling.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticRoutes: {
        path: string;
        changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
        priority: number;
    }[] = [
        { path: "", changeFrequency: "weekly", priority: 1.0 },
        { path: "/routes/properties", changeFrequency: "daily", priority: 0.9 },
        { path: "/routes/services", changeFrequency: "daily", priority: 0.9 },
        { path: "/routes/buy-and-sell", changeFrequency: "daily", priority: 0.9 },
        { path: "/routes/about", changeFrequency: "monthly", priority: 0.6 },
        { path: "/routes/pricing", changeFrequency: "monthly", priority: 0.6 },
        { path: "/routes/how-it-works", changeFrequency: "monthly", priority: 0.6 },
        { path: "/routes/help", changeFrequency: "monthly", priority: 0.5 },
        { path: "/routes/terms", changeFrequency: "yearly", priority: 0.3 },
        { path: "/routes/privacy", changeFrequency: "yearly", priority: 0.3 },
        { path: "/routes/platform-policy", changeFrequency: "yearly", priority: 0.3 },
    ];

    // Only published listings: pending or rejected ones render a status notice
    // rather than content, so indexing them would surface empty pages.
    const [properties, services, buySell] = await Promise.all([
        fetchListings("/properties?status=approved"),
        fetchListings("/services?status=active"),
        fetchListings("/buy-sell?status=approved"),
    ]);

    const listingEntries = [
        ...properties.map((r) => ({ r, prefix: "/routes/property" })),
        ...services.map((r) => ({ r, prefix: "/routes/service" })),
        ...buySell.map((r) => ({ r, prefix: "/routes/buy-and-sell" })),
    ].flatMap(({ r, prefix }) =>
        perLocale(`${prefix}/${r._id}`, {
            lastModified: lastModified(r, now),
            changeFrequency: "weekly",
            priority: 0.8,
        }),
    );

    return [
        ...staticRoutes.flatMap((route) =>
            perLocale(route.path, {
                lastModified: now,
                changeFrequency: route.changeFrequency,
                priority: route.priority,
            }),
        ),
        ...listingEntries,
    ];
}
