import { apiClient, ApiSuccessResponse, PaginatedResponse } from '@/lib/api-client';
import { Booking } from '@/types/dashboard';

export interface BookingFilters {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    serviceId?: string;
    providerId?: string;
    scope?: 'customer' | 'provider';
}

export interface CreateBookingDto {
    serviceId: string;
    scheduledDate: string;
    duration: number;
    contactPhone: string;
    notes?: string;
    serviceLocation?: string;
    serviceAddress?: string;
    providerId?: string;
    paymentMethod?: string;
}

const PROVIDER_ROLES = new Set(['service_provider', 'provider', 'landlord', 'agent']);

export function isProviderRole(role: string | undefined | null): boolean {
    return PROVIDER_ROLES.has((role || '').toLowerCase());
}

export function parseBookingsList(response: ApiSuccessResponse<Booking[] | PaginatedResponse<Booking>>): Booking[] {
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray((payload as PaginatedResponse<Booking>).data)) {
        return (payload as PaginatedResponse<Booking>).data;
    }
    return [];
}

function buildBookingQuery(filters?: BookingFilters): string {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.serviceId) params.append('serviceId', filters.serviceId);
    if (filters?.providerId) params.append('providerId', filters.providerId);
    if (filters?.scope) params.append('scope', filters.scope);
    return params.toString();
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> {
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress' | 'rejected';
}

export const bookingsApi = {
    // Get all bookings with filters and pagination (admin / scoped queries)
    getAll: async (filters?: BookingFilters) => {
        const query = buildBookingQuery(filters);
        return apiClient.get<PaginatedResponse<Booking>>(`/bookings${query ? `?${query}` : ''}`);
    },

    // Bookings the logged-in user made as a customer
    getMyBookings: async (filters?: Omit<BookingFilters, 'scope' | 'providerId'>) => {
        const query = buildBookingQuery(filters);
        return apiClient.get<Booking[] | PaginatedResponse<Booking>>(
            `/bookings/my-bookings${query ? `?${query}` : ''}`,
        );
    },

    // Bookings sent to the logged-in provider/landlord/agent
    getProviderBookings: async (filters?: Omit<BookingFilters, 'scope' | 'userId'>) => {
        const query = buildBookingQuery(filters);
        return apiClient.get<Booking[] | PaginatedResponse<Booking>>(
            `/bookings/provider-bookings${query ? `?${query}` : ''}`,
        );
    },

    // Fetch the correct list for the current user's role
    getForCurrentUser: async (role: string | undefined | null, filters?: BookingFilters) => {
        if (isProviderRole(role)) {
            return bookingsApi.getProviderBookings(filters);
        }
        return bookingsApi.getMyBookings(filters);
    },

    // Get single booking by ID
    getById: async (id: string) => {
        return apiClient.get<Booking>(`/bookings/${id}`);
    },

    // Create new booking
    create: async (data: CreateBookingDto) => {
        return apiClient.post<Booking>('/bookings', data);
    },

    // Update booking
    update: async (id: string, data: UpdateBookingDto) => {
        return apiClient.patch<Booking>(`/bookings/${id}`, data);
    },

    // Delete booking
    delete: async (id: string) => {
        return apiClient.delete<void>(`/bookings/${id}`);
    },

    // Confirm booking (provider/landlord/agent only)
    confirm: async (id: string, data?: { notes?: string; estimatedDuration?: number; depositAmount?: number }) => {
        return apiClient.patch<Booking>(`/bookings/${id}/confirm`, data || {});
    },

    // Cancel booking
    cancel: async (id: string, reason: string) => {
        return apiClient.patch<Booking>(`/bookings/${id}/cancel`, { reason });
    },

    // Reject booking
    reject: async (id: string, reason: string) => {
        return apiClient.patch<Booking>(`/bookings/${id}`, {
            status: 'rejected',
            cancellationReason: reason,
        });
    },
};
