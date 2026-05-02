import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchPublicList } from '@/app/lib/api/lists';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'lists' });
  const list = await fetchPublicList(slug).catch(() => null);
  if (!list) return { title: t('metaFallbackTitle') };
  return {
    title: t('metaTitle', { name: list.name }),
    description:
      list.description || t('metaDescription', { count: list.items.length }),
    openGraph: {
      title: list.name,
      description:
        list.description || t('metaOgDescription', { count: list.items.length }),
      type: 'article',
    },
  };
}

export default async function DishListPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const list = await fetchPublicList(slug);
  if (!list) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'lists' });

  return (
    <main id="main-content" className="cc-container py-10 md:py-14">
      <header className="mb-8 flex flex-col gap-3">
        <span className="text-xs uppercase tracking-wide text-action-primary">
          {t('routeLabel')}
        </span>
        <h1 className="font-display text-3xl font-medium text-text-primary md:text-4xl">
          {list.name}
        </h1>
        {list.description && (
          <p className="max-w-2xl text-base leading-relaxed text-text-muted">
            {list.description}
          </p>
        )}
        <div className="text-xs text-text-muted">
          {list.owner_display_name
            ? t('byOwner', {
                owner: list.owner_display_name,
                count: list.items.length,
              })
            : t('itemCount', { count: list.items.length })}
        </div>
      </header>

      <ol className="flex flex-col gap-3">
        {list.items.map((item, idx) => (
          <li
            key={item.dish_id}
            className="flex gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 transition-shadow hover:shadow-[var(--shadow-elevated)]"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-2xl font-medium text-action-primary">
                {idx + 1}
              </span>
            </div>

            <Link
              href={`/${locale}/dishes/${item.dish_id}`}
              className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-subtle"
            >
              {item.dish_cover_image_url ? (
                <Image
                  src={item.dish_cover_image_url}
                  alt={item.dish_name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">
                  —
                </div>
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link
                href={`/${locale}/dishes/${item.dish_id}`}
                className="font-display text-lg font-medium text-text-primary hover:text-action-primary"
              >
                {item.dish_name}
              </Link>
              <Link
                href={`/${locale}/restaurants/${item.restaurant_slug}`}
                className="text-sm text-text-muted hover:text-text-primary"
              >
                {item.restaurant_name} · {item.restaurant_location_name}
              </Link>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                {item.dish_rating !== null && (
                  <span className="rounded-full bg-action-highlight/20 px-2 py-0.5 font-medium text-text-primary">
                    ★ {item.dish_rating.toFixed(1)}
                  </span>
                )}
                {item.dish_price_tier && (
                  <span className="rounded-md bg-surface-subtle px-1.5 py-0.5">
                    {item.dish_price_tier}
                  </span>
                )}
                <span className="rounded-md bg-surface-subtle px-1.5 py-0.5">
                  {t('reviewCount', { count: item.dish_review_count })}
                </span>
              </div>
              {item.note && (
                <p className="mt-1 text-sm leading-relaxed text-text-primary">
                  {item.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
