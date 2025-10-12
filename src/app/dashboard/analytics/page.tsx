'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/api/types';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Eye,
  DollarSign,
  Calendar,
  Building2,
  Wrench,
  Users,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// Mock data for charts - In production, this would come from the API
const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    month,
    views: Math.floor(Math.random() * 1000) + 500,
    inquiries: Math.floor(Math.random() * 100) + 50,
    revenue: Math.floor(Math.random() * 50000) + 20000,
  }));
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartData, setChartData] = useState(generateMockData());

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const stats = [
    {
      title: 'Total Views',
      value: '12,543',
      change: '+15.3%',
      isPositive: true,
      icon: Eye,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Inquiries',
      value: '487',
      change: '+8.2%',
      isPositive: true,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: 'KSh 245,000',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Conversion Rate',
      value: '3.9%',
      change: '-0.5%',
      isPositive: false,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const topPerformers = [
    {
      id: 1,
      title: 'Modern 2BR Apartment in Westlands',
      type: 'property',
      views: 1234,
      inquiries: 45,
      image: null,
    },
    {
      id: 2,
      title: 'Luxury Villa in Karen',
      type: 'property',
      views: 987,
      inquiries: 38,
      image: null,
    },
    {
      id: 3,
      title: 'Professional Plumbing Services',
      type: 'service',
      views: 876,
      inquiries: 32,
      image: null,
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your performance and insights
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as typeof timeRange)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.isPositive ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Views Over Time</h2>
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={data.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{data.month}</span>
                  <span className="font-semibold text-gray-900">{data.views}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.views / 1500) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-blue-500 h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h2>
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={data.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{data.month}</span>
                  <span className="font-semibold text-gray-900">
                    KSh {data.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.revenue / 70000) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-purple-500 h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Listings</h2>
        <div className="space-y-4">
          {topPerformers.map((item, index) => {
            const Icon = item.type === 'property' ? Building2 : Wrench;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Icon className="text-orange-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Views</p>
                    <p className="font-bold text-gray-900">{item.views}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Inquiries</p>
                    <p className="font-bold text-gray-900">{item.inquiries}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Traffic Sources</h2>
        <div className="space-y-4">
          {[
            { source: 'Direct', percentage: 45, color: 'bg-blue-500' },
            { source: 'Search Engines', percentage: 30, color: 'bg-green-500' },
            { source: 'Social Media', percentage: 15, color: 'bg-purple-500' },
            { source: 'Referrals', percentage: 10, color: 'bg-orange-500' },
          ].map((source, index) => (
            <div key={source.source} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{source.source}</span>
                <span className="font-semibold text-gray-900">{source.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${source.percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`${source.color} h-2 rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> This page displays mock data for
          demonstration purposes. In production, real analytics data will be fetched
          from the API and visualized using a charting library like Recharts.
        </p>
      </div>
    </div>
  );
}
