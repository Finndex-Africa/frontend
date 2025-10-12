'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PaginationResult, UserRole } from '@/lib/api/types';
import { adminService, VerificationItem } from '@/lib/api/services';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Building2,
  Wrench,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  // Redirect if not admin
  useEffect(() => {
    if (!user) return;
    if (user.userType !== UserRole.ADMIN) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadVerifications();
  }, [filter, pagination.currentPage]);

  const loadVerifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data: PaginationResult<VerificationItem> = await adminService.getVerifications(
        filter === 'all' ? undefined : filter,
        pagination.currentPage,
        20
      );
      setVerifications(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load verifications:', err);
      setError('Failed to load verifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (item: VerificationItem) => {
    if (!confirm(`Approve this ${item.type}?`)) return;

    try {
      setProcessingId(item._id);
      if (item.type === 'property') {
        await adminService.verifyProperty(item._id, 'approve');
      } else if (item.type === 'service_provider') {
        await adminService.verifyServiceProvider(item._id, 'approve');
      }
      setVerifications(verifications.filter((v) => v._id !== item._id));
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('Failed to approve. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: VerificationItem) => {
    const reason = rejectReason[item._id];
    if (!reason || !reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!confirm(`Reject this ${item.type}?`)) return;

    try {
      setProcessingId(item._id);
      if (item.type === 'property') {
        await adminService.verifyProperty(item._id, 'reject', reason);
      } else if (item.type === 'service_provider') {
        await adminService.verifyServiceProvider(item._id, 'reject', reason);
      }
      setVerifications(verifications.filter((v) => v._id !== item._id));
      setRejectReason({ ...rejectReason, [item._id]: '' });
    } catch (err) {
      console.error('Failed to reject:', err);
      alert('Failed to reject. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'property':
        return Building2;
      case 'service_provider':
        return Wrench;
      default:
        return AlertCircle;
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page });
  };

  if (user?.userType !== UserRole.ADMIN) {
    return null;
  }

  if (isLoading && verifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verifications</h1>
        <p className="text-gray-600 mt-1">
          Review and approve pending properties and service providers
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          {['all', 'property', 'service_provider'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all'
                ? 'All'
                : type === 'property'
                ? 'Properties'
                : 'Service Providers'}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && verifications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No pending verifications
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'All items have been reviewed.'
              : `No pending ${
                  filter === 'property' ? 'properties' : 'service providers'
                } to review.`}
          </p>
        </div>
      )}

      {/* Verifications List */}
      {verifications.length > 0 && (
        <div className="space-y-4">
          {verifications.map((item, index) => {
            const Icon = getItemIcon(item.type);

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                    <Icon size={24} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">
                            {item.title}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                            {item.type === 'property' ? 'Property' : 'Service Provider'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={16} />
                            {item.owner.name || item.owner.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    {Object.keys(item.details).length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Details:
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {Object.entries(item.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>{' '}
                              {String(value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (if rejecting)
                      </label>
                      <textarea
                        value={rejectReason[item._id] || ''}
                        onChange={(e) =>
                          setRejectReason({
                            ...rejectReason,
                            [item._id]: e.target.value,
                          })
                        }
                        placeholder="Enter reason for rejection..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={processingId === item._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === item._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        disabled={processingId === item._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === item._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <XCircle size={18} />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
