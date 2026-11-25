import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Tactile Button Component
 * Designed with playful micro-interactions and tactile pop shadows.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-2xl transition-colors duration-150 relative select-none disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5 rounded-xl font-medium",
    md: "text-sm px-5 py-2.5 gap-2 rounded-2xl",
    lg: "text-base px-6 py-3.5 gap-2.5 rounded-3xl",
  };

  const variantStyles = {
    // Charcoal primary with tactile pop
    primary: "bg-charcoal text-ivory hover:bg-charcoal-light shadow-pop-sm hover:shadow-pop active:shadow-none border-2 border-charcoal",
    // Butter yellow joyful accent
    secondary: "bg-butter text-charcoal hover:bg-butter-dark shadow-pop-sm hover:shadow-pop active:shadow-none border-2 border-charcoal",
    // Lavender dream accent
    lavender: "bg-lavender text-charcoal hover:bg-lavender-dark shadow-pop-sm hover:shadow-pop active:shadow-none border-2 border-charcoal",
    // Sage calming organic
    sage: "bg-sage text-charcoal hover:bg-sage-dark shadow-pop-sm hover:shadow-pop active:shadow-none border-2 border-charcoal",
    // Dusty purple creative
    dusty: "bg-dusty text-white hover:bg-dusty-dark shadow-pop-sm hover:shadow-pop active:shadow-none border-2 border-charcoal",
    // Outline with tactile shadow
    outline: "bg-white text-charcoal border-2 border-charcoal shadow-pop-sm hover:bg-ivory hover:shadow-pop active:shadow-none",
    // Gentle ghost
    ghost: "bg-transparent text-charcoal hover:bg-lavender/30 active:bg-lavender/50",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={disabled || isLoading ? {} : { y: -2 }}
      whileTap={disabled || isLoading ? {} : { y: 1, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
}
