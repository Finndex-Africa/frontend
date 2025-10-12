import apiClient from '../client';
import { ApiResponse, DashboardStats, Property, Service } from '../types';

export interface DashboardListing {
  _id: string;
  title: string;
  type: string;
  status: string;
  views: number;
  inquiries: number;
  createdAt: string;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data.data!;
  },

  async getListings(type?: string, status?: string): Promise<Array<Property | Service>> {
    const { data } = await apiClient.get<ApiResponse<Array<Property | Service>>>('/dashboard/listings', {
      params: { type, status },
    });
    return data.data!;
  },
};
