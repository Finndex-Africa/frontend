import apiClient from '../client';
import { ApiResponse, Booking, PaginationResult } from '../types';

export interface CreateBookingData {
  serviceId: string;
  scheduledDate: string;
  duration: number;
  notes?: string;
  contactPhone: string;
}

export const bookingsService = {
  async create(bookingData: CreateBookingData): Promise<Booking> {
    const { data } = await apiClient.post<ApiResponse<Booking>>('/bookings', bookingData);
    return data.data!;
  },

  async getMyBookings(page = 1, limit = 20, status?: string): Promise<PaginationResult<Booking>> {
    const { data } = await apiClient.get<ApiResponse<PaginationResult<Booking>>>('/bookings/my-bookings', {
      params: { page, limit, status },
    });
    return data.data!;
  },

  async getUpcoming(): Promise<Booking[]> {
    const { data } = await apiClient.get<ApiResponse<Booking[]>>('/bookings/upcoming');
    return data.data!;
  },

  async updateStatus(id: string, status: string): Promise<Booking> {
    const { data } = await apiClient.put<ApiResponse<Booking>>(`/bookings/${id}`, { status });
    return data.data!;
  },
};
