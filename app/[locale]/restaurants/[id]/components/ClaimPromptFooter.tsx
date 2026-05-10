import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';

interface ClaimPromptFooterProps {
  restaurantSlug: string;
  isClaimed: boolean;
  viewerIsOwner?: boolean;
}

export default function ClaimPromptFooter({
  restaurantSlug,
  isClaimed,
  viewerIsOwner = false,
}: ClaimPromptFooterProps) {
  const t = useTranslations('restaurant.claimFooter');

  if (viewerIsOwner) {
    return (
      <aside
        className="mt-8 flex flex-col items-center gap-1 rounded-2xl border border-[var(--color-dorado-pale)] bg-[var(--color-dorado)]/10 px-4 py-5 text-center"
        aria-labelledby="owner-panel-title"
      >
        <p
          id="owner-panel-title"
          className="font-sans text-sm text-[var(--color-dorado)]"
        >
          {t('ownerLine')}
        </p>
        <Link
          href={`/restaurants/${restaurantSlug}/owner`}
          className="font-sans text-sm font-semibold text-[var(--color-dorado)] no-underline hover:underline"
        >
          {t('ownerCta')}
        </Link>
      </aside>
    );
  }

  if (isClaimed) {
    return null;
  }

  return (
    <aside
      className="mt-8 flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] px-4 py-5 text-center"
      aria-labelledby="claim-prompt-title"
    >
      <p
        id="claim-prompt-title"
        className="font-sans text-sm text-text-muted"
      >
        {t('promptLine')}
      </p>
      <Link
        href={`/restaurants/${restaurantSlug}/claim`}
        className="font-sans text-sm font-semibold text-[var(--color-terracota-deep)] no-underline hover:underline"
      >
        {t('promptCta')}
      </Link>
    </aside>
  );
}
