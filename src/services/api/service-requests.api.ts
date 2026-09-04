import { apiClient } from '@/lib/api-client';

/** Which page the request came from, so admins can see where listings fall short. */
export type ServiceRequestCategory = 'property' | 'service' | 'buy_and_sell';

export interface ServiceRequest {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    category: ServiceRequestCategory;
    details: string;
    location?: string;
    budget?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceRequestDto {
    fullName: string;
    email: string;
    phone?: string;
    category: ServiceRequestCategory;
    details: string;
    location?: string;
    budget?: string;
}

export const serviceRequestsApi = {
    submit: async (data: CreateServiceRequestDto) => {
        return apiClient.post<ServiceRequest>('/service-requests', data);
    },
};
