import type { Metadata } from 'next';
import type { Property } from '@/types/dashboard';
import type { Service } from '@/types/dashboard';

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

export function buildPropertyShareMetadata(property: Property): Metadata {
    const siteUrl = getSiteUrl();
    const canonicalPath = `/routes/property/${property._id}`;
    const absoluteUrl = `${siteUrl}${canonicalPath}`;
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
        alternates: { canonical: canonicalPath },
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title,
            description,
            url: absoluteUrl,
            images,
            locale: 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images.map((i) => i.url),
        },
    };
}

export function buildServiceShareMetadata(service: Service): Metadata {
    const siteUrl = getSiteUrl();
    const canonicalPath = `/routes/service/${service._id}`;
    const absoluteUrl = `${siteUrl}${canonicalPath}`;
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
        alternates: { canonical: canonicalPath },
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title,
            description,
            url: absoluteUrl,
            images,
            locale: 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images.map((i) => i.url),
        },
    };
}
