import { apiClient, ApiSuccessResponse, PaginationMeta } from '@/lib/api-client';

export interface Review {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    itemType: 'property' | 'service';
    itemId: string;
    rating: number;
    text: string;
    photos?: string[];
    ownerReply?: string;
    ownerReplyAt?: string;
    ownerReplyBy?: string;
    helpfulBy: string[];
    helpfulCount: number;
    reported: boolean;
    reportReason?: string;
    reportCount: number;
    approved: boolean;
    hidden: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewDto {
    itemType: 'property' | 'service';
    itemId: string;
    rating: number;
    text: string;
    photos?: string[];
}

export interface UpdateReviewDto {
    rating?: number;
    text?: string;
    photos?: string[];
}

export interface ReplyToReviewDto {
    reply: string;
}

export interface ReportReviewDto {
    reason: string;
}

export interface FilterReviewDto {
    page?: number;
    limit?: number;
    rating?: number;
    sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

export interface RatingDistribution {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
}

export interface ReviewStats {
    averageRating: number;
    reviewCount: number;
    distribution: RatingDistribution;
}

export const reviewsApi = {
    // Create a new review
    create: async (data: CreateReviewDto): Promise<ApiSuccessResponse<Review>> => {
        return apiClient.post<Review>('/reviews', data);
    },

    // Get reviews for a specific item (property or service)
    getByItem: async (
        itemType: 'property' | 'service',
        itemId: string,
        filters?: FilterReviewDto
    ): Promise<ApiSuccessResponse<Review[]> & { pagination?: PaginationMeta }> => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.rating) params.append('rating', filters.rating.toString());
        if (filters?.sort) params.append('sort', filters.sort);

        const queryString = params.toString();
        const url = `/reviews/item/${itemType}/${itemId}${queryString ? `?${queryString}` : ''}`;
        return apiClient.get<Review[]>(url) as any;
    },

    // Get my reviews
    getMyReviews: async (): Promise<ApiSuccessResponse<Review[]>> => {
        return apiClient.get<Review[]>('/reviews/my-reviews');
    },

    // Get my review stats
    getMyStats: async (): Promise<ApiSuccessResponse<any>> => {
        return apiClient.get<any>('/reviews/my-stats');
    },

    // Get average rating for an item
    getAverageRating: async (
        itemType: 'property' | 'service',
        itemId: string
    ): Promise<ApiSuccessResponse<{ averageRating: number; reviewCount: number }>> => {
        return apiClient.get<{ averageRating: number; reviewCount: number }>(
            `/reviews/average/${itemType}/${itemId}`
        );
    },

    // Get rating distribution for an item
    getRatingDistribution: async (
        itemType: 'property' | 'service',
        itemId: string
    ): Promise<ApiSuccessResponse<RatingDistribution>> => {
        return apiClient.get<RatingDistribution>(
            `/reviews/distribution/${itemType}/${itemId}`
        );
    },

    // Reply to a review (Owner/Provider only)
    replyToReview: async (
        reviewId: string,
        data: ReplyToReviewDto
    ): Promise<ApiSuccessResponse<Review>> => {
        return apiClient.post<Review>(`/reviews/${reviewId}/reply`, data);
    },

    // Mark review as helpful
    markAsHelpful: async (reviewId: string): Promise<ApiSuccessResponse<Review>> => {
        return apiClient.post<Review>(`/reviews/${reviewId}/helpful`, {});
    },

    // Report a review
    reportReview: async (
        reviewId: string,
        data: ReportReviewDto
    ): Promise<ApiSuccessResponse<{ message: string }>> => {
        return apiClient.post<{ message: string }>(`/reviews/${reviewId}/report`, data);
    },

    // Get single review by ID
    getById: async (id: string): Promise<ApiSuccessResponse<Review>> => {
        return apiClient.get<Review>(`/reviews/${id}`);
    },

    // Update a review
    update: async (
        id: string,
        data: UpdateReviewDto
    ): Promise<ApiSuccessResponse<Review>> => {
        return apiClient.patch<Review>(`/reviews/${id}`, data);
    },

    // Delete a review
    delete: async (id: string): Promise<ApiSuccessResponse<{ message: string }>> => {
        return apiClient.delete<{ message: string }>(`/reviews/${id}`);
    },
};
