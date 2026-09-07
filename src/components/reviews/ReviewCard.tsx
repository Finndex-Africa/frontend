'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Star, ThumbsUp, Flag, Trash2, MessageSquare } from 'lucide-react';
import { Review, reviewsApi } from '@/services/api/reviews.api';
import { AuthService } from '@/services/auth.service';
import { showToast } from '@/lib/toast';
import Modal from '@/components/ui/Modal';
import TranslatedText from '@/components/ui/TranslatedText';
import { useTranslatedFields } from '@/lib/translated-content';

interface ReviewCardProps {
    review: Review;
    onUpdate?: () => void;
    showOwnerReply?: boolean;
}

const REVIEW_TEXT_FIELDS = ['text', 'ownerReply'] as const;

export default function ReviewCard({ review, onUpdate, showOwnerReply = true }: ReviewCardProps) {
    const t = useTranslations('reviews');
    const locale = useLocale();
    // Airbnb translates both the review body and the host's response.
    const translated = useTranslatedFields(review, REVIEW_TEXT_FIELDS);
    const authService = AuthService.getInstance();
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();

    const [isHelpful, setIsHelpful] = useState((review.helpfulBy ?? []).includes(user?.id || ''));
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    const handleMarkHelpful = async () => {
        if (!isAuthenticated || !user) {
            showToast.warning(t('loginToMarkHelpful'));
            return;
        }

        try {
            await reviewsApi.markAsHelpful(review._id);
            setIsHelpful(!isHelpful);
            setHelpfulCount(isHelpful ? helpfulCount - 1 : helpfulCount + 1);
            showToast.success(isHelpful ? t('removedFromHelpful') : t('markedAsHelpful'));
        } catch (error) {
            console.error('Mark helpful error:', error);
            showToast.error(t('markHelpfulFailed'));
        }
    };

    const handleReport = async () => {
        if (!reportReason.trim()) {
            showToast.warning(t('reportReasonRequired'));
            return;
        }

        setReportLoading(true);
        try {
            await reviewsApi.reportReview(review._id, { reason: reportReason });
            showToast.success(t('reportSuccess'));
            setIsReportModalVisible(false);
            setReportReason('');
        } catch (error) {
            console.error('Report error:', error);
            showToast.error(t('reportFailed'));
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
            showToast.success(t('deleteSuccess'));
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Delete error:', error);
            showToast.error(t('deleteFailed'));
        }
    };

    const userId = review.userId ?? null;
    const isOwnReview = user?.id === userId?._id;
    const reviewerName = userId?.firstName && userId?.lastName
        ? `${userId.firstName} ${userId.lastName}`
        : userId?.email || t('anonymousUser');

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Intl handles the plural + wording per locale, so no catalog keys needed.
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        if (diffDays < 7) return rtf.format(-diffDays, 'day');
        if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), 'week');
        if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), 'month');
        return rtf.format(-Math.floor(diffDays / 365), 'year');
    };

    const reviewDate = formatDate(review.createdAt);

    return (
        <>
            <div className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="relative w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            {userId?.avatar ? (
                                <Image
                                    src={userId.avatar}
                                    alt={reviewerName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-blue-600 font-semibold text-lg">
                                    {userId?.firstName?.charAt(0) || ''}
                                    {userId?.lastName?.charAt(0) || 'U'}
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
                        <TranslatedText
                            text={translated.text}
                            className="text-gray-700 leading-relaxed"
                            disclosureClassName="mb-3"
                        />

                        {/* Photos */}
                        {review.photos && review.photos.length > 0 && (
                            <div className="flex gap-2 mb-3 flex-wrap">
                                {review.photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="relative w-24 h-24 rounded-lg cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                                        onClick={() => window.open(photo, '_blank')}
                                    >
                                        <Image
                                            src={photo}
                                            alt={`Review photo ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
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
                                {t('helpfulCount', { count: helpfulCount })}
                            </button>

                            {isOwnReview && (
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t('delete')}
                                </button>
                            )}

                            {!isOwnReview && isAuthenticated && (
                                <button
                                    onClick={() => setIsReportModalVisible(true)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    <Flag className="w-4 h-4" />
                                    {t('report')}
                                </button>
                            )}
                        </div>

                        {/* Owner Reply */}
                        {showOwnerReply && review.ownerReply && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    <p className="font-semibold text-gray-900">{t('ownersResponse')}</p>
                                </div>
                                <TranslatedText
                                    text={translated.ownerReply}
                                    className="text-gray-700"
                                />
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
                title={t('reportReview')}
            >
                <div className="space-y-4">
                    <p className="text-gray-700">Please provide a reason for reporting this review:</p>
                    <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder={t('reportPlaceholder')}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setIsReportModalVisible(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleReport}
                            disabled={reportLoading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {reportLoading ? t('submitting') : t('submitReport')}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
