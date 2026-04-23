'use client';

import { useId } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/app/lib/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  hideLabel?: boolean;
  /** The `<option>` children. Can include grouped `<optgroup>`. */
  children: ReactNode;
}

export default function Select({
  label,
  error,
  helpText,
  hideLabel = false,
  id,
  className,
  disabled,
  required,
  children,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'font-sans text-sm font-medium text-text-secondary',
            hideLabel && 'sr-only',
          )}
        >
          {label}
          {required && <span aria-hidden className="ml-0.5 text-action-danger">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          {...rest}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full appearance-none rounded-md border bg-surface-card pl-3 pr-8 font-sans text-sm text-text-primary',
            'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-action-danger' : 'border-border-default focus:border-action-primary',
          )}
        >
          {children}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted"
        >
          ▾
        </span>
      </div>
      {helpText && !error && (
        <span id={helpId} className="font-sans text-xs text-text-muted">
          {helpText}
        </span>
      )}
      {error && (
        <span id={errorId} className="font-sans text-xs text-action-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
