'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Wrench,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  BookmarkIcon,
  Calendar,
  BarChart3,
  Users,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/api/types';
import { notificationsService } from '@/lib/api/services';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      notificationsService.getUnreadCount()
        .then(setNotificationCount)
        .catch(console.error);
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getNavItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
      { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', badge: notificationCount },
      { icon: User, label: 'Profile', href: '/dashboard/profile' },
    ];

    if (user.userType === UserRole.ADMIN) {
      return [
        { icon: ShieldCheck, label: 'Admin Dashboard', href: '/dashboard' },
        { icon: Users, label: 'Users', href: '/dashboard/users' },
        { icon: Building2, label: 'Properties', href: '/dashboard/properties' },
        { icon: Wrench, label: 'Services', href: '/dashboard/services' },
        { icon: ShieldCheck, label: 'Verifications', href: '/dashboard/verifications' },
        ...baseItems.slice(1),
      ];
    }

    if (user.userType === UserRole.LANDLORD || user.userType === UserRole.AGENT) {
      return [
        ...baseItems.slice(0, 1),
        { icon: Building2, label: 'My Properties', href: '/dashboard/properties' },
        { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
        ...baseItems.slice(1),
      ];
    }

    if (user.userType === UserRole.SERVICE_PROVIDER) {
      return [
        ...baseItems.slice(0, 1),
        { icon: Wrench, label: 'My Services', href: '/dashboard/services' },
        { icon: Calendar, label: 'Bookings', href: '/dashboard/bookings' },
        { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
        ...baseItems.slice(1),
      ];
    }

    // Home Seeker
    return [
      ...baseItems.slice(0, 1),
      { icon: BookmarkIcon, label: 'Saved Items', href: '/dashboard/bookmarks' },
      { icon: Calendar, label: 'My Bookings', href: '/dashboard/bookings' },
      { icon: Home, label: 'Browse Properties', href: '/properties' },
      { icon: Wrench, label: 'Browse Services', href: '/services' },
      ...baseItems.slice(1),
    ];
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/dashboard" className="text-xl font-bold text-orange-500">
          Finndex
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-gray-200">
              <Link href="/" className="text-2xl font-bold text-orange-500">
                Finndex
              </Link>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.userType.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative
                      ${isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="px-3 py-4 border-t border-gray-200 space-y-1">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings size={20} />
                <span className="font-medium">Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
