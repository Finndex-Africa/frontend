"use client";
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ToastProvider } from "./components/ui/Toast";

// Simple role/auth context for Navbar links and conditional UI
export type Role = "guest" | "seeker" | "landlord" | "provider" | "admin";
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
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                const roleMap: Record<string, Role> = {
                    admin: 'admin',
                    agent: 'admin',
                    landlord: 'landlord',
                    service_provider: 'provider',
                    home_seeker: 'seeker',
                };
                setRoleState(roleMap[userData.userType] || 'guest');
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }, []);

    // Wrapper to persist role when it changes
    const setRole = (r: Role) => {
        setRoleState(r);
        // If role is guest, clear storage
        if (r === 'guest') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
        }
    };

    const bookmarkApi = useMemo<BookmarkContextType>(() => ({
        bookmarks,
        toggle: (id) => setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
        has: (id) => bookmarks.includes(id),
    }), [bookmarks]);

    return (
        <AuthContext.Provider value={{ role, setRole }}>
            <BookmarkContext.Provider value={bookmarkApi}>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </BookmarkContext.Provider>
        </AuthContext.Provider>
    );
}



