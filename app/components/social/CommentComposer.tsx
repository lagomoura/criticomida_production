'use client';

import { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import MentionTextarea from '@/app/components/social/MentionTextarea';

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
  placeholder,
}: CommentComposerProps) {
  const t = useTranslations('social.commentComposer');
  const effectivePlaceholder = placeholder ?? t('placeholder');
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
        <MentionTextarea
          label={effectivePlaceholder}
          hideLabel
          placeholder={effectivePlaceholder}
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
          error={error}
          maxLength={maxLength}
          valueLength={value.length}
          rows={2}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" loading={loading} disabled={!canSubmit}>
            {t('submit')}
          </Button>
        </div>
      </div>
    </form>
  );
}
