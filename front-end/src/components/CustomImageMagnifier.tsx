import React, { useState, useRef } from 'react';
import NoImage from './NoImage';

interface CustomImageMagnifierProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  zoomLevel?: number;
}

const CustomImageMagnifier: React.FC<CustomImageMagnifierProps> = ({
  src,
  alt,
  width,
  height,
  className,
  zoomLevel = 2.5
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
    
    // Calculate relative position within the container (0 to 1)
    const relativeX = (e.clientX - left) / containerWidth;
    const relativeY = (e.clientY - top) / containerHeight;

    // Calculate magnifier position
    const magnifierX = e.clientX - left - 50; // 50 is half the magnifier width
    const magnifierY = e.clientY - top - 50; // 50 is half the magnifier height

    // Ensure magnifier stays within bounds
    const boundedX = Math.max(0, Math.min(magnifierX, containerWidth - 100));
    const boundedY = Math.max(0, Math.min(magnifierY, containerHeight - 100));

    setMagnifierPosition({ x: boundedX, y: boundedY });

    // Update zoom position (percentage based)
    const zoomX = relativeX * 100;
    const zoomY = relativeY * 100;

    const zoomContainer = document.querySelector('.zoom-container') as HTMLDivElement;
    if (zoomContainer) {
      zoomContainer.style.backgroundPosition = `${zoomX}% ${zoomY}%`;
    }
  };

  return (
    <div className="relative">
      
        <div className="hidden md:block">
        {src ? (
          <div
            ref={containerRef}
            className="relative cursor-crosshair"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
          >
            <NoImage
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={className}
            />
            {isHovered && (
              <div
                className="absolute pointer-events-none border border-gray-300 rounded-sm bg-white bg-opacity-20"
                style={{
                  width: '100px',
                  height: '100px',
                  left: `${magnifierPosition.x}px`,
                  top: `${magnifierPosition.y}px`,
                }}
              />
            )}
            {isHovered && (
              <div
                className="bg-skin-base zoom-container absolute border border-gray-300 hidden md:block shadow-lg rounded-md overflow-hidden"
                style={{
                  width: '400px',
                  height: '400px',
                  left: '105%',
                  top: '-50px',
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
                  backgroundRepeat: 'no-repeat',
                  zIndex: 1000,
                }}
              />
            )}
          </div>
          ) : (
            <NoImage
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={className}
            />
          )}
        </div>
      
      <div className="md:hidden">
        <NoImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className + ' min-h-[230px]'}
        />
      </div>
    </div>
  );
};

export default CustomImageMagnifier; 