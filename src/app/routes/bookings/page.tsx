'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { bookingsApi } from '@/services/api/bookings.api';
import { Booking, Service } from '@/types/dashboard';

export default function BookingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const isProvider = ['service_provider', 'landlord', 'agent'].includes(userRole);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            router.push('/routes/login');
            return;
        }

        // Get user role
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUserRole(userData.userType || userData.role || '');
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        fetchBookings();
    }, [router]);

    useEffect(() => {
        // Filter bookings based on status
        if (statusFilter === 'all') {
            setFilteredBookings(bookings);
        } else {
            setFilteredBookings(bookings.filter(b => b.status === statusFilter));
        }
    }, [statusFilter, bookings]);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching bookings...');
            const response = await bookingsApi.getAll({ limit: 100 });
            console.log('Bookings API response:', response);
            console.log('Response data:', response.data);

            // API returns { success: true, data: { data: [], pagination: {} } }
            // So we need response.data.data to get the actual bookings array
            const bookingsData = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
            console.log('Bookings array:', bookingsData);
            console.log('Total bookings:', bookingsData.length);

            setBookings(bookingsData);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            console.error('Error details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: Booking['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-indigo-100 text-indigo-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            rejected: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getServiceTitle = (booking: Booking) => {
        if (typeof booking.serviceId === 'object' && booking.serviceId !== null) {
            return (booking.serviceId as Service).title;
        }
        return 'Service';
    };

    const getServiceDescription = (booking: Booking) => {
        if (typeof booking.serviceId === 'object' && booking.serviceId !== null) {
            return (booking.serviceId as Service).description;
        }
        return '';
    };

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedBooking(null);
    };

    const handleConfirmBooking = async (bookingId: string) => {
        if (actionLoading) return;
        try {
            setActionLoading(bookingId);
            await bookingsApi.confirm(bookingId);
            toast.success('Booking confirmed successfully');
            await fetchBookings();
            setShowDetailsModal(false);
            setSelectedBooking(null);
        } catch (error: any) {
            console.error('Failed to confirm booking:', error);
            toast.error(error?.response?.data?.message || 'Failed to confirm booking');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectBooking = async (bookingId: string) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        if (actionLoading) return;
        try {
            setActionLoading(bookingId);
            await bookingsApi.reject(bookingId, reason);
            toast.success('Booking rejected');
            await fetchBookings();
            setShowDetailsModal(false);
            setSelectedBooking(null);
        } catch (error: any) {
            console.error('Failed to reject booking:', error);
            toast.error(error?.response?.data?.message || 'Failed to reject booking');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        const reason = prompt('Please provide a reason for cancellation:');
        if (!reason) return;
        if (actionLoading) return;
        try {
            setActionLoading(bookingId);
            await bookingsApi.cancel(bookingId, reason);
            toast.success('Booking cancelled');
            await fetchBookings();
            setShowDetailsModal(false);
            setSelectedBooking(null);
        } catch (error: any) {
            console.error('Failed to cancel booking:', error);
            toast.error(error?.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster position="top-right" />
            <div className="container-app px-4 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="mt-2 text-gray-600">View and manage your service bookings</p>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex space-x-8">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    statusFilter === status
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                {status === 'all' && ` (${bookings.length})`}
                                {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">
                            {statusFilter === 'all' ? 'No bookings yet' : `No ${statusFilter} bookings`}
                        </h3>
                        <p className="mt-2 text-gray-600">
                            {statusFilter === 'all'
                                ? 'Book a service to see your bookings here'
                                : `You don't have any ${statusFilter} bookings`}
                        </p>
                        {statusFilter === 'all' && (
                            <button
                                onClick={() => router.push('/routes/services')}
                                className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Services
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div key={booking._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {getServiceTitle(booking)}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{new Date(booking.scheduledDate).toLocaleDateString()} - {booking.duration}h duration</span>
                                            </div>
                                            {booking.serviceLocation && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{booking.serviceLocation}</span>
                                                </div>
                                            )}
                                            {booking.notes && (
                                                <div className="flex items-start gap-2">
                                                    <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                    </svg>
                                                    <span className="flex-1">{booking.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right ml-6">
                                        <div className="text-2xl font-bold text-gray-900">${booking.totalPrice}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Payment: {booking.paymentStatus}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(booking)}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                                    {selectedBooking.status.replace('_', ' ')}
                                </span>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Service Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{getServiceTitle(selectedBooking)}</p>
                                            {getServiceDescription(selectedBooking) && (
                                                <p className="text-sm text-gray-600 mt-1">{getServiceDescription(selectedBooking)}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">${selectedBooking.totalPrice}</p>
                                            <p className="text-sm text-gray-500">Total Price</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                                            <p className="text-gray-900">{new Date(selectedBooking.scheduledDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Duration</p>
                                            <p className="text-gray-900">{selectedBooking.duration} hour{selectedBooking.duration > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>

                                    {selectedBooking.serviceLocation && (
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Location</p>
                                                <p className="text-gray-900">{selectedBooking.serviceLocation}</p>
                                                {selectedBooking.serviceAddress && (
                                                    <p className="text-sm text-gray-600">{selectedBooking.serviceAddress}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Payment Status</p>
                                            <p className="text-gray-900 capitalize">{selectedBooking.paymentStatus}</p>
                                        </div>
                                    </div>

                                    {selectedBooking.contactPhone && (
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                                                <p className="text-gray-900">{selectedBooking.contactPhone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedBooking.notes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700">{selectedBooking.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Booked on</p>
                                        <p className="text-gray-900 font-medium">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    {selectedBooking.updatedAt && (
                                        <div>
                                            <p className="text-gray-500">Last updated</p>
                                            <p className="text-gray-900 font-medium">{new Date(selectedBooking.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Close
                            </button>
                            {selectedBooking.status === 'pending' && isProvider && (
                                <>
                                    <button
                                        onClick={() => handleRejectBooking(selectedBooking._id)}
                                        disabled={actionLoading === selectedBooking._id}
                                        className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {actionLoading === selectedBooking._id ? 'Processing...' : 'Reject'}
                                    </button>
                                    <button
                                        onClick={() => handleConfirmBooking(selectedBooking._id)}
                                        disabled={actionLoading === selectedBooking._id}
                                        className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {actionLoading === selectedBooking._id ? 'Processing...' : 'Confirm'}
                                    </button>
                                </>
                            )}
                            {selectedBooking.status === 'pending' && !isProvider && (
                                <button
                                    onClick={() => handleCancelBooking(selectedBooking._id)}
                                    disabled={actionLoading === selectedBooking._id}
                                    className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {actionLoading === selectedBooking._id ? 'Cancelling...' : 'Cancel Booking'}
                                </button>
                            )}
                            {selectedBooking.status === 'confirmed' && (
                                <button
                                    onClick={() => handleCancelBooking(selectedBooking._id)}
                                    disabled={actionLoading === selectedBooking._id}
                                    className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {actionLoading === selectedBooking._id ? 'Cancelling...' : 'Cancel Booking'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
