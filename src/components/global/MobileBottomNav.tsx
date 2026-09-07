"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const HIDE_NAV_PREFIXES = ["/routes/login", "/routes/verify-email", "/forgot-password", "/reset-password"];

function IconDiscover({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function IconProperties({ active }: { active: boolean }) {
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

function IconBuySell({ active }: { active: boolean }) {
    const c = active ? "text-blue-600" : "text-gray-500";
    return (
        <svg className={`w-6 h-6 ${c}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
    const t = useTranslations("mobileNav");
    // usePathname from @/i18n/navigation strips the locale prefix, so these
    // comparisons keep working on both /en and /fr.
    const pathname = usePathname() || "";

    if (!pathname || HIDE_NAV_PREFIXES.some((p) => pathname.startsWith(p))) {
        return null;
    }

    const discoverActive = pathname === "/";
    const propertiesActive =
        pathname.startsWith("/routes/properties") || pathname.startsWith("/routes/property");
    const servicesActive =
        pathname.startsWith("/routes/services") || pathname.startsWith("/routes/service");
    const buySellActive =
        pathname.startsWith("/routes/buy-and-sell") || pathname.startsWith("/routes/my-listings");
    const profileActive =
        pathname.startsWith("/routes/profile") || pathname.startsWith("/routes/profile-view");

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom,0px)]"
            aria-label={t("primaryLabel")}
        >
            <div className="flex items-stretch justify-between h-16 px-1 max-w-lg mx-auto">
                <Link
                    href="/"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconDiscover active={discoverActive} />
                    <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${discoverActive ? "text-blue-600" : "text-gray-500"}`}>
                        {t("discover")}
                    </span>
                </Link>

                <Link
                    href="/routes/properties"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconProperties active={propertiesActive} />
                    <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${propertiesActive ? "text-blue-600" : "text-gray-500"}`}>
                        {t("properties")}
                    </span>
                </Link>

                <Link
                    href="/routes/services"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconBriefcase active={servicesActive} />
                    <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${servicesActive ? "text-blue-600" : "text-gray-500"}`}>
                        {t("services")}
                    </span>
                </Link>

                <Link
                    href="/routes/buy-and-sell"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconBuySell active={buySellActive} />
                    <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${buySellActive ? "text-blue-600" : "text-gray-500"}`}>
                        {t("buyAndSell")}
                    </span>
                </Link>

                <Link
                    href="/routes/profile"
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 py-1"
                >
                    <IconProfile active={profileActive} />
                    <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center ${profileActive ? "text-blue-600" : "text-gray-500"}`}>
                        {t("profile")}
                    </span>
                </Link>
            </div>
        </nav>
    );
}
