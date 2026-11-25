import React from 'react';
import { Sparkle } from './Doodles';

/**
 * Reusable Whimsical Pastel Badge / Tag Component
 */
export default function Badge({
  children,
  variant = 'butter',
  size = 'sm',
  icon,
  dot = false,
  withSparkle = false,
  className = '',
  ...props
}) {
  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.5 rounded-full font-semibold",
    sm: "text-xs px-2.5 py-1 rounded-full font-semibold gap-1",
    md: "text-sm px-3.5 py-1.5 rounded-2xl font-semibold gap-1.5",
  };

  const variantStyles = {
    butter: "bg-butter text-charcoal border border-charcoal/20 shadow-[1px_1px_0px_#34313B]",
    lavender: "bg-lavender text-charcoal border border-charcoal/20 shadow-[1px_1px_0px_#34313B]",
    sage: "bg-sage text-charcoal border border-charcoal/20 shadow-[1px_1px_0px_#34313B]",
    dusty: "bg-dusty text-white border border-charcoal/30 shadow-[1px_1px_0px_#34313B]",
    ivory: "bg-white text-charcoal border border-charcoal/20 shadow-[1px_1px_0px_#34313B]",
    charcoal: "bg-charcoal text-ivory border border-charcoal shadow-[1px_1px_0px_#34313B]",
    outline: "bg-transparent text-charcoal border-1.5 border-charcoal/40",
  };

  return (
    <span
      className={`inline-flex items-center justify-center transition select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse mr-1" />
      )}
      {withSparkle && (
        <Sparkle className="w-2.5 h-2.5 mr-0.5 text-current" size={10} />
      )}
      {icon && <span className="mr-0.5 flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
