import { useTranslations } from 'next-intl';
import type { RestaurantAggregates } from '@/app/lib/types/restaurant';

interface ProsConsAggregatedProps {
  aggregates: RestaurantAggregates;
}

export default function ProsConsAggregated({ aggregates }: ProsConsAggregatedProps) {
  const t = useTranslations('restaurant.prosCons');
  const hasAny = aggregates.pros_top.length > 0 || aggregates.cons_top.length > 0;
  if (!hasAny) {
    return (
      <section className="rounded-3xl border border-dashed border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 text-center text-sm italic text-[var(--color-carbon-soft)]">
        {t('empty')}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 shadow-sm sm:p-8">
      <header className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)] sm:text-3xl">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
          {t('subtitle')}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-albahaca)]">
            {t('pros')}
          </h3>
          {aggregates.pros_top.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {aggregates.pros_top.map((p) => (
                <li
                  key={`pro-${p.text}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-albahaca-pale)] px-3 py-1 text-sm text-[var(--color-albahaca)]"
                >
                  <span aria-hidden>✓</span>
                  {p.text}
                  <span className="ml-1 rounded-full bg-white/60 px-1.5 text-xs font-semibold">
                    {p.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-[var(--color-carbon-soft)]">{t('noPros')}</p>
          )}
        </div>
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-paprika)]">
            {t('cons')}
          </h3>
          {aggregates.cons_top.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {aggregates.cons_top.map((c) => (
                <li
                  key={`con-${c.text}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-paprika-pale)] px-3 py-1 text-sm text-[var(--color-paprika)]"
                >
                  <span aria-hidden>!</span>
                  {c.text}
                  <span className="ml-1 rounded-full bg-white/60 px-1.5 text-xs font-semibold">
                    {c.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-[var(--color-carbon-soft)]">{t('noCons')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
