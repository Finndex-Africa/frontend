"use client";
import Link from "next/link";
import Image from "next/image";
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
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const { role, setRole } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [userName, setUserName] = useState('User');
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
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

        // Get user name and avatar
        if (user) {
            try {
                const userData = JSON.parse(user);
                setUserName(userData.firstName || 'User');
                setUserAvatar(userData.avatar || null);
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
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) &&
                mobileMenuButtonRef.current && !mobileMenuButtonRef.current.contains(event.target as Node)) {
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
            // Show modal with notification details
            setSelectedNotification(notification);
            setShowNotificationModal(true);
            setShowNotifications(false);

            // Mark as read if unread
            if (!notification.read) {
                await notificationsApi.markAsRead(notification._id);
                await fetchNotifications(); // Refresh notifications
            }
        } catch (error) {
            console.error('Failed to handle notification click:', error);
        }
    };

    const closeNotificationModal = () => {
        setShowNotificationModal(false);
        setSelectedNotification(null);
    };

    const getTypeIcon = (type: Notification['type']) => {
        const icons = {
            info: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            success: (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            warning: (
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            error: (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        };
        return icons[type];
    };

    const handleViewAllNotifications = () => {
        router.push('/routes/notifications');
        setShowNotifications(false);
    };

    return (
        <>
            <header className="fixed md:sticky top-0 left-0 right-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
                <div className="container-app flex items-center justify-between h-16 px-4">
                    <Link href="/" className="font-extrabold text-xl flex items-center gap-2">
                        <div className="relative" style={{ width: '160px', height: '45px' }}>
                            <Image
                                src="/images/logos/logo1.png"
                                alt="Finndex Africa Logo"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
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
                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''
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
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    {userAvatar ? (
                                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                            <Image
                                                src={userAvatar}
                                                alt={userName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-white font-medium pr-1">{userName}</span>
                                    <svg
                                        className={`w-4 h-4 text-white transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Info Header */}
                                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {userAvatar ? (
                                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                                                        <Image
                                                            src={userAvatar}
                                                            alt={userName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-bold text-lg border-2 border-white/30 shadow-lg">
                                                        {userName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{userName}</p>
                                                    <p className="text-blue-100 text-xs capitalize">
                                                        {role === 'home_seeker' ? 'Home Seeker' : role === 'provider' ? 'Service Provider' : role}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            {/* Admin: Dashboard */}
                                            {role === 'admin' && (
                                                <button
                                                    onClick={handleDashboardClick}
                                                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                    </svg>
                                                    Dashboard
                                                </button>
                                            )}

                                            {/* Home Seeker Menu */}
                                            {role === 'home_seeker' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/properties');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                        Browse Homes
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/bookings');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        My Bookings
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/messages');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                        Messages
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/notifications');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                        Notifications
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/profile');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Profile
                                                    </button>
                                                </>
                                            )}

                                            {/* Landlord Menu */}
                                            {role === 'landlord' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/my-listings');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                        My Listings
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/bookings');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Bookings
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/messages');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                        Messages
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/notifications');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                        Notifications
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/profile');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Profile
                                                    </button>
                                                </>
                                            )}

                                            {/* Service Provider Menu */}
                                            {role === 'provider' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/my-services');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        My Services
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/bookings');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Bookings
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/messages');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                        Messages
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/notifications');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                        Notifications
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.push('/routes/profile');
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-all duration-150"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Profile
                                                    </button>
                                                </>
                                            )}

                                            {role !== 'admin' && <div className="my-2 border-t border-gray-100"></div>}

                                            {/* Logout */}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-all duration-150 rounded-b-2xl"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Log out
                                            </button>
                                        </div>
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
                            ref={mobileMenuButtonRef}
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
                        <div className="px-4 py-3 space-y-3">
                            {/* Mobile Navigation Links */}
                            {links.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="block py-2 text-base font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 transition-colors text-left"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    {l.label}
                                </Link>
                            ))}

                            {/* Mobile Actions */}
                            <div className="pt-3 border-t border-gray-200 space-y-2">
                                <Button
                                    variant="ghost"
                                    className="w-full !justify-start"
                                    onClick={() => {
                                        setShowAdvertiseModal(true);
                                        setShowMobileMenu(false);
                                    }}
                                >
                                    Advertise
                                </Button>

                                {isMounted && isLoggedIn ? (
                                    <>
                                        <div className="px-3 py-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                                            {userAvatar ? (
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
                                                    <Image
                                                        src={userAvatar}
                                                        alt={userName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                                    {userName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">Hello, {userName}</p>
                                                <p className="text-xs text-gray-600 mt-0.5 capitalize">{role?.replace('_', ' ')}</p>
                                            </div>
                                        </div>

                                        {/* Admin: Dashboard */}
                                        {role === 'admin' && (
                                            <Button
                                                variant="ghost"
                                                className="w-full !justify-start"
                                                onClick={() => {
                                                    handleDashboardClick();
                                                    setShowMobileMenu(false);
                                                }}
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                                Dashboard
                                            </Button>
                                        )}

                                        {/* Home Seeker Menu */}
                                        {role === 'home_seeker' && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/properties');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                    </svg>
                                                    Browse Homes
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/bookings');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    My Bookings
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/messages');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                    Messages
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/notifications');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                    Notifications
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/profile');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profile
                                                </Button>
                                            </>
                                        )}

                                        {/* Landlord Menu */}
                                        {role === 'landlord' && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/my-listings');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                    </svg>
                                                    My Listings
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/bookings');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Bookings
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/messages');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                    Messages
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/notifications');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                    Notifications
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/profile');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profile
                                                </Button>
                                            </>
                                        )}

                                        {/* Service Provider Menu */}
                                        {role === 'provider' && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/my-services');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    My Services
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/bookings');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Bookings
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/messages');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                    Messages
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/notifications');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                    Notifications
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full !justify-start"
                                                    onClick={() => {
                                                        router.push('/routes/profile');
                                                        setShowMobileMenu(false);
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profile
                                                </Button>
                                            </>
                                        )}

                                        {/* Logout */}
                                        <Button
                                            variant="ghost"
                                            className="w-full !justify-start text-red-600 hover:bg-red-50"
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
                                        className="w-full !justify-start"
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

            {/* Notification Details Modal */}
            {showNotificationModal && selectedNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={closeNotificationModal}>
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-6 border-b border-gray-200">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {getTypeIcon(selectedNotification.type)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {selectedNotification.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {new Date(selectedNotification.createdAt).toLocaleString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeNotificationModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                    {selectedNotification.message}
                                </p>
                            </div>

                            {/* Type Badge */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">Type:</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${selectedNotification.type === 'success' ? 'bg-green-100 text-green-800' :
                                        selectedNotification.type === 'error' ? 'bg-red-100 text-red-800' :
                                            selectedNotification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={closeNotificationModal}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}



