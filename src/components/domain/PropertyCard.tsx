"use client";
import Image from "next/image";
import Link from "next/link";
import { useBookmarks } from "@/providers";

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

    return (
        <Link href={`/routes/property/${p.id}`} className="group cursor-pointer block">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3">
                <Image
                    src={p.imageUrl}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {badge && (
                    <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow-sm">
                        {badge}
                    </div>
                )}
                <button
                    aria-label="Bookmark"
                    onClick={(e) => {
                        e.preventDefault();
                        toggle(p.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 hover:scale-110 transition-transform"
                >
                    <svg
                        className={`w-6 h-6 ${saved ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-white'} drop-shadow-lg`}
                        strokeWidth={2}
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

            <div className="flex items-start justify-between gap-1 mb-1">
                <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-[15px]">{p.location}</div>
                </div>
                {p.rating && (
                    <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 fill-current text-gray-900" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{p.rating}</span>
                    </div>
                )}
            </div>

            <div className="text-sm text-gray-600 mb-1">{p.distance || p.amenities.join(" · ")}</div>

            {p.dates && (
                <div className="text-sm text-gray-600 mb-1">{p.dates}</div>
            )}

            <div className="text-[15px]">
                <span className="font-semibold text-gray-900">{p.price}</span>
                <span className="text-gray-600"> / month</span>
            </div>
        </Link>
    );
}
