'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Service, UserRole } from '@/lib/api/types';
import { servicesService } from '@/lib/api/services';
import { motion } from 'framer-motion';
import {
  Wrench,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Plus,
  MapPin,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Redirect if not service provider
  useEffect(() => {
    if (!user) return;
    if (user.userType !== UserRole.SERVICE_PROVIDER) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadServices();
  }, [filter]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await servicesService.getMyServices(
        filter === 'all' ? undefined : filter
      );
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await servicesService.delete(id);
      setServices(services.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Failed to delete service:', err);
      alert('Failed to delete service. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
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

  if (user?.userType !== UserRole.SERVICE_PROVIDER) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">Manage your service offerings</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/services/new')}
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          Create New Service
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
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
      {!isLoading && services.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? "You haven't created any services yet."
              : `No ${filter} services found.`}
          </p>
          <button
            onClick={() => router.push('/dashboard/services/new')}
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            Create Your First Service
          </button>
        </div>
      )}

      {/* Services Grid */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wrench className="text-gray-400" size={48} />
                  </div>
                )}
                {service.badge && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {service.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="text-xs text-orange-600 font-semibold">
                      {service.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {service.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={16} className="mr-1" />
                      {service.location}
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star size={18} className="text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900">
                    {service.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-600 text-sm">
                    ({service.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-orange-500">
                    KSh {service.price.toLocaleString()}
                    <span className="text-sm text-gray-600 font-normal">
                      /{service.priceUnit}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      {service.views || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {service.bookings || 0}
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                {service.duration && (
                  <div className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                    Duration: {service.duration}
                  </div>
                )}

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {service.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{service.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/services/edit/${service._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
