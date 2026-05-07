'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface NoImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const NoImage: React.FC<NoImageProps> = ({ 
  src, 
  alt = 'image',
  width = 275, 
  height = 275, 
  className = 'rounded',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes so a new image URL gets a fresh attempt
  useEffect(() => {
    setHasError(false);
  }, [src]);
  
  const isValidImageUrl = src && src.startsWith('http');

  if (!isValidImageUrl || hasError) {
    return (
       <Image
      src={"/images/no-image.png"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      onError={() => setHasError(true)}
    />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
};

export default NoImage; 