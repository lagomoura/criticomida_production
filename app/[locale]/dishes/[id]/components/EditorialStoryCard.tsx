import { useTranslations } from 'next-intl';

interface EditorialStoryCardProps {
  blurb: string;
  source?: string | null;
  dishName: string;
  restaurantName: string;
}

export default function EditorialStoryCard({
  blurb,
  source,
  dishName,
  restaurantName,
}: EditorialStoryCardProps) {
  const t = useTranslations('dish.editorial');
  if (!blurb) return null;
  const sourceMap: Record<string, string> = {
    claude: t('sourceClaude'),
    google: t('sourceGoogle'),
    manual: t('sourceManual'),
  };
  const attribution = source ? sourceMap[source] ?? t('sourceDefault') : t('sourceDefault');
  return (
    <section
      aria-label={t('ariaLabel', { dish: dishName, restaurant: restaurantName })}
      className="relative overflow-hidden rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] p-6 sm:p-8"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-[var(--color-azafran)]"
      />
      <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.2em] text-[var(--color-canela)]">
        {t('kicker')}
      </p>
      <blockquote className="mt-3 font-[family-name:var(--font-display)] text-xl italic leading-relaxed text-[var(--color-carbon)] sm:text-2xl">
        “{blurb}”
      </blockquote>
      <p className="mt-3 text-xs text-[var(--color-carbon-soft)]">{attribution}</p>
    </section>
  );
}
