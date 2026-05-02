'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface PhotoGalleryProps {
  gallery: string[];
  galleryIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenLightbox: () => void;
}

export default function PhotoGallery({
  gallery,
  galleryIdx,
  onPrev,
  onNext,
  onOpenLightbox,
}: PhotoGalleryProps) {
  const t = useTranslations('restaurant.photoGallery');
  if (gallery.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 w-full">
      <div className="cc-card mb-3 shadow-sm">
        <div className="cc-card-body">
          <h5 className="card-title mb-2">{t('title')}</h5>
          <div className="flex items-center justify-center gap-3">
            <button
              className="btn btn-light btn-sm"
              type="button"
              onClick={onPrev}
              aria-label={t('prevPhoto')}
            >
              ‹
            </button>
            <Image
              src={gallery[galleryIdx]}
              alt={t('altPhoto', { idx: galleryIdx + 1, total: gallery.length })}
              className="gallery-thumb max-h-[260px] max-w-[400px] cursor-pointer rounded object-cover shadow"
              width={400}
              height={300}
              onClick={onOpenLightbox}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onOpenLightbox();
                }
              }}
            />
            <button
              className="btn btn-light btn-sm"
              type="button"
              onClick={onNext}
              aria-label={t('nextPhoto')}
            >
              ›
            </button>
          </div>
          <div className="mt-2 text-center text-sm text-neutral-600">
            {galleryIdx + 1} / {gallery.length}
          </div>
        </div>
      </div>
    </div>
  );
}
