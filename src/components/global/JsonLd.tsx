import type { Locale } from "@/i18n/routing";

/**
 * Renders a schema.org graph as JSON-LD.
 *
 * Server-rendered on purpose: crawlers that do not execute JavaScript still
 * need to see it, which rules out injecting the tag from a client component.
 *
 * `JSON.stringify` output is escaped for `<` so a listing whose title or
 * description contains markup cannot close the script tag early and inject
 * into the page.
 */
export default function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    );
}

const SITE_URL = "https://findafriq.com";
const SITE_NAME = "FindAfriq";

/** Social profiles, used as `sameAs` so Google can link the brand entity. */
const SOCIAL_PROFILES = [
    "https://www.facebook.com/profile.php?id=61577745584378",
    "https://www.linkedin.com/company/findafriq/",
    "https://www.youtube.com/@Findafriq",
];

/**
 * Sitewide identity: who runs the site, and how to search it.
 *
 * The `SearchAction` is what makes a sitelinks search box eligible; the
 * `Organization` node is what lets Google attach a knowledge panel and show the
 * logo beside results.
 */
export function siteJsonLd(locale: Locale, description: string) {
    const base = `${SITE_URL}/${locale}`;
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/icon-512.png`,
                    width: 512,
                    height: 512,
                },
                description,
                sameAs: SOCIAL_PROFILES,
            },
            {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: base,
                name: SITE_NAME,
                description,
                inLanguage: locale,
                publisher: { "@id": `${SITE_URL}/#organization` },
                potentialAction: {
                    "@type": "SearchAction",
                    target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${base}/routes/properties?location={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                },
            },
        ],
    };
}

/** Trail shown as the breadcrumb line in a search result. */
export function breadcrumbJsonLd(
    locale: Locale,
    trail: { name: string; path: string }[],
) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: `${SITE_URL}/${locale}${crumb.path}`,
        })),
    };
}

type ListingSchemaInput = {
    id: string;
    path: string;
    name: string;
    description?: string;
    images?: string[];
    price?: number | null;
    currency?: string;
    location?: string;
    /** schema.org type — e.g. "Product", "Accommodation", "Service". */
    type: string;
    /** Extra type-specific properties merged into the node. */
    extra?: Record<string, unknown>;
};

/**
 * A single listing, with an `Offer` when a price is known.
 *
 * `currency` defaults to USD, which is correct on this branch because listings
 * carry no currency field yet. When the multi-currency work lands, pass the
 * listing's own currency here — never the visitor's chosen display currency,
 * since structured data is read by crawlers and quoting a converted figure
 * would publish a number the seller never agreed to.
 */
export function listingJsonLd(locale: Locale, input: ListingSchemaInput) {
    const url = `${SITE_URL}/${locale}${input.path}`;
    const images = (input.images ?? [])
        .filter(Boolean)
        .map((src) => (/^https?:\/\//i.test(src) ? src : `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`))
        .slice(0, 6);

    const node: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": input.type,
        "@id": `${url}#listing`,
        name: input.name,
        url,
        inLanguage: locale,
        provider: { "@id": `${SITE_URL}/#organization` },
        ...input.extra,
    };

    if (input.description) node.description = input.description.slice(0, 500);
    if (images.length) node.image = images;
    if (input.location) {
        node.address = { "@type": "PostalAddress", addressLocality: input.location };
    }
    if (typeof input.price === "number" && Number.isFinite(input.price) && input.price > 0) {
        node.offers = {
            "@type": "Offer",
            price: input.price,
            priceCurrency: input.currency || "USD",
            availability: "https://schema.org/InStock",
            url,
        };
    }

    return node;
}
