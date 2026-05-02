import { useTranslations } from 'next-intl';
import type { DishDiaryStats } from '@/app/lib/types/social';

interface DishDiaryPulseProps {
  diary: DishDiaryStats;
  dishName: string;
}

function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function DishDiaryPulse({ diary, dishName }: DishDiaryPulseProps) {
  const t = useTranslations('dish.diary');
  const { uniqueEaters, reviewsTotal, reviewsLast7d, recentEaters } = diary;
  if (reviewsTotal === 0) return null;

  return (
    <section className="rounded-3xl bg-[var(--color-carbon)] p-6 text-white sm:p-8">
      <header className="mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-white/70">
          {t('subtitle', { dish: dishName })}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/60">{t('ate')}</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-medium tabular-nums">
            {uniqueEaters}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/60">{t('totalReviews')}</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-medium tabular-nums">
            {reviewsTotal}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--color-azafran)]/20 p-4 ring-1 ring-[var(--color-azafran)]/40">
          <p className="text-xs uppercase tracking-wider text-[var(--color-azafran)]">
            {t('last7Days')}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-medium tabular-nums text-[var(--color-azafran)]">
            {reviewsLast7d}
          </p>
        </div>
      </div>

      {recentEaters.length > 0 && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-white/60">{t('recentEaters')}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recentEaters.map((u) => (
              <li
                key={u.id}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs"
              >
                {u.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.avatarUrl}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-azafran)]/30 text-[10px] font-semibold text-[var(--color-azafran)]">
                    {initials(u.displayName)}
                  </span>
                )}
                <span>{u.displayName ?? t('anonymous')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
