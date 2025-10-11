"use client";
import Image from "next/image";
import Link from "next/link";
import { useBookmarks } from "@/providers";

export type Service = {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    imageUrl: string;
    tags: string[];
    badge?: string;
};

export default function ServiceCard({ service }: { service: Service }) {
    const { toggle, has } = useBookmarks();
    const saved = has(service.id);

    return (
        <Link href={`/routes/service/${service.id}`} className="group cursor-pointer block">
            <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-[350px] flex flex-col">
                {/* IMAGE */}
                <div className="relative aspect-[4/3] w-full flex-shrink-0">
                    <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {service.badge && (
                        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm uppercase">
                            {service.badge}
                        </div>
                    )}
                    <button
                        aria-label="Bookmark"
                        onClick={(e) => {
                            e.preventDefault();
                            toggle(service.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 hover:scale-110 transition-transform"
                    >
                        <svg
                            className={`w-6 h-6 ${saved ? 'fill-blue-600 stroke-blue-600' : 'fill-none stroke-white'} drop-shadow-lg`}
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

                {/* CONTENT */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-base truncate">{service.name}</h3>
                                <p className="text-sm text-gray-600 mt-0.5 truncate">{service.location}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <svg className="w-4 h-4 fill-current text-amber-400" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-900">{service.rating}</span>
                                <span className="text-sm text-gray-500">({service.reviews.toLocaleString()})</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {service.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded truncate"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Link>

    );
}
