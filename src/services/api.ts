/**
 * API Service
 * Centralized API client for dashboard operations
 */

import type {
  PropertiesResponse,
  PropertiesQueryParams,
  DashboardStats,
  Property,
} from '@/types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * API Error Handler
 */
class ApiErrorHandler extends Error {
  statusCode: number;
  errors?: { field: string; message: string }[];

  constructor(message: string, statusCode: number, errors?: { field: string; message: string }[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Get authorization token from storage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiErrorHandler(
        data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    // Handle NestJS ApiSuccessResponse format
    return data.data || data;
  } catch (error) {
    if (error instanceof ApiErrorHandler) {
      throw error;
    }

    // Network or parsing error
    throw new ApiErrorHandler(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}

/**
 * Properties API
 */
export const propertiesApi = {
  /**
   * Get paginated properties with search and filters
   */
  getProperties: async (params: PropertiesQueryParams = {}): Promise<PropertiesResponse> => {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('q', params.search); // Backend uses 'q' for search
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.type) queryParams.append('propertyType', params.type); // Backend uses 'propertyType'
    if (params.status) queryParams.append('status', params.status);
    if (params.verified !== undefined) queryParams.append('verified', params.verified.toString());

    const query = queryParams.toString();
    const endpoint = `/properties${query ? `?${query}` : ''}`;

    const response = await apiFetch<{
      data: Property[];
      pagination: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
      };
    }>(endpoint);

    // Transform backend pagination format to frontend format
    return {
      data: response.data,
      meta: {
        page: response.pagination.currentPage,
        limit: response.pagination.itemsPerPage,
        total: response.pagination.totalItems,
        totalPages: response.pagination.totalPages,
        hasNextPage: response.pagination.currentPage < response.pagination.totalPages,
        hasPrevPage: response.pagination.currentPage > 1,
      },
    };
  },

  /**
   * Get single property by ID
   */
  getProperty: async (id: string): Promise<Property> => {
    return apiFetch<Property>(`/api/properties/${id}`);
  },

  /**
   * Verify property (admin only)
   */
  verifyProperty: async (id: string): Promise<Property> => {
    return apiFetch<Property>(`/admin/properties/${id}/verify`, {
      method: 'PATCH',
    });
  },

  /**
   * Delete property
   */
  deleteProperty: async (id: string): Promise<void> => {
    return apiFetch<void>(`/api/properties/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    // This will need to be implemented on the backend
    return apiFetch<DashboardStats>('/api/dashboard/stats');
  },

  /**
   * Get admin dashboard statistics
   */
  getAdminStats: async (): Promise<DashboardStats> => {
    return apiFetch<DashboardStats>('/admin/dashboard');
  },

  /**
   * Get user dashboard statistics
   */
  getUserDashboard: async (): Promise<DashboardStats> => {
    return apiFetch<DashboardStats>('/dashboard/stats');
  },

  /**
   * Get activity log
   */
  getActivity: async (): Promise<unknown[]> => {
    return apiFetch<unknown[]>('/dashboard/activity');
  },
};

/**
 * Services API
 */
export const servicesApi = {
  /**
   * Get paginated services
   */
  getServices: async (params: { page?: number; limit?: number; search?: string; category?: string; status?: string } = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('q', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiFetch<any>(`/services${query ? `?${query}` : ''}`);
  },
};

/**
 * Users API (Admin)
 */
export const usersApi = {
  /**
   * Get paginated users
   */
  getUsers: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiFetch<unknown>(`/admin/users${query ? `?${query}` : ''}`);
  },
};

/**
 * Auth API
 */
export const authApi = {
  /**
   * Get current user profile
   */
  getMe: async () => {
    return apiFetch<any>('/auth/me');
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => {
    return apiFetch<any>('/admin/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Export error class for component use
 */
export { ApiErrorHandler };

/**
 * Type guard for API errors
 */
export const isApiError = (error: unknown): error is ApiErrorHandler => {
  return error instanceof ApiErrorHandler;
};
