'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Property, Service } from '@/lib/api/types';
import { bookmarksService } from '@/lib/api/services';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Building2,
  Wrench,
  MapPin,
  Star,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookmarksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'services'>('properties');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookmarksService.getAll();
      setProperties(data.properties);
      setServices(data.services);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (itemType: string, itemId: string) => {
    if (!confirm('Remove this bookmark?')) return;

    try {
      await bookmarksService.remove(itemType, itemId);
      if (itemType === 'property') {
        setProperties(properties.filter((p) => p._id !== itemId));
      } else {
        setServices(services.filter((s) => s._id !== itemId));
      }
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      alert('Failed to remove bookmark. Please try again.');
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Saved Items</h1>
        <p className="text-gray-600 mt-1">
          Your bookmarked properties and services
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'properties'
                ? 'bg-orange-500 text-white'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Building2 size={20} />
            Properties ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-orange-500 text-white'
                : 'bg-transparent text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Wrench size={20} />
            Services ({services.length})
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <>
          {properties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Bookmark className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No saved properties
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring and save properties you like
              </p>
              <button
                onClick={() => router.push('/properties')}
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
              >
                <Building2 size={20} />
                Browse Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="text-gray-400" size={48} />
                      </div>
                    )}
                    {property.isPremium && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin size={14} className="mr-1" />
                      {property.location}
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {property.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({property.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xl font-bold text-orange-500">
                        KSh {property.price.toLocaleString()}
                        <span className="text-xs text-gray-600 font-normal">
                          /{property.priceUnit}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/properties/${property._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                      >
                        <ExternalLink size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveBookmark('property', property._id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {services.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Bookmark className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No saved services
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring and save services you like
              </p>
              <button
                onClick={() => router.push('/services')}
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
              >
                <Wrench size={20} />
                Browse Services
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
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
                  <div className="p-4">
                    <span className="text-xs text-orange-600 font-semibold">
                      {service.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {service.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin size={14} className="mr-1" />
                      {service.location}
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {service.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({service.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xl font-bold text-orange-500">
                        KSh {service.price.toLocaleString()}
                        <span className="text-xs text-gray-600 font-normal">
                          /{service.priceUnit}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/services/${service._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                      >
                        <ExternalLink size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveBookmark('service', service._id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
