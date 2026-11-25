import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Sparkle, TapeSticker } from './Doodles';

/**
 * Reusable Whimsical Modal Component
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
  withTape = true,
  tapeColor = 'bg-lavender/85',
}) {
  // Lock background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`
              relative w-full ${maxWidth} bg-white rounded-4xl p-6 sm:p-8
              border-2 border-charcoal shadow-pop-lg z-10 my-8
            `}
          >
            {withTape && <TapeSticker color={tapeColor} rotate="-1deg" />}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-ivory hover:bg-butter text-charcoal border-2 border-charcoal shadow-pop-sm active:translate-y-0.5 transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            {(title || subtitle) && (
              <div className="mb-6 pr-8">
                {title && (
                  <h3 className="text-2xl font-bold font-serif text-charcoal flex items-center gap-2">
                    <span>{title}</span>
                    <Sparkle className="w-4 h-4 text-butter" size={16} />
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Body */}
            <div className="space-y-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="mt-8 pt-4 border-t border-charcoal/10 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
