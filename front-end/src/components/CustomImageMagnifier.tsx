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
  zoomLevel = 2
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / containerWidth) * 100;
    const y = ((e.clientY - top) / containerHeight) * 100;

    setPosition({ x, y });
    setCursorPosition({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div className="relative">
      {
        src ? (
          <div className="hidden md:block">
            <div
              ref={containerRef}
              className="relative "
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
                  className="absolute pointer-events-none border-2 border-white rounded-full bg-white bg-opacity-20"
                  style={{
                    width: '100px',
                    height: '100px',
                    left: `${cursorPosition.x - 20}px`,
                    top: `${cursorPosition.y - 30}px`,
                    transform: 'translate(-20%, -30%)',
                  }}
                />
              )}
              {isHovered && (
                <div
                  className="absolute border-2 border-gray-300 hidden md:block shadow-lg rounded-md overflow-hidden"
                  style={{
                    width: '300px',
                    height: '300px',
                    left: '100%',
                    top: 0,
                    backgroundImage: `url(${src})`,
                    backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
                    backgroundPosition: `${position.x}% ${position.y}%`,
                    backgroundRepeat: 'no-repeat',
                    zIndex: 10,
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <NoImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
          />)
      }
      <div className="md:hidden">
        <NoImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      </div>
    </div>
  );
};

export default CustomImageMagnifier; 