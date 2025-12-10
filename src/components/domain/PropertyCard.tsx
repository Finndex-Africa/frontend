"use client";
import Link from "next/link";
import { useBookmarks } from "@/providers";
import { SafeImage } from "@/components/ui/SafeImage";

export type Property = {
    id: string;
    title: string;
    location: string;
    price: string;
    imageUrl: string;
    amenities: string[];
    rating?: number;
    distance?: string;
    dates?: string;
};

export default function PropertyCard({ p, badge }: { p: Property; badge?: string }) {
    const { toggle, has } = useBookmarks();
    const saved = has(p.id);

    // Format price with thousand separators
    const formatPrice = (price: string) => {
        const numericPrice = price.replace(/[^0-9]/g, '');
        return '$' + parseInt(numericPrice).toLocaleString();
    };

    return (
        <Link href={`/routes/property/${p.id}`} className="group cursor-pointer block">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 shadow-sm">
                <SafeImage
                    src={p.imageUrl}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {badge && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700 shadow-sm">
                        {badge}
                    </div>
                )}
                <button
                    aria-label="Bookmark"
                    onClick={(e) => {
                        e.preventDefault();
                        toggle(p.id);
                    }}
                    className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform bg-white/10 backdrop-blur-sm rounded-full"
                >
                    <svg
                        className={`w-5 h-5 ${saved ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-white'}`}
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </button>
            </div>

            <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 text-[15px] leading-snug line-clamp-1 flex-1">
                        {p.title}
                    </h3>
                    {p.rating && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <svg className="w-3.5 h-3.5 fill-current text-amber-500" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-sm font-normal text-gray-900">{p.rating}</span>
                        </div>
                    )}
                </div>

                <div className="text-[13px] text-gray-600 line-clamp-1">{p.location}</div>

                <div className="text-[13px] text-gray-500 line-clamp-1">
                    {p.amenities.slice(0, 3).join(" · ")}
                </div>

                <div className="pt-0.5">
                    <span className="font-semibold text-gray-900 text-[15px]">{formatPrice(p.price)}</span>
                    <span className="text-gray-500 text-[13px] font-normal"> / month</span>
                </div>
            </div>
        </Link>
    );
}
