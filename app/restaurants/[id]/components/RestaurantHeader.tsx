import Link from 'next/link';

interface RestaurantHeaderProps {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  backHref: string;
  backLabel: string;
}

export default function RestaurantHeader({
  name,
  location,
  rating,
  reviewCount,
  description,
  backHref,
  backLabel,
}: RestaurantHeaderProps) {
  return (
    <>
      <div
        className={
          'mb-4 flex flex-col gap-3 sm:flex-row sm:items-start ' +
          'sm:items-center sm:gap-4'
        }
      >
        <Link
          href={backHref}
          className={
            'back-main-btn inline-flex w-full shrink-0 items-center ' +
            'justify-center gap-2 rounded-lg px-4 py-2 text-base ' +
            'font-bold no-underline sm:w-auto sm:py-2'
          }
        >
          <span className="text-xl leading-none" aria-hidden>
            ←
          </span>
          <span className="text-balance">Volver a&nbsp;{backLabel}</span>
        </Link>
        <h1
          className={
            'mb-0 min-w-0 flex-1 text-balance text-3xl font-bold ' +
            'text-neutral-900 md:text-4xl lg:text-5xl'
          }
        >
          {name}
        </h1>
      </div>
      <div
        className={
          'mb-2 flex flex-wrap items-center gap-2 md:gap-3'
        }
      >
        <span className="rounded bg-amber-400 px-2 py-1 text-sm font-medium text-neutral-900">
          {location}
        </span>
        <span className="rounded bg-emerald-600 px-2 py-1 text-sm font-medium text-white">
          ★ {rating.toFixed(1)}
        </span>
        <span className="rounded bg-neutral-500 px-2 py-1 text-sm font-medium text-white">
          {reviewCount} reseñas
        </span>
      </div>
      <p className="mb-2 text-lg leading-relaxed text-neutral-600">
        {description}
      </p>
    </>
  );
}
