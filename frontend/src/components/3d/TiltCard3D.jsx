import React, { useRef, useState, useEffect } from 'react';

/**
 * TiltCard3D
 * 
 * Provides an interactive 3D perspective tilt effect with realistic specular glare,
 * dynamic depth (transform-style: preserve-3d), and smooth spring easing.
 * Supports child elements floating at varying Z-depths (e.g., translateZ(25px)).
 */
export default function TiltCard3D({
  children,
  className = '',
  maxTilt = 8,
  glare = true,
  scale = 1.02,
  perspective = 1000,
  interactive = true,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    // Relative -1 to 1 coordinates
    const relativeX = (x / width) * 2 - 1;
    const relativeY = (y / height) * 2 - 1;

    setCoords({
      x: relativeX,
      y: relativeY,
    });

    setGlarePosition({
      x: (x / width) * 100,
      y: (y / height) * 100,
    });
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
      setCoords({ x: 0, y: 0 });
    }
  };

  const rotateX = isHovered ? -coords.y * maxTilt : 0;
  const rotateY = isHovered ? coords.x * maxTilt : 0;
  const currentScale = isHovered ? scale : 1;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${currentScale}, ${currentScale}, ${currentScale})`,
      }}
      {...props}
    >
      {/* 3D Card Content Container */}
      <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {/* Dynamic Specular Light Glare Overlay */}
      {glare && isHovered && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 overflow-hidden z-20"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(200, 182, 246, 0.22) 0%, rgba(245, 222, 145, 0.12) 35%, transparent 70%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
}
