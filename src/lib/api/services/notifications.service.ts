import apiClient from '../client';
import { ApiResponse, Notification, PaginationResult } from '../types';

export const notificationsService = {
  async getAll(unreadOnly = false, page = 1, limit = 20): Promise<PaginationResult<Notification>> {
    const { data } = await apiClient.get<ApiResponse<PaginationResult<Notification>>>('/notifications', {
      params: { unreadOnly, page, limit },
    });
    return data.data!;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  async getUnreadCount(): Promise<number> {
    const result = await this.getAll(true, 1, 1);
    return result.pagination.totalItems;
  },
};
