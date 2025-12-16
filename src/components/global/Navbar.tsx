"use client";
import Link from "next/link";
import Button from "../ui/Button";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import AdvertiseModal from '../modals/AdvertiseModal';
import { useAuth } from '@/providers';
import { notificationsApi } from '@/services/api/notifications.api';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3030';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    link?: string;
    createdAt: string;
}

export default function Navbar() {
    const [showAdvertiseModal, setShowAdvertiseModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { role, setRole } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [userName, setUserName] = useState('User');
    const menuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const links = [
        { href: "/", label: "Discover" },
        { href: "/routes/properties", label: "Homes" },
        { href: "/routes/services", label: "Services" },
    ];
    const router = useRouter();

    useEffect(() => {
        // Mark component as mounted to prevent hydration mismatch
        setIsMounted(true);
        // Check if user is logged in by checking for token in storage (use consistent 'token' key)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        setIsLoggedIn(!!token && role !== 'guest');

        // Get user name
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserName(userData.firstName || 'User');
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        // Fetch notifications if logged in
        if (token && role !== 'guest') {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [role]);

    const fetchNotifications = async () => {
        try {
            const response = await notificationsApi.getAll({
                limit: 5,
                page: 1
            });

            const notificationsData = response?.data?.data || response?.data || [];

            if (!Array.isArray(notificationsData)) {
                console.error('Invalid notifications data format:', notificationsData);
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            setNotifications(notificationsData);
            setUnreadCount(notificationsData.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setShowMobileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Clear all auth data from frontend
        localStorage.removeItem('token');
        localStorage.removeItem('authToken'); // legacy cleanup
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('authToken'); // legacy cleanup
        sessionStorage.removeItem('user');
        setRole('guest');
        setShowUserMenu(false);

        // Also clear auth data from dashboard by opening it briefly
        // This ensures both apps are logged out
        const logoutWindow = window.open(`${DASHBOARD_URL}/auth-transfer?logout=true`, '_blank');
        setTimeout(() => {
            if (logoutWindow) {
                logoutWindow.close();
            }
        }, 500);

        router.push('/');
    };

    const handleDashboardClick = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            window.location.href = `${DASHBOARD_URL}/auth-transfer?token=${encodeURIComponent(token)}`;
        }
        setShowUserMenu(false);
    };

    const handleNotificationClick = async (notification: Notification) => {
        try {
            // Mark as read if unread
            if (!notification.read) {
                await notificationsApi.markAsRead(notification._id);
                await fetchNotifications(); // Refresh notifications
            }

            // Navigate to link if provided
            if (notification.link) {
                if (notification.link.startsWith('http')) {
                    window.location.href = notification.link;
                } else {
                    router.push(notification.link);
                }
            }

            setShowNotifications(false);
        } catch (error) {
            console.error('Failed to handle notification click:', error);
        }
    };

    const handleViewAllNotifications = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            window.location.href = `${DASHBOARD_URL}/auth-transfer?token=${encodeURIComponent(token)}&redirect=/notifications`;
        }
        setShowNotifications(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
                <div className="container-app flex items-center justify-between h-16 px-4">
                    <Link href="/" className="font-extrabold text-xl flex items-center gap-2">
                        <img
                            src="/images/logos/logo1.png"
                            alt="Finndex Africa Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                            style={{ width: 'auto', height: '48px' }}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {links.map((l) => (
                            <Link key={l.href} href={l.href} className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="px-4"
                            onClick={() => setShowAdvertiseModal(true)}
                        >
                            Advertise
                        </Button>
                        {isMounted && isLoggedIn && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        </div>
                                        {!notifications || notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-500">
                                                <svg
                                                    className="w-12 h-12 mx-auto mb-2 text-gray-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                                    />
                                                </svg>
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        ) : (
                                            <>
                                                {notifications.map((notification) => (
                                                    <button
                                                        key={notification._id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                                            !notification.read ? 'bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm text-gray-900 truncate">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {new Date(notification.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={handleViewAllNotifications}
                                                    className="w-full px-4 py-2 text-sm text-center text-blue-600 hover:bg-blue-50 font-medium"
                                                >
                                                    View All Notifications
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {!isMounted ? (
                            <Button
                                variant="primary"
                                className="px-4"
                                onClick={() => router.push('/routes/login')}
                            >
                                Sign In
                            </Button>
                        ) : isLoggedIn ? (
                            <div className="relative" ref={menuRef}>
                                <Button
                                    variant="primary"
                                    className="px-4 flex items-center gap-2"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <span>{userName}</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </Button>
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <button
                                            onClick={handleDashboardClick}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                            Dashboard
                                        </button>
                                        <hr className="my-1 border-gray-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                className="px-4"
                                onClick={() => router.push('/routes/login')}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        {isMounted && isLoggedIn && (
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showMobileMenu ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 bg-white">
                        <div className="container-app px-4 py-3 space-y-3">
                            {/* Mobile Navigation Links */}
                            {links.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="block py-2 text-base font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 transition-colors"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    {l.label}
                                </Link>
                            ))}

                            {/* Mobile Actions */}
                            <div className="pt-3 border-t border-gray-200 space-y-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-center"
                                    onClick={() => {
                                        setShowAdvertiseModal(true);
                                        setShowMobileMenu(false);
                                    }}
                                >
                                    Advertise
                                </Button>

                                {isMounted && isLoggedIn ? (
                                    <>
                                        <div className="px-3 py-2 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-900">Hello, {userName}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() => {
                                                handleDashboardClick();
                                                setShowMobileMenu(false);
                                            }}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                            Dashboard
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                handleLogout();
                                                setShowMobileMenu(false);
                                            }}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="primary"
                                        className="w-full justify-center"
                                        onClick={() => {
                                            router.push('/routes/login');
                                            setShowMobileMenu(false);
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Notifications Dropdown */}
                {isMounted && isLoggedIn && showNotifications && (
                    <div className="md:hidden fixed inset-x-0 top-16 mx-4 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[70vh] overflow-y-auto">
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            <button
                                onClick={() => setShowNotifications(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {!notifications || notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <>
                                {notifications.map((notification) => (
                                    <button
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 truncate">{notification.title}</p>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                                <button
                                    onClick={handleViewAllNotifications}
                                    className="w-full px-4 py-3 text-sm text-center text-blue-600 hover:bg-blue-50 font-medium"
                                >
                                    View All Notifications
                                </button>
                            </>
                        )}
                    </div>
                )}
            </header>

            <AdvertiseModal
                open={showAdvertiseModal}
                onClose={() => setShowAdvertiseModal(false)}
            />
        </>
    );
}



