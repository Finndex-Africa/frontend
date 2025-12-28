'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { reviewsApi, Review, RatingDistribution } from '@/services/api/reviews.api';
import { showToast } from '@/lib/toast';

interface ReviewsListProps {
    itemType: 'property' | 'service';
    itemId: string;
    itemTitle?: string;
}

export default function ReviewsList({ itemType, itemId, itemTitle }: ReviewsListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [distribution, setDistribution] = useState<RatingDistribution | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
    const [filterRating, setFilterRating] = useState<number | undefined>(undefined);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await reviewsApi.getByItem(itemType, itemId, {
                page: currentPage,
                limit: pageSize,
                sort: sortBy,
                rating: filterRating,
            });
            setReviews(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            showToast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const fetchRatingData = async () => {
        try {
            const [avgResponse, distResponse] = await Promise.all([
                reviewsApi.getAverageRating(itemType, itemId),
                reviewsApi.getRatingDistribution(itemType, itemId),
            ]);

            setAverageRating(avgResponse.data.averageRating || 0);
            setReviewCount(avgResponse.data.reviewCount || 0);
            setDistribution(distResponse.data);
        } catch (error) {
            console.error('Error fetching rating data:', error);
        }
    };

    useEffect(() => {
        fetchReviews();
        fetchRatingData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemType, itemId, currentPage, sortBy, filterRating]);

    const handleReviewSubmitted = () => {
        setCurrentPage(1);
        fetchReviews();
        fetchRatingData();
    };

    const getPercentage = (count: number) => {
        if (reviewCount === 0) return 0;
        return Math.round((count / reviewCount) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Rating Summary Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews & Ratings</h2>

                {/* Rating Summary */}
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                    {/* Average Rating */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-5xl font-bold text-amber-500 mb-2">
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-6 h-6 ${star <= Math.round(averageRating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-gray-600">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Rating Distribution */}
                    {distribution && (
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = distribution[rating as keyof RatingDistribution] || 0;
                                const percentage = getPercentage(count);

                                return (
                                    <div key={rating} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-16">
                                            <span className="text-sm text-gray-700">{rating}</span>
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        </div>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Write Review Button */}
                <div className="pt-4 border-t border-gray-200">
                    <ReviewForm
                        itemType={itemType}
                        itemId={itemId}
                        itemTitle={itemTitle}
                        onSuccess={handleReviewSubmitted}
                    />
                </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex gap-4 flex-wrap">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful')}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="newest">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by rating</label>
                    <select
                        value={filterRating || ''}
                        onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : undefined)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-gray-600">Loading reviews...</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <>
                    <div>
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review._id}
                                review={review}
                                onUpdate={fetchReviews}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-4">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>

                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first, last, current, and pages around current
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="px-2 py-2">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
