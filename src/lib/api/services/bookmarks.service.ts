import apiClient from '../client';
import { ApiResponse, Property, Service } from '../types';

export interface BookmarkData {
  itemType: 'property' | 'service';
  itemId: string;
}

export interface BookmarksResponse {
  properties: Property[];
  services: Service[];
}

export const bookmarksService = {
  async getAll(): Promise<BookmarksResponse> {
    const { data } = await apiClient.get<ApiResponse<BookmarksResponse>>('/bookmarks');
    return data.data!;
  },

  async add(bookmarkData: BookmarkData): Promise<void> {
    await apiClient.post('/bookmarks', bookmarkData);
  },

  async remove(itemType: string, itemId: string): Promise<void> {
    await apiClient.delete(`/bookmarks/${itemType}/${itemId}`);
  },

  async check(itemType: string, itemId: string): Promise<boolean> {
    const { data } = await apiClient.get<ApiResponse<{ isBookmarked: boolean }>>(`/bookmarks/check/${itemType}/${itemId}`);
    return data.data!.isBookmarked;
  },
};
