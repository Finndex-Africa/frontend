import apiClient from '../client';
import { ApiResponse, Service, PaginationResult } from '../types';

export interface ServiceFilters {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  q?: string;
}

export interface CreateServiceData {
  title: string;
  category: string;
  description: string;
  location: string;
  price: number;
  priceUnit?: string;
  duration?: string;
  images?: string[];
  tags?: string[];
  included?: string[];
  availability?: string;
}

export const servicesService = {
  async getAll(filters: ServiceFilters = {}): Promise<PaginationResult<Service>> {
    const { data } = await apiClient.get<ApiResponse<PaginationResult<Service>>>('/services', {
      params: filters,
    });
    return data.data!;
  },

  async getById(id: string): Promise<Service> {
    const { data } = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
    return data.data!;
  },

  async create(serviceData: CreateServiceData): Promise<Service> {
    const { data } = await apiClient.post<ApiResponse<Service>>('/services', serviceData);
    return data.data!;
  },

  async update(id: string, serviceData: Partial<CreateServiceData>): Promise<Service> {
    const { data } = await apiClient.put<ApiResponse<Service>>(`/services/${id}`, serviceData);
    return data.data!;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/services/${id}`);
  },

  async getMyServices(status?: string): Promise<Service[]> {
    const { data } = await apiClient.get<ApiResponse<Service[]>>('/services/my-services', {
      params: { status },
    });
    return data.data!;
  },
};
