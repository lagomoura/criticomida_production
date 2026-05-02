"use client";
import { useRouter } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function BackButton() {
  const router = useRouter();
  const t = useTranslations('common');
  return (
    <button
      type="button"
      className="btn btn-ghost mr-3"
      onClick={() => router.back()}
    >
      {t('backArrow')}
    </button>
  );
}
