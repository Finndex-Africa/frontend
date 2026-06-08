"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { SafeImage } from "@/components/ui/SafeImage";

type MediaCarouselProps = { media: { type: "image" | "video"; src: string }[] };

const THUMB_VISIBLE = 4;

export default function MediaCarousel({ media }: MediaCarouselProps) {
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const displayImages = media.slice(0, 5);

    const goTo = useCallback(
        (index: number) => {
            setCurrentImageIndex(Math.max(0, Math.min(media.length - 1, index)));
        },
        [media.length],
    );

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setShowAllPhotos(true);
    };

    const goToPrevious = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentImageIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;

        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) goTo(currentImageIndex + 1);
            else goTo(currentImageIndex - 1);
        }
    };

    useEffect(() => {
        if (!showAllPhotos) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowAllPhotos(false);
            }
            if (e.key === "ArrowLeft") {
                setCurrentImageIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
            }
            if (e.key === "ArrowRight") {
                setCurrentImageIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [showAllPhotos, media.length]);

    const hasMoreThumbs = media.length > THUMB_VISIBLE + 1;
    const thumbSlots = hasMoreThumbs ? media.slice(0, THUMB_VISIBLE) : media;
    const remainingPhotos = hasMoreThumbs ? media.length - THUMB_VISIBLE : 0;

    return (
        <div className="w-full">
            {/* Mobile — swipeable carousel */}
            <div className="md:hidden">
                <div
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => openLightbox(currentImageIndex)}
                >
                    <div
                        className="flex h-full transition-transform duration-300 ease-out"
                        style={{
                            width: `${media.length * 100}%`,
                            transform: `translateX(-${(currentImageIndex * 100) / media.length}%)`,
                        }}
                    >
                        {media.map((item, index) => (
                            <div
                                key={`${item.src}-${index}`}
                                className="relative h-full shrink-0"
                                style={{ width: `${100 / media.length}%` }}
                            >
                                {item.type === "image" ? (
                                    <SafeImage
                                        src={item.src}
                                        alt={`Photo ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                ) : (
                                    <video
                                        className="h-full w-full object-cover"
                                        controls
                                        src={item.src}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {media.length > 1 && (
                        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span>
                                {currentImageIndex + 1} / {media.length}
                            </span>
                        </div>
                    )}
                </div>

                {media.length > 1 && (
                    <div className="mt-2 flex gap-2">
                        {thumbSlots.map((item, index) => (
                            <button
                                key={`thumb-${item.src}-${index}`}
                                type="button"
                                onClick={() => goTo(index)}
                                className={`relative aspect-[4/3] flex-1 overflow-hidden rounded-xl bg-gray-100 transition-all ${
                                    index === currentImageIndex
                                        ? "ring-2 ring-blue-600 ring-offset-1"
                                        : "opacity-90"
                                }`}
                            >
                                <SafeImage
                                    src={item.src}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                        {remainingPhotos > 0 && (
                            <button
                                type="button"
                                onClick={() => openLightbox(THUMB_VISIBLE)}
                                className="relative aspect-[4/3] flex-1 overflow-hidden rounded-xl bg-gray-100"
                            >
                                <SafeImage
                                    src={media[THUMB_VISIBLE].src}
                                    alt="More photos"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                                    +{remainingPhotos}
                                </div>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop — grid layout */}
            <div className="hidden md:grid grid-cols-4 gap-2 h-[400px] rounded-lg overflow-hidden">
                <div
                    className="col-span-2 row-span-2 relative bg-gray-100 cursor-pointer"
                    onClick={() => openLightbox(0)}
                >
                    {displayImages[0] &&
                        (displayImages[0].type === "image" ? (
                            <SafeImage
                                src={displayImages[0].src}
                                alt="Main image"
                                fill
                                className="object-cover hover:brightness-95 transition-all"
                                priority
                            />
                        ) : (
                            <video className="w-full h-full object-cover" controls src={displayImages[0].src} />
                        ))}
                </div>

                {displayImages[1] && (
                    <div className="col-span-2 relative bg-gray-100 cursor-pointer" onClick={() => openLightbox(1)}>
                        <SafeImage
                            src={displayImages[1].src}
                            alt="Image 2"
                            fill
                            className="object-cover hover:brightness-95 transition-all"
                        />
                    </div>
                )}

                <div className="col-span-1 relative bg-gray-100 cursor-pointer" onClick={() => openLightbox(2)}>
                    {displayImages[2] && (
                        <SafeImage
                            src={displayImages[2].src}
                            alt="Image 3"
                            fill
                            className="object-cover hover:brightness-95 transition-all"
                        />
                    )}
                </div>

                <div className="col-span-1 relative bg-gray-100">
                    {displayImages[3] && (
                        <div className="relative w-full h-full cursor-pointer" onClick={() => openLightbox(3)}>
                            <SafeImage
                                src={displayImages[3].src}
                                alt="Image 4"
                                fill
                                className="object-cover hover:brightness-95 transition-all"
                            />
                            {media.length > 4 && (
                                <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-all flex items-center justify-center">
                                    <button
                                        type="button"
                                        className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Show all photos
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Full-screen lightbox */}
            {showAllPhotos && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="flex items-center justify-between p-4 sm:p-6 bg-black/90 backdrop-blur-sm">
                        <button
                            type="button"
                            onClick={() => setShowAllPhotos(false)}
                            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline text-sm font-medium">Close</span>
                        </button>
                        <div className="text-white text-sm font-medium">
                            {currentImageIndex + 1} / {media.length}
                        </div>
                        <div className="w-6" />
                    </div>

                    <div className="flex-1 relative flex items-center justify-center p-4">
                        {media[currentImageIndex] && (
                            <div key={currentImageIndex} className="relative w-full h-full max-w-7xl mx-auto">
                                <SafeImage
                                    src={media[currentImageIndex].src}
                                    alt={`Image ${currentImageIndex + 1}`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}

                        {media.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={goToPrevious}
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 sm:p-3 shadow-lg transition-all"
                                    aria-label="Previous image"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={goToNext}
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 sm:p-3 shadow-lg transition-all"
                                    aria-label="Next image"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    <div className="bg-black/90 backdrop-blur-sm p-4 overflow-x-auto">
                        <div className="flex gap-2 justify-center min-w-max mx-auto">
                            {media.map((item, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden transition-all ${
                                        index === currentImageIndex
                                            ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                                            : "opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <SafeImage
                                        src={item.src}
                                        alt={`Thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
