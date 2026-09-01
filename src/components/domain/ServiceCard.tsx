"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useEnumLabel } from "@/lib/enum-labels";
import {
    useTranslatedContent,
    type TranslatableEntity,
} from "@/lib/translated-content";

import { SafeImage } from "@/components/ui/SafeImage";
import ShareButton from "@/components/ui/ShareButton";
import { trackListingBookmarked } from "@/lib/analytics";
import { bookmarksApi } from "@/services/api/bookmarks.api";

import { Link, useRouter } from "@/i18n/navigation";
export type Service = {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    imageUrl: string;
    tags: string[];
    badge?: string;
    /** Initial bookmark state from the API listing response */
    isBookmarked?: boolean;
    provider?: {
        name: string;
        photo?: string;
    };
    /** i18n passthrough — resolved by the card, see lib/translated-content. */
    sourceLang?: string;
    translations?: Record<string, { title?: string; description?: string }>;
    translationSource?: 'machine' | 'human';
};

export default function ServiceCard({
    service,
    compact = false,
    onUnbookmark,
}: {
    service: Service;
    compact?: boolean;
    /** Called after the item is successfully unbookmarked — useful for removing from a saved list */
    onUnbookmark?: () => void;
}) {
    // Badge/tags are built from the backend `category` by several page-level
    // adapters, so translate here at render time to cover all of them.
    const tCommon = useTranslations("common");
    const categoryLabel = useEnumLabel("serviceCategories");
    // ServiceCard's view-model calls the title `name`, but the backend
    // translates it under the `title` key — remap for the lookup.
    const translated = useTranslatedContent({
        ...service,
        title: service.name,
    } as TranslatableEntity);
    const router = useRouter();
    const [saved, setSaved] = useState(service.isBookmarked ?? false);
    const [toggling, setToggling] = useState(false);

    return (
        <Link href={`/routes/service/${service.id}`} className="group cursor-pointer block">
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                {/* IMAGE */}
                <div
                    className={`relative w-full flex-shrink-0 overflow-hidden ${
                        compact ? 'aspect-[4/3] max-h-[120px] sm:max-h-none' : 'aspect-[4/3]'
                    }`}
                >
                    <SafeImage
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {service.badge && (
                        <div
                            className={`absolute bg-brand-blue/90 backdrop-blur-sm text-white rounded-md font-medium shadow-sm ${
                                compact
                                    ? 'top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] sm:text-[11px]'
                                    : 'top-3 left-3 px-2.5 py-1 text-[11px]'
                            }`}
                        >
                            {categoryLabel(service.badge)}
                        </div>
                    )}
                    <div className={`absolute flex items-center gap-0.5 sm:gap-1 ${compact ? 'top-1.5 right-1.5' : 'top-3 right-3'}`}>
                        <ShareButton
                            compact
                            dropdownRight
                            url={`/routes/service/${service.id}`}
                            title={service.name}
                            text={`Check out this service: ${service.name} in ${service.location}`}
                        />
                        <button
                            aria-label={saved ? "Remove from favorites" : "Save to favorites"}
                            disabled={toggling}
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                                if (!token) { router.push("/routes/login"); return; }
                                setToggling(true);
                                const prev = saved;
                                setSaved(!prev);
                                try {
                                    const result = await bookmarksApi.toggle("service", service.id);
                                    setSaved(result.bookmarked);
                                    trackListingBookmarked({ id: service.id, type: "service", action: result.bookmarked ? "add" : "remove" });
                                    if (!result.bookmarked) onUnbookmark?.();
                                } catch {
                                    setSaved(prev);
                                } finally {
                                    setToggling(false);
                                }
                            }}
                            className={`bg-white/10 backdrop-blur-sm rounded-full hover:scale-110 transition-transform disabled:opacity-60 ${
                                compact ? 'p-1' : 'p-2'
                            }`}
                        >
                            <svg
                                className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${saved ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-white'}`}
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
                <div className={`flex-1 flex flex-col ${compact ? 'p-2 sm:p-4 space-y-1.5' : 'p-4 space-y-2.5'}`}>
                    <div className="flex-1 space-y-2">
                        <div>
                            <h3
                                className={`font-medium text-gray-900 leading-snug line-clamp-1 group-hover:text-brand-blue transition-colors ${
                                    compact ? 'text-[12px] sm:text-[15px]' : 'text-[15px]'
                                }`}
                            >
                                {translated.title.value}
                            </h3>
                            <p
                                className={`text-gray-600 flex items-center gap-1 mt-0.5 ${
                                    compact ? 'text-[10px] sm:text-[13px]' : 'text-[13px]'
                                }`}
                            >
                                <svg className={compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{service.location}</span>
                            </p>
                            {/* Provider Info — hidden on compact mobile */}
                            {service.provider && !compact && (
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

                        {!compact && (
                        <div className="flex flex-wrap gap-1.5">
                            {service.tags.slice(0, 2).map((tag, index) => (
                                <span
                                    key={index}
                                    className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-normal"
                                >
                                    {categoryLabel(tag)}
                                </span>
                            ))}
                        </div>
                        )}
                    </div>

                    <div
                        className={`flex items-center justify-between border-t border-gray-100 ${
                            compact ? 'pt-1.5 sm:pt-2' : 'pt-2'
                        }`}
                    >
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <svg
                                className={`fill-current text-brand-yellow ${compact ? 'w-3 h-3' : 'w-4 h-4'}`}
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className={`font-normal text-gray-900 ${compact ? 'text-[11px] sm:text-sm' : 'text-sm'}`}>
                                {service.rating}
                            </span>
                            {service.reviews > 0 && (
                                <span className={`text-gray-500 ${compact ? 'text-[10px] sm:text-[12px]' : 'text-[12px]'}`}>
                                    ({service.reviews})
                                </span>
                            )}
                        </div>
                        {!compact && (
                        <span className="text-brand-blue hover:text-brand-blue font-medium text-[13px]">
                            {tCommon("viewDetails")} →
                        </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>

    );
}
