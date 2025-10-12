'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, DashboardStats } from '@/lib/api/types';
import { dashboardService, adminService } from '@/lib/api/services';
import {
  TrendingUp,
  Building2,
  Wrench,
  MessageSquare,
  Eye,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      if (user?.userType === UserRole.ADMIN) {
        const data = await adminService.getDashboard();
        setStats(data);
      } else {
        const data = await dashboardService.getStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatsCards = () => {
    if (!stats) return [];

    if (user?.userType === UserRole.ADMIN) {
      return [
        {
          title: 'Total Users',
          value: stats.totalUsers || 0,
          icon: Users,
          color: 'bg-blue-500',
          trend: '+12%',
        },
        {
          title: 'Properties',
          value: stats.totalProperties || 0,
          icon: Building2,
          color: 'bg-green-500',
          trend: '+8%',
        },
        {
          title: 'Service Providers',
          value: stats.totalServiceProviders || 0,
          icon: Wrench,
          color: 'bg-purple-500',
          trend: '+15%',
        },
        {
          title: 'Pending Verifications',
          value: stats.pendingVerifications || 0,
          icon: AlertCircle,
          color: 'bg-orange-500',
          trend: '-5%',
        },
      ];
    }

    if (user?.userType === UserRole.LANDLORD || user?.userType === UserRole.AGENT) {
      return [
        {
          title: 'Active Listings',
          value: stats.activeListings || 0,
          icon: Building2,
          color: 'bg-blue-500',
        },
        {
          title: 'Total Views',
          value: stats.revenue || 0, // Using revenue field temporarily for views
          icon: Eye,
          color: 'bg-green-500',
        },
        {
          title: 'Messages',
          value: stats.unreadMessages || 0,
          icon: MessageSquare,
          color: 'bg-purple-500',
        },
        {
          title: 'Inquiries',
          value: stats.bookings || 0,
          icon: TrendingUp,
          color: 'bg-orange-500',
        },
      ];
    }

    if (user?.userType === UserRole.SERVICE_PROVIDER) {
      return [
        {
          title: 'Active Services',
          value: stats.activeListings || 0,
          icon: Wrench,
          color: 'bg-blue-500',
        },
        {
          title: 'Total Bookings',
          value: stats.bookings || 0,
          icon: Calendar,
          color: 'bg-green-500',
        },
        {
          title: 'Revenue',
          value: `KSh ${(stats.revenue || 0).toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-purple-500',
        },
        {
          title: 'Messages',
          value: stats.unreadMessages || 0,
          icon: MessageSquare,
          color: 'bg-orange-500',
        },
      ];
    }

    // Home Seeker
    return [
      {
        title: 'Saved Properties',
        value: stats.savedProperties || 0,
        icon: Building2,
        color: 'bg-blue-500',
      },
      {
        title: 'Saved Services',
        value: stats.savedServices || 0,
        icon: Wrench,
        color: 'bg-green-500',
      },
      {
        title: 'Active Bookings',
        value: stats.bookings || 0,
        icon: Calendar,
        color: 'bg-purple-500',
      },
      {
        title: 'Messages',
        value: stats.unreadMessages || 0,
        icon: MessageSquare,
        color: 'bg-orange-500',
      },
    ];
  };

  const statsCards = getStatsCards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  {card.trend && (
                    <p className={`text-sm mt-2 ${card.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend} from last month
                    </p>
                  )}
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.userType === UserRole.ADMIN && (
            <>
              <QuickActionButton
                href="/dashboard/verifications"
                icon={CheckCircle}
                label="Review Verifications"
                description="Approve pending items"
              />
              <QuickActionButton
                href="/dashboard/users"
                icon={Users}
                label="Manage Users"
                description="View all platform users"
              />
              <QuickActionButton
                href="/dashboard/properties"
                icon={Building2}
                label="All Properties"
                description="Browse all listings"
              />
            </>
          )}

          {(user?.userType === UserRole.LANDLORD || user?.userType === UserRole.AGENT) && (
            <>
              <QuickActionButton
                href="/dashboard/properties/new"
                icon={Building2}
                label="Add Property"
                description="List a new property"
              />
              <QuickActionButton
                href="/dashboard/properties"
                icon={Eye}
                label="View Properties"
                description="Manage your listings"
              />
              <QuickActionButton
                href="/dashboard/analytics"
                icon={TrendingUp}
                label="View Analytics"
                description="Track performance"
              />
            </>
          )}

          {user?.userType === UserRole.SERVICE_PROVIDER && (
            <>
              <QuickActionButton
                href="/dashboard/services/new"
                icon={Wrench}
                label="Add Service"
                description="Create new service"
              />
              <QuickActionButton
                href="/dashboard/bookings"
                icon={Calendar}
                label="View Bookings"
                description="Manage appointments"
              />
              <QuickActionButton
                href="/dashboard/services"
                icon={Eye}
                label="My Services"
                description="Manage your services"
              />
            </>
          )}

          {user?.userType === UserRole.HOME_SEEKER && (
            <>
              <QuickActionButton
                href="/properties"
                icon={Building2}
                label="Browse Properties"
                description="Find your next home"
              />
              <QuickActionButton
                href="/services"
                icon={Wrench}
                label="Browse Services"
                description="Find home services"
              />
              <QuickActionButton
                href="/dashboard/bookmarks"
                icon={Building2}
                label="Saved Items"
                description="View saved properties"
              />
            </>
          )}

          <QuickActionButton
            href="/dashboard/messages"
            icon={MessageSquare}
            label="Messages"
            description="Check your inbox"
            badge={stats?.unreadMessages}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem
            icon={CheckCircle}
            title="Account verified"
            description="Your account has been verified successfully"
            time="2 hours ago"
            color="text-green-600"
          />
          <ActivityItem
            icon={MessageSquare}
            title="New message received"
            description="You have a new inquiry about your property"
            time="5 hours ago"
            color="text-blue-600"
          />
          <ActivityItem
            icon={Building2}
            title="Property viewed"
            description="Your listing was viewed 12 times today"
            time="1 day ago"
            color="text-purple-600"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
  description,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  badge?: number;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group relative"
    >
      <div className="p-2 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {badge && badge > 0 ? (
        <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
          {badge}
        </span>
      ) : null}
    </a>
  );
}

function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={20} className={color} />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
