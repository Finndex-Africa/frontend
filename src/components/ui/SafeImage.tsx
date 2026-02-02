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
  style?: React.CSSProperties;
  onLoad?: () => void;
}

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

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
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
      className={className}
      priority={priority}
      sizes={sizes}
      style={style}
      onError={handleError}
      onLoad={onLoad}
    />
  );
}
