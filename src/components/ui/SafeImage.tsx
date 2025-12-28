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

// Valid placeholder images for different categories
const FALLBACK_IMAGES = {
  property: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', // Modern house
  service: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80', // Home services
  default: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', // Real estate
};

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
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Determine fallback based on alt text
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
