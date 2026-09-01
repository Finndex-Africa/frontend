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

  // Bypass Next.js image optimizer for direct DigitalOcean Spaces URLs to avoid
  // 500 errors when the optimizer cannot reach the origin server.
  const isDirectSpacesUrl = typeof imgSrc === 'string' &&
    imgSrc.includes('digitaloceanspaces.com') &&
    !imgSrc.includes('cdn.digitaloceanspaces.com');

  if (fill) {
    return (
      <Image
        src={imgSrc}
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
      src={imgSrc}
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
