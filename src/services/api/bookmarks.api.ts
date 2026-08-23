import { apiClient } from '@/lib/api-client';

export interface BookmarkToggleResult {
    bookmarked: boolean;
    bookmarkId?: string;
}

export interface SavedItem {
    bookmarkId: string;
    type: 'property' | 'service' | 'buy-sell';
    isBookmarked: boolean;
    listing: {
        _id: string;
        title: string;
        description?: string;
        location: string;
        price?: number;
        images?: string[];
        rating?: number;
        reviewCount?: number;
        category?: string;
        status?: string;
    };
}

export const bookmarksApi = {
    /**
     * Toggle bookmark on/off.
     * POST /api/bookmarks { type, itemId }
     * Returns { bookmarked: true/false, bookmarkId? }
     */
    toggle: async (type: string, itemId: string): Promise<BookmarkToggleResult> => {
        const res = await apiClient.post('/bookmarks', { type, itemId });
        // Normalise — backend may nest under `.data` or return flat; field may be `bookmarked` or `saved`/`isSaved`
        const payload = (res.data as any)?.data ?? res.data;
        return {
            bookmarked: payload?.bookmarked ?? payload?.saved ?? payload?.isSaved ?? false,
            bookmarkId: payload?.bookmarkId ?? null,
        };
    },

    /** Check whether the current user has saved an item */
    check: async (type: string, itemId: string): Promise<{ isSaved: boolean; bookmarkId?: string }> => {
        const res = await apiClient.get(
            `/bookmarks/check?type=${encodeURIComponent(type)}&itemId=${encodeURIComponent(itemId)}`
        );
        // Normalise — backend may nest under `.data` or return flat; field may be `isSaved`, `saved`, or `isBookmarked`
        const payload = (res.data as any)?.data ?? res.data;
        return {
            isSaved: payload?.isSaved ?? payload?.saved ?? payload?.isBookmarked ?? false,
            bookmarkId: payload?.bookmarkId ?? null,
        };
    },

    /** Fetch all saved listings (optionally filtered by type) */
    getAll: async (type?: string): Promise<SavedItem[]> => {
        const url = type ? `/bookmarks?type=${encodeURIComponent(type)}` : '/bookmarks';
        const res = await apiClient.get<{ data: SavedItem[] }>(url);
        return (res.data as any).data ?? res.data ?? [];
    },

    /** Remove a bookmark by its ID */
    removeById: async (bookmarkId: string): Promise<void> => {
        await apiClient.delete(`/bookmarks/${bookmarkId}`);
    },
};
