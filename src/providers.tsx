"use client";
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { AuthService } from '@/services/auth.service';
import { logDebug } from '@/utils/persistentLogger';
import { ToastProvider } from "./components/ui/Toast";
import { AntdWarningSuppress } from "./components/AntdWarningSuppress";

// Simple role/auth context for Navbar links and conditional UI
export type Role = "guest" | "seeker" | "home_seeker" | "landlord" | "provider" | "admin";
type AuthContextType = { role: Role; setRole: (r: Role) => void };
const AuthContext = createContext<AuthContextType | null>(null);
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside Providers");
    return ctx;
}

// Bookmarks context for saving property ids locally
type BookmarkContextType = { bookmarks: string[]; toggle: (id: string) => void; has: (id: string) => boolean };
const BookmarkContext = createContext<BookmarkContextType | null>(null);
export function useBookmarks() {
    const ctx = useContext(BookmarkContext);
    if (!ctx) throw new Error("useBookmarks must be used inside Providers");
    return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<Role>("guest");
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    // Restore role from localStorage on mount
    useEffect(() => {
        // Ensure axios interceptors are set early if a token exists
        try {
            const auth = AuthService.getInstance();
            if (auth.getToken()) {
                auth.setupAxiosInterceptors();
                logDebug('Providers: axios interceptors setup from Providers on mount');
            }
        } catch {
            // ignore
        }

        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                const roleMap: Record<string, Role> = {
                    admin: 'admin',
                    agent: 'landlord',
                    landlord: 'landlord',
                    service_provider: 'provider',
                    home_seeker: 'home_seeker',
                };
                // Check both userType and role fields for compatibility
                const userRole = userData.userType || userData.role;
                setRoleState(roleMap[userRole] || 'guest');
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }, []);

    // Wrapper to persist role when it changes
    const setRole = (r: Role) => {
        setRoleState(r);
        // If role is guest, clear all auth storage
        if (r === 'guest') {
            localStorage.removeItem('token');
            localStorage.removeItem('authToken'); // legacy cleanup
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('authToken'); // legacy cleanup
            sessionStorage.removeItem('user');
        }
    };

    const bookmarkApi = useMemo<BookmarkContextType>(() => ({
        bookmarks,
        toggle: (id) => setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
        has: (id) => bookmarks.includes(id),
    }), [bookmarks]);

    return (
        <>
            <AntdWarningSuppress />
            <AuthContext.Provider value={{ role, setRole }}>
                <BookmarkContext.Provider value={bookmarkApi}>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </BookmarkContext.Provider>
            </AuthContext.Provider>
        </>
    );
}



