'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface LightboxProps {
  open: boolean;
  gallery: string[];
  galleryIdx: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  open,
  gallery,
  galleryIdx,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const t = useTranslations('restaurant.lightbox');
  if (!open) {
    return null;
  }

  return (
    <div
      className={
        'lightbox-modal fixed inset-0 z-[2000] flex items-center ' +
        'justify-center overflow-y-auto overflow-x-hidden bg-black/90 p-4'
      }
      role="dialog"
      aria-modal="true"
    >
      <button
        className="btn btn-light absolute right-3 top-3 z-[2001] md:right-4 md:top-4"
        type="button"
        onClick={onClose}
        aria-label={t('close')}
      >
        ✕
      </button>
      <button
        className={
          'btn btn-light absolute left-2 top-1/2 z-[2001] -translate-y-1/2 ' +
          'md:left-4'
        }
        type="button"
        onClick={onPrev}
        aria-label={t('prevPhoto')}
      >
        ‹
      </button>
      <div className="flex max-h-[85vh] max-w-[min(100vw-2rem,56rem)] items-center justify-center">
        <Image
          src={gallery[galleryIdx]}
          alt={t('altPhoto', { idx: galleryIdx + 1, total: gallery.length })}
          className={
            'h-auto max-h-[80vh] w-auto max-w-full rounded-lg bg-neutral-800 ' +
            'object-contain shadow-lg'
          }
          width={800}
          height={600}
        />
      </div>
      <button
        className={
          'btn btn-light absolute right-2 top-1/2 z-[2001] -translate-y-1/2 ' +
          'md:right-4'
        }
        type="button"
        onClick={onNext}
        aria-label={t('nextPhoto')}
      >
        ›
      </button>
      <div
        className={
          'absolute bottom-4 left-1/2 -translate-x-1/2 text-base ' +
          'text-white shadow-[0_2px_8px_rgba(26,22,20,0.6)]'
        }
      >
        {galleryIdx + 1} / {gallery.length}
      </div>
    </div>
  );
}
