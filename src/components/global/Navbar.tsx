"use client";
import Link from "next/link";
import Button from "../ui/Button";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import AdvertiseModal from '../modals/AdvertiseModal';
import { useAuth } from '@/providers';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3030';

export default function Navbar() {
    const [showAdvertiseModal, setShowAdvertiseModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { role, setRole } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [userName, setUserName] = useState('User');
    const menuRef = useRef<HTMLDivElement>(null);
    const links = [
        { href: "/", label: "Discover" },
        { href: "/routes/properties", label: "Homes" },
        { href: "/routes/services", label: "Services" },
    ];
    const router = useRouter();

    useEffect(() => {
        // Mark component as mounted to prevent hydration mismatch
        setIsMounted(true);
        // Check if user is logged in by checking for token in storage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
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
    }, [role]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Clear all auth data from frontend
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('authToken');
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
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            window.location.href = `${DASHBOARD_URL}/auth-transfer?token=${encodeURIComponent(token)}`;
        }
        setShowUserMenu(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
                <div className="container-app flex items-center justify-between h-16">
                    <Link href="/" className="font-extrabold text-xl flex items-center gap-2">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <Image
                                src="/images/logos/logo1.png"
                                alt="Hero"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        {links.map((l) => (
                            <Link key={l.href} href={l.href} className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="px-4"
                            onClick={() => setShowAdvertiseModal(true)}
                        >
                            Advertise
                        </Button>
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
                </div>
            </header>

            <AdvertiseModal
                open={showAdvertiseModal}
                onClose={() => setShowAdvertiseModal(false)}
            />
        </>
    );
}



