'use client';

import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';

export interface FollowButtonProps {
  userId: string;
  following: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onToggle: (userId: string, next: boolean) => void;
}

export default function FollowButton({
  userId,
  following,
  loading = false,
  disabled = false,
  size = 'md',
  onToggle,
}: FollowButtonProps) {
  const t = useTranslations('social.follow');
  return (
    <Button
      variant={following ? 'secondary' : 'primary'}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={() => onToggle(userId, !following)}
      aria-pressed={following}
    >
      {following ? t('following') : t('follow')}
    </Button>
  );
}
