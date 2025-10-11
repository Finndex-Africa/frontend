"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import { ToastProvider } from "./components/ui/Toast";

// Simple role/auth context for Navbar links and conditional UI
type Role = "guest" | "seeker" | "landlord" | "provider" | "admin";
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
    const [role, setRole] = useState<Role>("guest");
    const [bookmarks, setBookmarks] = useState<string[]>([]);
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



