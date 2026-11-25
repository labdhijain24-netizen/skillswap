import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, ArrowRightLeft, X } from 'lucide-react';
import { useToastList } from '../../context/ToastContext';
import { Sparkle } from './Doodles';

/**
 * Toast Container & Notification Item
 * Renders playful pastel toast notifications in the corner of the screen
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToastList();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const { title, message, type } = toast;

  const typeConfig = {
    success: {
      bg: 'bg-sage-soft border-sage-dark text-charcoal',
      icon: <CheckCircle2 className="w-5 h-5 text-charcoal flex-shrink-0" />,
      tag: 'Success',
      tagColor: 'bg-sage text-charcoal',
    },
    info: {
      bg: 'bg-lavender-soft border-lavender-dark text-charcoal',
      icon: <Info className="w-5 h-5 text-dusty flex-shrink-0" />,
      tag: 'Notice',
      tagColor: 'bg-lavender text-charcoal',
    },
    swap: {
      bg: 'bg-butter-soft border-butter-dark text-charcoal',
      icon: <ArrowRightLeft className="w-5 h-5 text-charcoal flex-shrink-0" />,
      tag: 'Skill Match',
      tagColor: 'bg-butter text-charcoal',
    },
    warning: {
      bg: 'bg-[#FFF2EE] border-[#FFBBA8] text-charcoal',
      icon: <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />,
      tag: 'Warning',
      tagColor: 'bg-[#FFE2D9] text-red-900',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`
        pointer-events-auto rounded-3xl p-4 border-2 shadow-pop-sm flex items-start gap-3
        ${config.bg}
      `}
    >
      <div className="p-1 rounded-xl bg-white/70 border border-charcoal/10 mt-0.5">
        {config.icon}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-sm font-bold font-serif text-charcoal leading-tight">
            {title}
          </h4>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${config.tagColor}`}>
            {config.tag}
          </span>
        </div>
        {message && (
          <p className="text-xs text-charcoal-muted leading-relaxed">
            {message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-black/5 text-charcoal-muted hover:text-charcoal transition"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
