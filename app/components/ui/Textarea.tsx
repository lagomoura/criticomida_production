'use client';

import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/app/lib/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  hideLabel?: boolean;
  /** Max length shown as counter next to the label. */
  maxLength?: number;
  /** Current value length; when provided, displays a "{n}/{max}" indicator. */
  valueLength?: number;
}

export default function Textarea({
  label,
  error,
  helpText,
  hideLabel = false,
  maxLength,
  valueLength,
  id,
  className,
  disabled,
  required,
  rows = 4,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(' ') || undefined;
  const showCounter = typeof maxLength === 'number' && typeof valueLength === 'number';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
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
          {showCounter && (
            <span className="font-sans text-xs tabular-nums text-text-muted">
              {valueLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        {...rest}
        id={inputId}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'rounded-md border bg-surface-card px-3 py-2 font-sans text-sm leading-relaxed text-text-primary',
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
