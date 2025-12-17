'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { reviewsApi, CreateReviewDto } from '@/services/api/reviews.api';
import { AuthService } from '@/services/auth.service';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/lib/toast';

interface ReviewFormProps {
    itemType: 'property' | 'service';
    itemId: string;
    itemTitle?: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ itemType, itemId, itemTitle, onSuccess }: ReviewFormProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [text, setText] = useState('');
    const [errors, setErrors] = useState<{ rating?: string; text?: string }>({});

    const authService = AuthService.getInstance();
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();

    const validateForm = () => {
        const newErrors: { rating?: string; text?: string } = {};

        if (!rating) {
            newErrors.rating = 'Please select a rating';
        }

        if (!text.trim()) {
            newErrors.text = 'Please write your review';
        } else if (text.trim().length < 10) {
            newErrors.text = 'Review must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated || !user) {
            showToast.warning('Please log in to leave a review');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const reviewData: CreateReviewDto = {
                itemType,
                itemId,
                rating,
                text: text.trim(),
            };

            await reviewsApi.create(reviewData);
            showToast.success('Review submitted successfully!');

            // Reset form
            setRating(0);
            setText('');
            setErrors({});
            setIsModalVisible(false);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Review submission error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit review';
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setRating(0);
        setText('');
        setErrors({});
    };

    if (!isAuthenticated) {
        return (
            <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">Please log in to leave a review</p>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsModalVisible(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
                <Star className="w-5 h-5" />
                Write a Review
            </button>

            <Modal
                open={isModalVisible}
                onClose={handleCancel}
                title={`Review ${itemTitle || (itemType === 'property' ? 'Property' : 'Service')}`}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= (hoverRating || rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {errors.rating && (
                            <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
                        )}
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Share your experience with this property/service..."
                            maxLength={1000}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                        <div className="flex justify-between items-center mt-1">
                            {errors.text ? (
                                <p className="text-sm text-red-500">{errors.text}</p>
                            ) : (
                                <div />
                            )}
                            <p className="text-xs text-gray-500">{text.length} / 1000</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Star className="w-4 h-4" />
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
