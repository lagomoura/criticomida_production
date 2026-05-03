'use client';

import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
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
  type,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, helpText ? helpId : null].filter(Boolean).join(' ') || undefined;

  const t = useTranslations('common');
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);
  const effectiveType = isPassword && visible ? 'text' : type;

  const inputClassName = cn(
    'h-10 w-full rounded-md border bg-surface-card px-3 font-sans text-sm text-text-primary',
    'placeholder:text-text-muted',
    'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
    'disabled:cursor-not-allowed disabled:opacity-60',
    error ? 'border-action-danger' : 'border-border-default focus:border-action-primary',
    isPassword && 'pr-10',
  );

  const inputElement = (
    <input
      {...rest}
      id={inputId}
      type={effectiveType}
      disabled={disabled}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={inputClassName}
    />
  );

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
      {isPassword ? (
        <div className="relative">
          {inputElement}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            tabIndex={-1}
            aria-label={visible ? t('hidePassword') : t('showPassword')}
            aria-pressed={visible}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 leading-none',
              'text-text-muted/70 transition-colors',
              'hover:text-text-primary',
              'focus-visible:outline-none focus-visible:text-action-primary',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <FontAwesomeIcon
              icon={visible ? faEyeSlash : faEye}
              aria-hidden
              style={{ width: '1rem', height: '1rem' }}
            />
          </button>
        </div>
      ) : (
        inputElement
      )}
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
