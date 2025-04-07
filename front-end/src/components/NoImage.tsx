'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface NoImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const NoImage: React.FC<NoImageProps> = ({ 
  src, 
  alt = 'image',
  width = 275, 
  height = 275, 
  className = '',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  
  const isValidImageUrl = src && src.startsWith('http');

  if (!isValidImageUrl || hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-skin-neutral-100 rounded-md ${className}`}
        style={{ width, height }}
      >
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="text-skin-neutral-300"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
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