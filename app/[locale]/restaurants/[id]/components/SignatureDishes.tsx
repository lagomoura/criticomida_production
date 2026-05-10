import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import type { SignatureDish } from '@/app/lib/types/restaurant';

interface SignatureDishesProps {
  items: SignatureDish[];
  totalDishes: number;
}

export default function SignatureDishes({ items, totalDishes }: SignatureDishesProps) {
  const t = useTranslations('restaurant.signature');
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] p-6 shadow-sm sm:p-8">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-espresso)] sm:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-espresso-soft)]">
            {t('subtitle')}
          </p>
        </div>
        {totalDishes > items.length && (
          <a
            href="?tab=platos#platos"
            className="shrink-0 text-sm font-semibold text-[var(--color-terracota)] no-underline hover:underline"
          >
            {t('viewAll', { count: totalDishes })}
          </a>
        )}
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((dish) => (
          <li key={dish.id}>
            <Link
              href={`/dishes/${dish.id}`}
              className="group flex h-full overflow-hidden rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] no-underline transition hover:border-[var(--color-terracota)]"
            >
              <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
                {dish.cover_image_url ? (
                  /^https?:\/\/[^/]*google/i.test(dish.cover_image_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dish.cover_image_url}
                      alt={dish.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={dish.cover_image_url}
                      alt={dish.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--color-terracota-deep)] text-3xl text-white/70">
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-medium text-[var(--color-espresso)] group-hover:text-[var(--color-terracota)]">
                    {dish.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span aria-hidden className="text-[var(--color-terracota)]">★</span>
                    <span className="font-semibold text-[var(--color-espresso)]">
                      {Number(dish.computed_rating).toFixed(1)}
                    </span>
                    <span className="text-[var(--color-espresso-soft)]">
                      · {dish.review_count === 1
                        ? t('reviewOne', { count: dish.review_count })
                        : t('reviewMany', { count: dish.review_count })}
                    </span>
                  </div>
                </div>
                {dish.best_quote && (
                  <blockquote className="mt-2 line-clamp-3 font-[family-name:var(--font-display)] text-sm italic text-[var(--color-espresso-mid)]">
                    “{dish.best_quote}”
                    {dish.best_quote_author && (
                      <span className="mt-1 block font-sans text-xs not-italic text-[var(--color-espresso-soft)]">
                        — {dish.best_quote_author}
                      </span>
                    )}
                  </blockquote>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
