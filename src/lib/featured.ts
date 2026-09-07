/** True when a listing is marked featured/premium by the API. */
export function isFeaturedListing(item?: {
    isPremium?: boolean;
    isFeatured?: boolean;
    featured?: boolean;
} | null): boolean {
    if (!item) return false;
    return Boolean(item.isPremium || item.isFeatured || item.featured);
}

/** Keep featured listings first while preserving relative order. */
export function sortFeaturedFirst<T>(
    items: T[],
    isFeatured: (item: T) => boolean,
): T[] {
    return [...items].sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)));
}
