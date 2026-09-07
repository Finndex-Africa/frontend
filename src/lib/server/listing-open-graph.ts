import type { Metadata } from 'next';
import type { Property } from '@/types/dashboard';
import type { Service } from '@/types/dashboard';
import type { BuySellListing } from '@/types/buy-sell';
import { locales, defaultLocale, localeOgTag, type Locale } from '@/i18n/routing';

const DEFAULT_SITE_URL = 'https://findafriq.com';
const SITE_NAME = 'FindAfriq';

export function getSiteUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function getApiBase(): string {
    return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
}

/** Make image URL absolute for OG crawlers (Facebook, WhatsApp, etc.) */
export function toAbsoluteAssetUrl(imageUrl: string | undefined): string | undefined {
    if (!imageUrl || !imageUrl.trim()) return undefined;
    const trimmed = imageUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const site = getSiteUrl();
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${site}${path}`;
}

function asLocale(value: string | undefined): Locale {
    return (locales as readonly string[]).includes(value ?? '')
        ? (value as Locale)
        : defaultLocale;
}

/**
 * Canonical + hreflang for a listing.
 *
 * Every URL on this site carries its locale (/en/…, /fr/…). Emitting a
 * locale-less canonical pointed search engines at a path that only redirects,
 * which wastes crawl budget and splits ranking signals between the two.
 */
function localizedAlternates(locale: Locale, path: string): Metadata['alternates'] {
    return {
        canonical: `/${locale}${path}`,
        languages: {
            ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
            'x-default': `/${defaultLocale}${path}`,
        },
    };
}

async function fetchListingJson<T>(path: string): Promise<T | null> {
    try {
        const url = `${getApiBase()}${path}`;
        const res = await fetch(url, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 120 },
        });
        if (!res.ok) return null;
        const body = await res.json();
        if (body && body.success === true && body.data != null) {
            return body.data as T;
        }
        return null;
    } catch {
        return null;
    }
}

export async function fetchPropertyForOg(id: string): Promise<Property | null> {
    return fetchListingJson<Property>(`/properties/${encodeURIComponent(id)}`);
}

export async function fetchServiceForOg(id: string): Promise<Service | null> {
    return fetchListingJson<Service>(`/services/${encodeURIComponent(id)}`);
}

export async function fetchBuySellForOg(id: string): Promise<BuySellListing | null> {
    return fetchListingJson<BuySellListing>(`/buy-sell/${encodeURIComponent(id)}`);
}

export function buildPropertyShareMetadata(property: Property, locale?: string): Metadata {
    const siteUrl = getSiteUrl();
    const lang = asLocale(locale);
    const canonicalPath = `/routes/property/${property._id}`;
    const absoluteUrl = `${siteUrl}/${lang}${canonicalPath}`;
    const title = property.title || 'Property listing';
    const description =
        [property.location, property.description?.slice(0, 160)].filter(Boolean).join(' · ') ||
        `View this property on ${SITE_NAME}`;
    const rawImage = property.images?.[0];
    const imageUrl = toAbsoluteAssetUrl(rawImage);

    const images = imageUrl
        ? [{ url: imageUrl, alt: title }]
        : [{ url: `${siteUrl}/icon-512.png`, alt: SITE_NAME }];

    return {
        title,
        description,
        alternates: localizedAlternates(lang, canonicalPath),
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title,
            description,
            url: absoluteUrl,
            images,
            locale: localeOgTag[lang],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images.map((i) => i.url),
        },
    };
}

export function buildServiceShareMetadata(service: Service, locale?: string): Metadata {
    const siteUrl = getSiteUrl();
    const lang = asLocale(locale);
    const canonicalPath = `/routes/service/${service._id}`;
    const absoluteUrl = `${siteUrl}/${lang}${canonicalPath}`;
    const title = service.title || 'Service listing';
    const description =
        [service.category, service.description?.slice(0, 160)].filter(Boolean).join(' · ') ||
        `Book this service on ${SITE_NAME}`;
    const rawImage = service.images?.[0];
    const imageUrl = toAbsoluteAssetUrl(rawImage);

    const images = imageUrl
        ? [{ url: imageUrl, alt: title }]
        : [{ url: `${siteUrl}/icon-512.png`, alt: SITE_NAME }];

    return {
        title,
        description,
        alternates: localizedAlternates(lang, canonicalPath),
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title,
            description,
            url: absoluteUrl,
            images,
            locale: localeOgTag[lang],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images.map((i) => i.url),
        },
    };
}

/**
 * Buy & Sell listings previously shared one hardcoded title and description,
 * so every listing looked like duplicate content to a crawler and none could
 * rank on its own terms. This derives both from the listing itself.
 */
export function buildBuySellShareMetadata(
    listing: BuySellListing,
    locale?: string,
): Metadata {
    const siteUrl = getSiteUrl();
    const lang = asLocale(locale);
    const canonicalPath = `/routes/buy-and-sell/${listing._id}`;
    const absoluteUrl = `${siteUrl}/${lang}${canonicalPath}`;
    const title = listing.title || 'Listing';
    const kind =
        listing.category === 'land'
            ? 'Land for sale'
            : listing.category === 'house'
              ? 'House for sale'
              : 'Item for sale';
    const description =
        [kind, listing.location, listing.description?.slice(0, 140)]
            .filter(Boolean)
            .join(' · ') || `View this listing on ${SITE_NAME}`;
    const imageUrl = toAbsoluteAssetUrl(listing.images?.[0]);
    const images = imageUrl
        ? [{ url: imageUrl, alt: title }]
        : [{ url: `${siteUrl}/icon-512.png`, alt: SITE_NAME }];

    return {
        title,
        description,
        alternates: localizedAlternates(lang, canonicalPath),
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title,
            description,
            url: absoluteUrl,
            images,
            locale: localeOgTag[lang],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images.map((i) => i.url),
        },
    };
}
