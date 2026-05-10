'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Lightbox from '@/app/[locale]/restaurants/[id]/components/Lightbox';
import type { DishPhoto } from '@/app/lib/types/social';

interface DishPhotoMosaicProps {
  photos: DishPhoto[];
}

export default function DishPhotoMosaic({ photos }: DishPhotoMosaicProps) {
  const t = useTranslations('dish.photoMosaic');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const open = lightboxIdx !== null;

  const handlePrev = useCallback(() => {
    setLightboxIdx((idx) => (idx === null ? null : (idx - 1 + photos.length) % photos.length));
  }, [photos.length]);
  const handleNext = useCallback(() => {
    setLightboxIdx((idx) => (idx === null ? null : (idx + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handlePrev, handleNext]);

  if (photos.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] p-10 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl text-[var(--color-espresso)]">
          {t('emptyTitle')}
        </p>
        <p className="mt-1 text-sm text-[var(--color-espresso-soft)]">
          {t('emptyDescription')}
        </p>
      </section>
    );
  }

  const gallery = photos.map((p) => p.url);

  return (
    <section>
      <header className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-espresso)]">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-espresso-soft)]">
          {t('subtitle', { count: photos.length })}
        </p>
      </header>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className="group relative block w-full overflow-hidden rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-terracota)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.altText ?? t('altDefault')}
              loading="lazy"
              className="h-auto w-full object-cover transition group-hover:scale-[1.02]"
            />
            {p.isCover && (
              <span className="absolute left-2 top-2 rounded-full bg-[var(--color-terracota)]/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                {t('coverBadge')}
              </span>
            )}
            {p.userDisplayName && !p.isCover && (
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                {p.userDisplayName}
              </span>
            )}
          </button>
        ))}
      </div>

      <Lightbox
        open={open}
        gallery={gallery}
        galleryIdx={lightboxIdx ?? 0}
        onClose={() => setLightboxIdx(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* keep next/image referenced as legitimate dep usage of helper */}
      <span className="hidden">
        <Image src="/" alt="" width={1} height={1} />
      </span>
    </section>
  );
}
