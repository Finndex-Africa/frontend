"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, type Role } from "@/providers";

const HIDE_NAV_PREFIXES = ["/routes/login", "/routes/verify-email", "/forgot-password", "/reset-password"];

function secondaryForRole(role: Role): { label: string; href: string } {
    if (role === "landlord") {
        return { label: "My Listings", href: "/routes/my-listings" };
    }
    if (role === "provider") {
        return { label: "My Services", href: "/routes/my-services" };
    }
    return { label: "Browse", href: "/routes/properties" };
}

function isSecondaryActive(pathname: string, href: string): boolean {
    if (href === "/routes/properties") {
        return (
            pathname.startsWith("/routes/properties") ||
            pathname.startsWith("/routes/property")
        );
    }
    if (href === "/routes/my-listings") {
        return pathname.startsWith("/routes/my-listings");
    }
    if (href === "/routes/my-services") {
        return pathname.startsWith("/routes/my-services");
    }
    return false;
}

function IconHome({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function IconSearch({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

function IconListings({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    );
}

function IconBriefcase({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

function IconCalendar({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function IconMessages({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
    );
}

function IconProfile({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

export default function MobileBottomNav() {
    const pathname = usePathname() || "";
    const { role } = useAuth();
    const secondary = secondaryForRole(role);

    if (!pathname || HIDE_NAV_PREFIXES.some((p) => pathname.startsWith(p))) {
        return null;
    }

    const homeActive = pathname === "/";
    const secActive = isSecondaryActive(pathname, secondary.href);
    const bookingsActive = pathname.startsWith("/routes/bookings");
    const messagesActive = pathname.startsWith("/routes/messages") || pathname.startsWith("/chat");
    const profileActive =
        pathname.startsWith("/routes/profile") || pathname.startsWith("/routes/profile-view");

    const secIcon =
        secondary.href === "/routes/my-listings" ? (
            <IconListings active={secActive} />
        ) : secondary.href === "/routes/my-services" ? (
            <IconBriefcase active={secActive} />
        ) : (
            <IconSearch active={secActive} />
        );

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom,0px)]"
            aria-label="Primary"
        >
            <div className="flex items-stretch justify-between h-16 px-1 max-w-lg mx-auto">
                <Link
                    href="/"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconHome active={homeActive} />
                    <span
                        className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${
                            homeActive ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                        Home
                    </span>
                </Link>

                <Link
                    href={secondary.href}
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    {secIcon}
                    <span
                        className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${
                            secActive ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                        {secondary.label}
                    </span>
                </Link>

                <Link
                    href="/routes/bookings"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconCalendar active={bookingsActive} />
                    <span
                        className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${
                            bookingsActive ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                        Bookings
                    </span>
                </Link>

                <Link
                    href="/routes/messages"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconMessages active={messagesActive} />
                    <span
                        className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${
                            messagesActive ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                        Messages
                    </span>
                </Link>

                <Link
                    href="/routes/profile"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconProfile active={profileActive} />
                    <span
                        className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${
                            profileActive ? "text-blue-600" : "text-gray-500"
                        }`}
                    >
                        Profile
                    </span>
                </Link>
            </div>
        </nav>
    );
}
