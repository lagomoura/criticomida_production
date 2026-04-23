'use client';

import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  /** Hides the label visually but keeps it available to screen readers. */
  hideLabel?: boolean;
}

export default function Input({
  label,
  error,
  helpText,
  hideLabel = false,
  id,
  className,
  disabled,
  required,
  ...rest
}: InputProps) {
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
      <input
        {...rest}
        id={inputId}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-10 rounded-md border bg-surface-card px-3 font-sans text-sm text-text-primary',
          'placeholder:text-text-muted',
          'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-action-danger' : 'border-border-default focus:border-action-primary',
        )}
      />
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
