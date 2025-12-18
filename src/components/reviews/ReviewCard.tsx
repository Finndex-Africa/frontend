'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, Trash2, MessageSquare } from 'lucide-react';
import { Review, reviewsApi } from '@/services/api/reviews.api';
import { AuthService } from '@/services/auth.service';
import { showToast } from '@/lib/toast';
import Modal from '@/components/ui/Modal';

interface ReviewCardProps {
    review: Review;
    onUpdate?: () => void;
    showOwnerReply?: boolean;
}

export default function ReviewCard({ review, onUpdate, showOwnerReply = true }: ReviewCardProps) {
    const authService = AuthService.getInstance();
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();

    const [isHelpful, setIsHelpful] = useState(review.helpfulBy.includes(user?.id || ''));
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    const handleMarkHelpful = async () => {
        if (!isAuthenticated || !user) {
            showToast.warning('Please log in to mark reviews as helpful');
            return;
        }

        try {
            await reviewsApi.markAsHelpful(review._id);
            setIsHelpful(!isHelpful);
            setHelpfulCount(isHelpful ? helpfulCount - 1 : helpfulCount + 1);
            showToast.success(isHelpful ? 'Removed from helpful' : 'Marked as helpful');
        } catch (error) {
            console.error('Mark helpful error:', error);
            showToast.error('Failed to mark as helpful');
        }
    };

    const handleReport = async () => {
        if (!reportReason.trim()) {
            showToast.warning('Please provide a reason for reporting');
            return;
        }

        setReportLoading(true);
        try {
            await reviewsApi.reportReview(review._id, { reason: reportReason });
            showToast.success('Review reported successfully');
            setIsReportModalVisible(false);
            setReportReason('');
        } catch (error) {
            console.error('Report error:', error);
            showToast.error('Failed to report review');
        } finally {
            setReportLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            await reviewsApi.delete(review._id);
            showToast.success('Review deleted successfully');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Delete error:', error);
            showToast.error('Failed to delete review');
        }
    };

    const isOwnReview = user?.id === review.userId._id;
    const reviewerName = review.userId.firstName && review.userId.lastName
        ? `${review.userId.firstName} ${review.userId.lastName}`
        : review.userId.email || 'Anonymous User';

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
    };

    const reviewDate = formatDate(review.createdAt);

    return (
        <>
            <div className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            {review.userId.avatar ? (
                                <img
                                    src={review.userId.avatar}
                                    alt={reviewerName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-blue-600 font-semibold text-lg">
                                    {review.userId.firstName?.charAt(0) || ''}
                                    {review.userId.lastName?.charAt(0) || 'U'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-semibold text-gray-900">{reviewerName}</p>
                                <p className="text-sm text-gray-500">{reviewDate}</p>
                            </div>
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                            star <= review.rating
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Review Text */}
                        <p className="text-gray-700 leading-relaxed mb-3">{review.text}</p>

                        {/* Photos */}
                        {review.photos && review.photos.length > 0 && (
                            <div className="flex gap-2 mb-3 flex-wrap">
                                {review.photos.map((photo, index) => (
                                    <img
                                        key={index}
                                        src={photo}
                                        alt={`Review photo ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(photo, '_blank')}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 items-center">
                            <button
                                onClick={handleMarkHelpful}
                                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                    isHelpful ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
                                Helpful ({helpfulCount})
                            </button>

                            {isOwnReview && (
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            )}

                            {!isOwnReview && isAuthenticated && (
                                <button
                                    onClick={() => setIsReportModalVisible(true)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    <Flag className="w-4 h-4" />
                                    Report
                                </button>
                            )}
                        </div>

                        {/* Owner Reply */}
                        {showOwnerReply && review.ownerReply && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    <p className="font-semibold text-gray-900">Owner&apos;s Response</p>
                                </div>
                                <p className="text-gray-700">{review.ownerReply}</p>
                                {review.ownerReplyAt && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {formatDate(review.ownerReplyAt)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            <Modal
                open={isReportModalVisible}
                onClose={() => setIsReportModalVisible(false)}
                title="Report Review"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">Please provide a reason for reporting this review:</p>
                    <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="e.g., Inappropriate content, spam, false information..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setIsReportModalVisible(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReport}
                            disabled={reportLoading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {reportLoading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
