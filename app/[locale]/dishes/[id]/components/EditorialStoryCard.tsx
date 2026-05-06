import { useTranslations } from 'next-intl';

interface EditorialStoryCardProps {
  blurb: string;
  origin?: string | null;
  dishName: string;
  restaurantName: string;
}

export default function EditorialStoryCard({
  blurb,
  origin,
  dishName,
  restaurantName,
}: EditorialStoryCardProps) {
  const t = useTranslations('dish.editorial');
  if (!blurb) return null;
  return (
    <section
      aria-label={t('ariaLabel', { dish: dishName, restaurant: restaurantName })}
      className="relative overflow-hidden rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] p-6 sm:p-8"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-[var(--color-azafran)]"
      />
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] leading-none">
        {origin ? (
          <span className="inline-flex items-center rounded-full bg-[var(--color-azafran)]/15 px-3 py-1.5 font-medium text-[var(--color-canela)]">
            {origin}
          </span>
        ) : null}
        <span className="font-[family-name:var(--font-display)] uppercase tracking-[0.2em] text-[var(--color-canela)]/70">
          {t('kicker')}
        </span>
      </header>
      <blockquote className="mt-5 font-[family-name:var(--font-display)] text-lg italic leading-relaxed text-[var(--color-carbon)] sm:text-xl">
        “{blurb}”
      </blockquote>
    </section>
  );
}
