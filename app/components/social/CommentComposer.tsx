'use client';

import { FormEvent } from 'react';
import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import Textarea from '@/app/components/ui/Textarea';

export interface CommentComposerProps {
  viewerName: string;
  viewerAvatarUrl?: string | null;
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  maxLength?: number;
  placeholder?: string;
}

export default function CommentComposer({
  viewerName,
  viewerAvatarUrl,
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  error,
  maxLength = 500,
  placeholder = 'Escribí un comentario…',
}: CommentComposerProps) {
  const canSubmit = value.trim().length > 0 && !disabled && !loading;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <Avatar src={viewerAvatarUrl} name={viewerName} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Textarea
          label={placeholder}
          hideLabel
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          error={error}
          maxLength={maxLength}
          valueLength={value.length}
          rows={2}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" loading={loading} disabled={!canSubmit}>
            Publicar
          </Button>
        </div>
      </div>
    </form>
  );
}
