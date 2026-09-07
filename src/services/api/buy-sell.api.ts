import { apiClient } from "@/lib/api-client";
import {
  BuySellListing,
  BuySellFilters,
  CreateBuySellDto,
  UpdateBuySellDto,
} from "@/types/buy-sell";

export const buySellApi = {
  // ── Public ──────────────────────────────────────────────────────────────

  /** List all approved listings with optional filters & pagination. */
  getAll: async (filters?: BuySellFilters) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.minPrice)
      params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());
    // Without this the backend reads the budget as USD, so an RWF budget
    // filters out every listing.
    if (filters?.currency) params.append("currency", filters.currency);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.q) params.append("q", filters.q);
    if (filters?.sort) params.append("sort", filters.sort);
    return apiClient.get<BuySellListing[]>(
      `/buy-sell?${params.toString()}`,
    );
  },

  /** Get a single listing by ID (also increments view count). */
  getById: async (id: string) => {
    return apiClient.get<BuySellListing>(`/buy-sell/${id}`);
  },

  // ── Authenticated ────────────────────────────────────────────────────────

  /** Get the currently authenticated seller's own listings. */
  getMine: async (status?: string) => {
    const params = status ? `?status=${status}` : "";
    return apiClient.get<BuySellListing[]>(`/buy-sell/my/listings${params}`);
  },

  /** Create a new listing. Images must already be uploaded URLs. */
  create: async (data: CreateBuySellDto) => {
    return apiClient.post<BuySellListing>("/buy-sell", data);
  },

  /** Update an existing listing (seller or admin). */
  update: async (id: string, data: UpdateBuySellDto) => {
    return apiClient.patch<BuySellListing>(`/buy-sell/${id}`, data);
  },

  /** Unpublish (suspend) a listing — removes it from public listings. */
  unpublish: async (id: string) => {
    return apiClient.patch<BuySellListing>(`/buy-sell/${id}/unpublish`, {});
  },

  /** Republish a suspended listing — resubmits it for admin approval. */
  republish: async (id: string) => {
    return apiClient.patch<BuySellListing>(`/buy-sell/${id}/republish`, {});
  },

  /** Delete a listing (seller or admin). */
  delete: async (id: string) => {
    return apiClient.delete<void>(`/buy-sell/${id}`);
  },
};
