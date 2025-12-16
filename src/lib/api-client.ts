import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logError } from '@/utils/persistentLogger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
    pagination?: PaginationMeta;  // Pagination can be at root level for paginated endpoints
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    message: string;
    statusCode: number;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                if (typeof window !== 'undefined') {
                    // Use consistent 'token' key from localStorage or sessionStorage
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        // Note: 401 handling is done by AuthService interceptors to avoid duplicate logout
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                // Log errors but don't handle 401 here - AuthService handles it
                if (error.response?.status) {
                    const status = error.response.status;
                    const url = error.config?.url;
                    logError('ApiClient: HTTP error', { status, url, message: error.message });
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
        const response: AxiosResponse<ApiSuccessResponse<T>> = await this.client.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
        const response: AxiosResponse<ApiSuccessResponse<T>> = await this.client.post(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
        const response: AxiosResponse<ApiSuccessResponse<T>> = await this.client.patch(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
        const response: AxiosResponse<ApiSuccessResponse<T>> = await this.client.delete(url, config);
        return response.data;
    }

    async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
        const response: AxiosResponse<ApiSuccessResponse<T>> = await this.client.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
        });
        return response.data;
    }
}

export const apiClient = new ApiClient();
