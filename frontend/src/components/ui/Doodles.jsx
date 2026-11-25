import React from 'react';

/**
 * Organic, whimsical hand-drawn SVG doodles for SkillSwap
 * Used as accents, stickers, washi tape, and playful micro-decorations.
 */

export function Sparkle({ className = "w-6 h-6 text-butter", size = 24 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M12 0C12.5 6 18 11.5 24 12C18 12.5 12.5 18 12 24C11.5 18 6 12.5 0 12C6 11.5 11.5 6 12 0Z" />
    </svg>
  );
}

export function AsteriskDoodle({ className = "w-6 h-6 text-dusty", size = 24 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      fill="none" 
      className={className}
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="3.34" y1="7" x2="20.66" y2="17" />
      <line x1="3.34" y1="17" x2="20.66" y2="7" />
    </svg>
  );
}

export function Squiggle({ className = "w-24 h-3 text-lavender", strokeWidth = 3 }) {
  return (
    <svg 
      viewBox="0 0 100 12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        d="M2 6C15 1.5 22 10.5 35 6C48 1.5 55 10.5 68 6C81 1.5 88 10.5 98 6" 
        stroke="currentColor" 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

export function HandCircle({ className = "w-28 h-10 text-butter" }) {
  return (
    <svg 
      viewBox="0 0 140 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        d="M25 15C50 5 115 5 130 20C142 32 110 45 70 47C30 48 5 40 4 25C3 12 40 4 80 5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

export function TapeSticker({ color = "bg-butter/75", rotate = "-2deg", className = "" }) {
  return (
    <div 
      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 h-7 w-24 ${color} backdrop-blur-[1px] border border-charcoal/10 shadow-sm z-10 pointer-events-none rounded-[2px] ${className}`}
      style={{
        transform: `translateX(-50%) rotate(${rotate})`,
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    />
  );
}

export function CurvedArrow({ className = "w-12 h-12 text-dusty" }) {
  return (
    <svg 
      viewBox="0 0 50 50" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M10 40C20 30 35 32 38 18" />
      <path d="M30 15L38 18L40 27" />
    </svg>
  );
}
