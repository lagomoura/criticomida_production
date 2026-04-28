import Image from 'next/image';
import Link from 'next/link';
import type { SignatureDish } from '@/app/lib/types/restaurant';

interface SignatureDishesProps {
  items: SignatureDish[];
  totalDishes: number;
}

export default function SignatureDishes({ items, totalDishes }: SignatureDishesProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 shadow-sm sm:p-8">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)] sm:text-3xl">
            Platos firma
          </h2>
          <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
            Los favoritos de la comunidad por puntaje y volumen de reseñas.
          </p>
        </div>
        {totalDishes > items.length && (
          <a
            href="?tab=platos#platos"
            className="shrink-0 text-sm font-semibold text-[var(--color-azafran)] no-underline hover:underline"
          >
            Ver los {totalDishes} platos →
          </a>
        )}
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((dish) => (
          <li key={dish.id}>
            <Link
              href={`/dishes/${dish.id}`}
              className="group flex h-full overflow-hidden rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] no-underline transition hover:border-[var(--color-azafran)]"
            >
              <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
                {dish.cover_image_url ? (
                  // Las URLs de Google (lh3.googleusercontent.com / Places)
                  // suelen romper next/image (302 a hosts variables, sin
                  // dimensiones). Plain <img> es lo que ya hace HeroV2.
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
                  <div className="flex h-full w-full items-center justify-center bg-[var(--color-canela)] text-3xl text-white/70">
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-medium text-[var(--color-carbon)] group-hover:text-[var(--color-azafran)]">
                    {dish.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span aria-hidden className="text-[var(--color-azafran)]">★</span>
                    <span className="font-semibold text-[var(--color-carbon)]">
                      {Number(dish.computed_rating).toFixed(1)}
                    </span>
                    <span className="text-[var(--color-carbon-soft)]">
                      · {dish.review_count} {dish.review_count === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  </div>
                </div>
                {dish.best_quote && (
                  <blockquote className="mt-2 line-clamp-3 font-[family-name:var(--font-display)] text-sm italic text-[var(--color-carbon-mid)]">
                    “{dish.best_quote}”
                    {dish.best_quote_author && (
                      <span className="mt-1 block font-sans text-xs not-italic text-[var(--color-carbon-soft)]">
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
