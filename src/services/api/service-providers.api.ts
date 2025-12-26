import { apiClient } from '@/lib/api-client';

export interface ServiceProviderProfile {
    _id: string;
    userId: string;
    businessName: string;
    serviceTypes: string[];
    location: string;
    phone: string;
    whatsapp?: string;
    experience: number;
    certifications: string[];
    photos: string[];
    description: string;
    verificationStatus: string;
    verified: boolean;
    verifiedAt?: string;
    logoUrl?: string;
    imageUrl?: string;
    rating: number;
    completedJobs: number;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OnboardProviderDto {
    businessName: string;
    serviceTypes: string[];
    location: string;
    phone: string;
    whatsapp?: string;
    experience: number;
    certifications?: string[];
    photos?: string[];
    description: string;
    logoUrl?: string;
    imageUrl?: string;
}

export interface UpdateProviderDto {
    businessName?: string;
    serviceTypes?: string[];
    location?: string;
    phone?: string;
    whatsapp?: string;
    experience?: number;
    certifications?: string[];
    photos?: string[];
    description?: string;
    logoUrl?: string;
    imageUrl?: string;
}

export const serviceProvidersApi = {
    // Get my service provider profile
    getMyProfile: async () => {
        return apiClient.get<ServiceProviderProfile | null>('/service-providers/my-profile');
    },

    // Onboard as a service provider
    onboard: async (data: OnboardProviderDto) => {
        return apiClient.post<ServiceProviderProfile>('/service-providers/onboard', data);
    },

    // Update service provider profile
    update: async (id: string, data: UpdateProviderDto) => {
        return apiClient.patch<ServiceProviderProfile>(`/service-providers/${id}`, data);
    },

    // Get service provider by ID
    getById: async (id: string) => {
        return apiClient.get<ServiceProviderProfile>(`/service-providers/${id}`);
    },

    // Get service provider by user ID
    getByUserId: async (userId: string) => {
        return apiClient.get<ServiceProviderProfile | null>(`/service-providers/by-user/${userId}`);
    },
};
