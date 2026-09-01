"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube facade.
 *
 * A bare <iframe src="youtube.com/embed/…"> loads on page load no matter where
 * it sits in the document — on the home page that cost ~845 KiB of transfer and
 * ~1s of main-thread time before the visitor had scrolled anywhere near it, and
 * pulled in a preconnect to i.ytimg.com that was never used.
 *
 * This renders YouTube's own thumbnail instead and swaps in the real player on
 * click, so the player's cost is paid only by people who actually watch.
 *
 * The thumbnail is a plain <img> rather than next/image on purpose: it avoids
 * adding a remote host to next.config just for one poster frame, and it is
 * already a small, well-compressed JPEG served from Google's CDN.
 */
export default function LiteYouTube({
    videoId,
    title,
    playLabel,
    className = "",
}: {
    videoId: string;
    /** Used as the iframe title and woven into the play button's label. */
    title: string;
    /** Accessible name for the play button, e.g. "Play video". */
    playLabel: string;
    className?: string;
}) {
    const [playing, setPlaying] = useState(false);

    if (playing) {
        return (
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className={`absolute inset-0 h-full w-full border-0 ${className}`}
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`${playLabel}: ${title}`}
            className={`group absolute inset-0 h-full w-full cursor-pointer border-0 bg-black p-0 ${className}`}
        >
            {/*
              hqdefault rather than maxresdefault: it exists for every video,
              where maxresdefault 404s on anything not uploaded in HD.
            */}
            <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-20 items-center justify-center rounded-2xl bg-black/70 transition-colors group-hover:bg-red-600">
                    {/* Decorative: the button already carries an accessible name. */}
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden
                        className="h-7 w-7 fill-white"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </span>
            </span>
        </button>
    );
}
