import { ShieldCheck } from "lucide-react";

function BannerIllustration() {
    return (
        <svg
            viewBox="0 0 200 80"
            className="h-[4.5rem] w-[11rem] sm:h-20 sm:w-48"
            fill="none"
            aria-hidden="true"
        >
            {/* Ground */}
            <line x1="4" y1="68" x2="196" y2="68" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

            {/* Plant pot */}
            <rect x="22" y="52" width="18" height="16" rx="2" fill="#92400e" />
            <rect x="20" y="48" width="22" height="6" rx="2" fill="#b45309" />
            <ellipse cx="31" cy="44" rx="14" ry="10" fill="#22c55e" />
            <ellipse cx="26" cy="40" rx="8" ry="7" fill="#16a34a" />
            <ellipse cx="36" cy="41" rx="7" ry="6" fill="#4ade80" />

            {/* Shield */}
            <path
                d="M78 62V40c0-3.5 2.8-6.5 6.5-7.2l11-2c3.2-.6 6.5 1.4 7.5 4.5l3.5 11.5c.8 2.7-.2 5.6-2.4 7.3L92 62c-2.8 2-6.6 2-9.4 0l-4.2-3.1c-2.2-1.7-3.2-4.6-2.4-7.3l3.5-11.5c1-3.1 4.3-5.1 7.5-4.5l11 2C103.2 33.5 106 36.5 106 40v22"
                fill="#2563eb"
            />
            <path
                d="M74 62h24l-5-20c-.8-3-4-5.2-7.2-4.6l-9.8 1.8c-3.2.6-5.6 3.3-6 6.5L74 62z"
                fill="#1d4ed8"
            />
            <path
                d="M86 48l4 4 9-10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* House */}
            <path d="M128 62V46l16-12 16 12v16" fill="#1e40af" />
            <rect x="132" y="50" width="24" height="12" fill="white" />
            <rect x="136" y="54" width="7" height="7" rx="1" fill="#bfdbfe" />
            <rect x="147" y="54" width="7" height="7" rx="1" fill="#bfdbfe" />
            <rect x="141" y="58" width="8" height="10" rx="1" fill="#93c5fd" />
            <path d="M124 46l20-14 20 14" fill="#1e3a8a" stroke="#1e3a8a" strokeWidth="1" />
        </svg>
    );
}

export default function VerifiedTrustedBanner() {
    return (
        <section className="container-app px-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#eef2fb] px-4 py-4 sm:gap-6 sm:px-6 sm:py-5">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 sm:h-10 sm:w-10">
                        <ShieldCheck className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                            Verified &amp; Trusted
                        </h2>
                        <p className="mt-0.5 text-xs leading-snug text-gray-700 sm:text-sm">
                            All listings and service providers are verified for your peace of mind.
                        </p>
                    </div>
                </div>

                <div className="hidden shrink-0 sm:block">
                    <BannerIllustration />
                </div>
            </div>
        </section>
    );
}
