import apiClient from '../client';
import { ApiResponse, Property, PaginationResult } from '../types';

export interface PropertyFilters {
  page?: number;
  limit?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  rooms?: number;
  furnished?: boolean;
  status?: string;
  sort?: string;
  q?: string;
}

export interface CreatePropertyData {
  title: string;
  description: string;
  location: string;
  price: number;
  priceUnit?: string;
  images?: string[];
  videos?: string[];
  amenities?: Array<{ icon: string; label: string; description?: string }>;
  propertyType: string;
  rooms: number;
  furnished: boolean;
  isPremium?: boolean;
  mapCoordinates?: { lat: number; lng: number };
}

export const propertiesService = {
  async getAll(filters: PropertyFilters = {}): Promise<PaginationResult<Property>> {
    const { data } = await apiClient.get<ApiResponse<PaginationResult<Property>>>('/properties', {
      params: filters,
    });
    return data.data!;
  },

  async getById(id: string): Promise<Property> {
    const { data } = await apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
    return data.data!;
  },

  async create(propertyData: CreatePropertyData): Promise<Property> {
    const { data } = await apiClient.post<ApiResponse<Property>>('/properties', propertyData);
    return data.data!;
  },

  async update(id: string, propertyData: Partial<CreatePropertyData>): Promise<Property> {
    const { data } = await apiClient.put<ApiResponse<Property>>(`/properties/${id}`, propertyData);
    return data.data!;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/properties/${id}`);
  },

  async search(query: string, page = 1, limit = 20): Promise<PaginationResult<Property>> {
    const { data } = await apiClient.get<ApiResponse<PaginationResult<Property>>>('/properties/search', {
      params: { q: query, page, limit },
    });
    return data.data!;
  },

  async getMyProperties(status?: string): Promise<Property[]> {
    const { data } = await apiClient.get<ApiResponse<Property[]>>('/properties/my-properties', {
      params: { status },
    });
    return data.data!;
  },
};
