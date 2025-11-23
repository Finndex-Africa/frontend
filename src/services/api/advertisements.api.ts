import { apiClient } from '@/lib/api-client';

export interface Advertisement {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    linkUrl?: string;
    placement: 'home' | 'properties' | 'services' | 'sidebar' | 'banner';
    status: 'active' | 'paused' | 'ended';
    startDate: string;
    endDate: string;
    budget?: number;
    impressions?: number;
    clicks?: number;
    priority?: number;
    createdAt: string;
    updatedAt: string;
}

export interface AdvertisementFilters {
    page?: number;
    limit?: number;
    placement?: string;
    status?: string;
    search?: string;
}

export const advertisementsApi = {
    // Get all advertisements (admin)
    getAll: async (filters?: AdvertisementFilters) => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.placement) params.append('placement', filters.placement);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);

        return apiClient.get<{ data: Advertisement[]; pagination: any }>(`/advertisements?${params.toString()}`);
    },

    // Get active advertisements for a specific placement (public)
    getActive: async (placement?: string, location?: string) => {
        const params = new URLSearchParams();
        if (placement) params.append('placement', placement);
        if (location) params.append('location', location);

        return apiClient.get<Advertisement[]>(`/advertisements/active?${params.toString()}`);
    },

    // Get single advertisement
    getById: async (id: string) => {
        return apiClient.get<Advertisement>(`/advertisements/${id}`);
    },

    // Create advertisement (admin)
    create: async (data: Partial<Advertisement>) => {
        return apiClient.post<Advertisement>('/advertisements', data);
    },

    // Update advertisement (admin)
    update: async (id: string, data: Partial<Advertisement>) => {
        return apiClient.patch<Advertisement>(`/advertisements/${id}`, data);
    },

    // Delete advertisement (admin)
    delete: async (id: string) => {
        return apiClient.delete<void>(`/advertisements/${id}`);
    },

    // Track impression
    trackImpression: async (id: string) => {
        return apiClient.post<void>(`/advertisements/${id}/impression`, {});
    },

    // Track click
    trackClick: async (id: string) => {
        return apiClient.post<void>(`/advertisements/${id}/click`, {});
    },

    // Get advertisement statistics
    getStats: async (id: string) => {
        return apiClient.get<{ impressions: number; clicks: number; ctr: number }>(`/advertisements/${id}/stats`);
    },
};
