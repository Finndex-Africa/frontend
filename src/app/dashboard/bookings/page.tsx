'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, PaginationResult, UserRole } from '@/lib/api/types';
import { bookingsService } from '@/lib/api/services';
import { motion } from 'framer-motion';
import { Calendar, Clock, Phone, MapPin, User, Check, X } from 'lucide-react';

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const isProvider = user?.userType === UserRole.SERVICE_PROVIDER;

  useEffect(() => {
    loadBookings();
  }, [filter, pagination.currentPage]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data: PaginationResult<Booking> = await bookingsService.getMyBookings(
        pagination.currentPage,
        20,
        filter === 'all' ? undefined : filter
      );
      setBookings(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      setUpdatingStatus(bookingId);
      const updatedBooking = await bookingsService.updateStatus(bookingId, status);
      setBookings(
        bookings.map((b) => (b._id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      console.error('Failed to update booking status:', err);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page });
  };

  if (isLoading && bookings.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">
          {isProvider ? 'Service Bookings' : 'My Bookings'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isProvider
            ? 'Manage your service appointments and bookings'
            : 'View and manage your service bookings'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
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
      {!isLoading && bookings.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? isProvider
                ? "You don't have any bookings yet."
                : "You haven't made any bookings yet."
              : `No ${filter} bookings found.`}
          </p>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {booking.serviceId.title}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-gray-600">{booking.serviceId.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-500">
                    KSh {booking.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-gray-500" />
                    <span className="text-sm">
                      {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-gray-500" />
                    <span className="text-sm">{booking.duration} hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={18} className="text-gray-500" />
                    <span className="text-sm">{booking.contactPhone}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User size={18} className="text-gray-500" />
                    <span className="text-sm">
                      {isProvider
                        ? `Client: ${booking.userId.name || booking.userId.email}`
                        : `Provider: ${booking.providerId.name || booking.providerId.email}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={18} className="text-gray-500" />
                    <span className="text-sm">{booking.serviceId.location}</span>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Notes:</span> {booking.notes}
                  </p>
                </div>
              )}

              {/* Actions (Provider Only) */}
              {isProvider && booking.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                    disabled={updatingStatus === booking._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus === booking._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check size={18} />
                        Confirm
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                    disabled={updatingStatus === booking._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus === booking._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <X size={18} />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              )}

              {isProvider && booking.status === 'confirmed' && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleUpdateStatus(booking._id, 'completed')}
                    disabled={updatingStatus === booking._id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus === booking._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check size={18} />
                        Mark as Completed
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
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
