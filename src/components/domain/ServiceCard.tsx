"use client";
import Image from "next/image";
import Link from "next/link";
import { useBookmarks } from "@/providers";
import { useState } from "react";

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

// Default fallback image for services
const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952';

export default function ServiceCard({ service }: { service: Service }) {
    const { toggle, has } = useBookmarks();
    const saved = has(service.id);
    const [imgSrc, setImgSrc] = useState(service.imageUrl || DEFAULT_SERVICE_IMAGE);

    return (
        <Link href={`/routes/service/${service.id}`} className="group cursor-pointer block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 h-full flex flex-col">
                {/* IMAGE */}
                <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden">
                    <Image
                        src={imgSrc}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImgSrc(DEFAULT_SERVICE_IMAGE)}
                    />
                    {service.badge && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase">
                            {service.badge}
                        </div>
                    )}
                    <button
                        aria-label="Bookmark"
                        onClick={(e) => {
                            e.preventDefault();
                            toggle(service.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-md"
                    >
                        <svg
                            className={`w-5 h-5 ${saved ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-700'}`}
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
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                        <div className="mb-3">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {service.name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{service.location}</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {service.tags.slice(0, 2).map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                            <svg className="w-5 h-5 fill-current text-amber-400" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-sm font-bold text-gray-900">{service.rating}</span>
                            <span className="text-xs text-gray-500">({service.reviews})</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </Link>

    );
}
