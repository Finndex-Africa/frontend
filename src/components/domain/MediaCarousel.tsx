"use client";
import Image from "next/image";
import React, { useState } from "react";

type MediaCarouselProps = { media: { type: "image" | "video"; src: string }[] };

export default function MediaCarousel({ media }: MediaCarouselProps) {
    const [showAllPhotos, setShowAllPhotos] = useState(false);

    // Get up to 5 images for the grid
    const displayImages = media.slice(0, 5);

    return (
        <div className="w-full">
            {/* Grid Layout - Airbnb Style */}
            <div className="grid grid-cols-4 gap-2 h-[400px] rounded-lg overflow-hidden">
                {/* Large image on the left (takes 2 columns) */}
                <div className="col-span-2 row-span-2 relative bg-gray-100 cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                    {displayImages[0] && (
                        displayImages[0].type === "image" ? (
                            <Image
                                src={displayImages[0].src}
                                alt="Main image"
                                fill
                                className="object-cover hover:brightness-95 transition-all"
                                priority
                                quality={90}
                            />
                        ) : (
                            <video className="w-full h-full object-cover" controls src={displayImages[0].src} />
                        )
                    )}
                </div>

                {/* Top right image */}
                {displayImages[1] && (
                    <div className="col-span-2 relative bg-gray-100 cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                        <Image
                            src={displayImages[1].src}
                            alt="Image 2"
                            fill
                            className="object-cover hover:brightness-95 transition-all"
                            quality={85}
                        />
                    </div>
                )}

                {/* Bottom right - 2 images */}
                <div className="col-span-1 relative bg-gray-100 cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                    {displayImages[2] && (
                        <Image
                            src={displayImages[2].src}
                            alt="Image 3"
                            fill
                            className="object-cover hover:brightness-95 transition-all"
                            quality={85}
                        />
                    )}
                </div>

                <div className="col-span-1 relative bg-gray-100">
                    {displayImages[3] && (
                        <div className="relative w-full h-full cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                            <Image
                                src={displayImages[3].src}
                                alt="Image 4"
                                fill
                                className="object-cover hover:brightness-95 transition-all"
                                quality={85}
                            />
                            {/* Show all photos button */}
                            {media.length > 4 && (
                                <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-all flex items-center justify-center">
                                    <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Show all photos
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



