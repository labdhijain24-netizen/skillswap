import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Editorial Input Component
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted font-sans"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-charcoal-subtle pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full rounded-2xl bg-white text-charcoal text-sm
            border-2 transition-all duration-150 outline-none
            placeholder:text-charcoal-subtle/70
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-charcoal/20 focus:border-charcoal focus:shadow-pop-sm'
            }
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-charcoal-subtle">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-charcoal-subtle">{helperText}</p>
      ) : null}
    </div>
  );
});

/**
 * Reusable Editorial Textarea Component
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className = '',
    id,
    rows = 4,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted font-sans"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={`
          w-full rounded-2xl bg-white text-charcoal text-sm
          border-2 transition-all duration-150 outline-none p-4
          placeholder:text-charcoal-subtle/70 resize-y
          ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-charcoal/20 focus:border-charcoal focus:shadow-pop-sm'
          }
          ${className}
        `}
        {...props}
      />

      {error ? (
        <p className="flex items-center gap-1 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-charcoal-subtle">{helperText}</p>
      ) : null}
    </div>
  );
});

/**
 * Reusable Editorial Select Component
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    className = '',
    id,
    children,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted font-sans"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-2xl bg-white text-charcoal text-sm
            border-2 transition-all duration-150 outline-none
            appearance-none px-4 py-2.5 pr-10
            ${
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-charcoal/20 focus:border-charcoal focus:shadow-pop-sm'
            }
            ${className}
          `}
          {...props}
        >
          {children || options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-subtle">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-charcoal-subtle">{helperText}</p>
      ) : null}
    </div>
  );
});
