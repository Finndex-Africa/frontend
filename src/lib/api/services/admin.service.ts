import apiClient from '../client';
import { ApiResponse, DashboardStats, User, PaginationResult, Property } from '../types';

export interface VerificationItem {
  _id: string;
  type: string;
  title: string;
  owner: User;
  status: string;
  submittedAt: string;
  details: Record<string, unknown>;
}

export const adminService = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return data.data!;
  },

  async getVerifications(type?: string, page = 1, limit = 20): Promise<PaginationResult<VerificationItem>> {
    const { data } = await apiClient.get<ApiResponse<PaginationResult<VerificationItem>>>('/admin/verifications', {
      params: { type, page, limit },
    });
    return data.data!;
  },

  async verifyProperty(propertyId: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
    await apiClient.post(`/admin/properties/${propertyId}/verify`, { action, reason });
  },

  async verifyServiceProvider(providerId: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
    await apiClient.post(`/admin/service-providers/${providerId}/verify`, { action, reason });
  },

  async getAllUsers(page = 1, limit = 20, userType?: string, status?: string): Promise<PaginationResult<User>> {
    const { data } = await apiClient.get<ApiResponse<PaginationResult<User>>>('/admin/users', {
      params: { page, limit, userType, status },
    });
    return data.data!;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}`, updates);
    return data.data!;
  },
};
