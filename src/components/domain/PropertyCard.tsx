"use client";
import Link from "next/link";
import { useRef, useState, useCallback } from "react";
import { useBookmarks } from "@/providers";
import { SafeImage } from "@/components/ui/SafeImage";
import ShareButton from "@/components/ui/ShareButton";

export type Property = {
    id: string;
    title: string;
    location: string;
    price: string;
    imageUrl: string;
    imageUrls?: string[];
    amenities: string[];
    rating?: number;
    distance?: string;
    dates?: string;
    /** Property type for badge (e.g. "Apartment", "Office Space") - set when posting listing */
    propertyType?: string;
};

function PropertyImageCarousel({
    images,
    alt,
}: {
    images: string[];
    alt: string;
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const didSwipe = useRef(false);

    const goTo = useCallback(
        (index: number) => {
            setActiveIndex(Math.max(0, Math.min(images.length - 1, index)));
        },
        [images.length],
    );

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        didSwipe.current = false;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;

        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            didSwipe.current = true;
            if (dx < 0) goTo(activeIndex + 1);
            else goTo(activeIndex - 1);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (didSwipe.current) {
            e.preventDefault();
            e.stopPropagation();
            didSwipe.current = false;
        }
    };

    const dotCount = Math.min(images.length, 5);

    return (
        <div
            className="absolute inset-0 touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
        >
            <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{
                    width: `${images.length * 100}%`,
                    transform: `translateX(-${(activeIndex * 100) / images.length}%)`,
                }}
            >
                {images.map((src, index) => (
                    <div
                        key={`${src}-${index}`}
                        className="relative h-full shrink-0"
                        style={{ width: `${100 / images.length}%` }}
                    >
                        <SafeImage
                            src={src}
                            alt={`${alt} - photo ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-[1] flex -translate-x-1/2 items-center gap-1.5">
                    {Array.from({ length: dotCount }).map((_, index) => (
                        <span
                            key={index}
                            className={`rounded-full bg-white shadow-sm transition-all ${
                                index === activeIndex % dotCount
                                    ? "h-2 w-2 opacity-100"
                                    : "h-1.5 w-1.5 opacity-50"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PropertyCard({
    p,
    badge,
    compact = false,
}: {
    p: Property;
    badge?: string;
    compact?: boolean;
}) {
    const { toggle, has } = useBookmarks();
    const saved = has(p.id);
    const displayBadge = badge ?? p.propertyType;
    const images = p.imageUrls?.length ? p.imageUrls : [p.imageUrl];

    const formatPrice = (price: string) => {
        const numericPrice = price.replace(/[^0-9]/g, "");
        const value = parseInt(numericPrice, 10);
        if (!Number.isFinite(value)) return "Price unavailable";
        return "$" + value.toLocaleString();
    };

    const imageContainerClass = compact
        ? "relative w-full rounded-2xl overflow-hidden shadow-sm aspect-[5/4] sm:aspect-[4/3] md:aspect-square mb-2"
        : "relative w-full rounded-2xl overflow-hidden shadow-sm aspect-[5/4] md:aspect-square mb-3";

    return (
        <Link href={`/routes/property/${p.id}`} className="group cursor-pointer block">
            <div className={imageContainerClass}>
                <div className="absolute inset-0 md:hidden">
                    <PropertyImageCarousel images={images} alt={p.title} />
                </div>
                <div className="absolute inset-0 hidden md:block">
                    <SafeImage
                        src={images[0]}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {displayBadge && (
                    <div
                        className={`absolute z-[2] bg-white/95 backdrop-blur-sm rounded-md font-medium text-gray-700 shadow-sm ${
                            compact
                                ? "top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] sm:text-[11px]"
                                : "top-3 left-3 px-2.5 py-1 text-[11px]"
                        }`}
                    >
                        {displayBadge}
                    </div>
                )}
                <div
                    className={`absolute z-[2] flex items-center gap-0.5 sm:gap-1 ${compact ? "top-1.5 right-1.5" : "top-3 right-3"}`}
                >
                    <ShareButton
                        compact
                        dropdownRight
                        url={`/routes/property/${p.id}`}
                        title={p.title}
                        text={`Check out this property: ${p.title} in ${p.location}`}
                    />
                    <button
                        aria-label="Bookmark"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggle(p.id, "property");
                        }}
                        className={`hover:scale-110 transition-transform bg-white/10 backdrop-blur-sm rounded-full ${
                            compact ? "p-1" : "p-2"
                        }`}
                    >
                        <svg
                            className={`${compact ? "w-4 h-4" : "w-5 h-5"} ${saved ? "fill-red-500 stroke-red-500" : "fill-none stroke-white"}`}
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

            <div className={compact ? "space-y-0.5" : "space-y-1"}>
                <div className="flex items-start justify-between gap-1 sm:gap-2">
                    <h3
                        className={`font-medium text-gray-900 leading-snug line-clamp-1 flex-1 ${
                            compact ? "text-[12px] sm:text-[15px]" : "text-[15px]"
                        }`}
                    >
                        {p.title}
                    </h3>
                    {p.rating && (
                        <div className="flex items-center gap-0.5 shrink-0">
                            <svg
                                className={`fill-current text-brand-yellow ${compact ? "w-3 h-3" : "w-3.5 h-3.5"}`}
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span
                                className={`font-normal text-gray-900 ${compact ? "text-[11px] sm:text-sm" : "text-sm"}`}
                            >
                                {p.rating}
                            </span>
                        </div>
                    )}
                </div>

                <div
                    className={`text-gray-600 line-clamp-1 ${compact ? "text-[11px] sm:text-[13px]" : "text-[13px]"}`}
                >
                    {p.location}
                </div>

                <div
                    className={`text-gray-500 line-clamp-1 ${compact ? "text-[10px] sm:text-[13px]" : "text-[13px]"}`}
                >
                    {p.amenities.slice(0, 3).join(" · ")}
                </div>

                <div className="pt-0.5">
                    <span
                        className={`font-semibold text-gray-900 ${compact ? "text-[12px] sm:text-[15px]" : "text-[15px]"}`}
                    >
                        {formatPrice(p.price)}
                    </span>
                    <span
                        className={`text-gray-500 font-normal ${compact ? "text-[10px] sm:text-[13px]" : "text-[13px]"}`}
                    >
                        {" "}
                        / month
                    </span>
                </div>
            </div>
        </Link>
    );
}
