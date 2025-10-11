"use client";
import Image from "next/image";
import React, { useState } from "react";

type MediaCarouselProps = { media: { type: "image" | "video"; src: string }[] };

export default function MediaCarousel({ media }: MediaCarouselProps) {
    const [index, setIndex] = useState(0);
    const current = media[index];
    return (
        <div className="relative w-full card overflow-hidden">
            <div className="relative w-full h-72 md:h-96">
                {current.type === "image" ? (
                    <Image src={current.src} alt="media" fill className="object-cover" />
                ) : (
                    <video className="w-full h-full object-cover" controls src={current.src} />
                )}
            </div>
            <div className="absolute inset-y-0 left-0 flex items-center">
                <button className="btn btn-secondary ml-2" onClick={() => setIndex((i) => (i - 1 + media.length) % media.length)}>&larr;</button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
                <button className="btn btn-secondary mr-2" onClick={() => setIndex((i) => (i + 1) % media.length)}>&rarr;</button>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {media.map((_, i) => (
                    <span key={i} className={`h-1.5 w-6 rounded ${i === index ? "bg-white" : "bg-white/50"}`} />
                ))}
            </div>
        </div>
    );
}



