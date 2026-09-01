'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Override the card default; the hero and other full-bleed art want higher. */
  quality?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

/*
  Without an explicit `sizes`, next/image assumes 100vw and picks a 750px-wide
  source for a card that renders ~185px wide — Lighthouse measured ~956 KiB of
  waste across the home page. This mirrors the card grid actually used
  (grid-cols-2 / md:3 / lg:4 / xl:5) at Tailwind's breakpoints.
*/
const CARD_SIZES =
  "(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw";

/** Thumbnails tolerate more compression than hero art; 75 is next/image's default. */
const CARD_QUALITY = 65;

// Local placeholders to avoid Unsplash 404s
const FALLBACK_IMAGES = {
  property: '/images/properties/pexels-photo-323780.jpeg',
  service: '/images/services/cleaning1.jpeg',
  default: '/images/properties/pexels-photo-323780.jpeg',
};

// Skip known-bad Unsplash placeholder IDs (e.g. 1580000000001) so we never request them
function isBadUnsplashUrl(url: string): boolean {
  if (typeof url !== 'string' || !url.includes('unsplash.com')) return false;
  return /photo-1580{8,}\d*/.test(url) || /photo-15[56]0448204/.test(url) || /photo-1502672260266/.test(url) || /photo-1600607687644/.test(url);
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  sizes,
  quality,
  style,
  onLoad
}: SafeImageProps) {
  const getFallbackImage = () => {
    const altLower = alt.toLowerCase();
    if (altLower.includes('property') || altLower.includes('house') || altLower.includes('apartment')) {
      return FALLBACK_IMAGES.property;
    }
    if (altLower.includes('service')) {
      return FALLBACK_IMAGES.service;
    }
    return FALLBACK_IMAGES.default;
  };
  const [imgSrc, setImgSrc] = useState(() => (src && !isBadUnsplashUrl(src) ? src : getFallbackImage()));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getFallbackImage());
    }
  };

  /*
    Uploads come back pointing at the Spaces *origin* host, which the optimizer
    could not reach — so these were marked `unoptimized` and served raw. That
    meant shipping the original upload untouched: a single listing photo was
    3 MB, and one home page pulled ~7.9 MB of raw PNG versus 0.14 MB for every
    image that did go through the optimizer.

    The CDN host is the same bucket behind an edge, serves byte-identical
    objects, is reachable by the optimizer, and is already allow-listed in
    next.config. So rewrite to it rather than giving up on optimization.
  */
  const optimizedSrc =
    typeof imgSrc === 'string'
      ? imgSrc.replace(
          /\/\/([a-z0-9-]+)\.([a-z0-9-]+)\.digitaloceanspaces\.com\//i,
          '//$1.$2.cdn.digitaloceanspaces.com/',
        )
      : imgSrc;

  // Anything still on a non-CDN Spaces host (unexpected shape) keeps the old
  // bypass, so a URL we failed to rewrite renders rather than 500s.
  const isDirectSpacesUrl =
    typeof optimizedSrc === 'string' &&
    optimizedSrc.includes('digitaloceanspaces.com') &&
    !optimizedSrc.includes('cdn.digitaloceanspaces.com');

  if (fill) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        unoptimized={isDirectSpacesUrl}
        className={className}
        priority={priority}
        sizes={sizes ?? CARD_SIZES}
        quality={quality ?? CARD_QUALITY}
        style={style}
        onError={handleError}
        onLoad={onLoad}
      />
    );
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      unoptimized={isDirectSpacesUrl}
      className={className}
      priority={priority}
      sizes={sizes ?? CARD_SIZES}
      quality={quality ?? CARD_QUALITY}
      style={style}
      onError={handleError}
      onLoad={onLoad}
    />
  );
}
