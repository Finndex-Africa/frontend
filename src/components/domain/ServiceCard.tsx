"use client";
import Link from "next/link";
import { useBookmarks } from "@/providers";
import { SafeImage } from "@/components/ui/SafeImage";
import ShareButton from "@/components/ui/ShareButton";

export type Service = {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    imageUrl: string;
    tags: string[];
    badge?: string;
    provider?: {
        name: string;
        photo?: string;
    };
};

export default function ServiceCard({ service }: { service: Service }) {
    const { toggle, has } = useBookmarks();
    const saved = has(service.id);

    return (
        <Link href={`/routes/service/${service.id}`} className="group cursor-pointer block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                {/* IMAGE */}
                <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden">
                    <SafeImage
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {service.badge && (
                        <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-medium shadow-sm">
                            {service.badge}
                        </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                        <ShareButton
                            compact
                            dropdownRight
                            url={`/routes/service/${service.id}`}
                            title={service.name}
                            text={`Check out this service: ${service.name} in ${service.location}`}
                        />
                        <button
                            aria-label="Bookmark"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggle(service.id);
                            }}
                            className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
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
                </div>

                {/* CONTENT */}
                <div className="p-4 flex-1 flex flex-col space-y-2.5">
                    <div className="flex-1 space-y-2">
                        <div>
                            <h3 className="font-medium text-gray-900 text-[15px] leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {service.name}
                            </h3>
                            <p className="text-[13px] text-gray-600 flex items-center gap-1 mt-0.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{service.location}</span>
                            </p>
                            {/* Provider Info */}
                            {service.provider && (
                                <div className="flex items-center gap-2 mt-2">
                                    {service.provider.photo ? (
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                                            <SafeImage
                                                src={service.provider.photo}
                                                alt={service.provider.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    <span className="text-[12px] text-gray-600 truncate">by {service.provider.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {service.tags.slice(0, 2).map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-normal"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 fill-current text-amber-500" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="text-sm font-normal text-gray-900">{service.rating}</span>
                            {service.reviews > 0 && (
                                <span className="text-[12px] text-gray-500">({service.reviews})</span>
                            )}
                        </div>
                        <span className="text-blue-600 hover:text-blue-700 font-medium text-[13px]">
                            View Details →
                        </span>
                    </div>
                </div>
            </div>
        </Link>

    );
}
