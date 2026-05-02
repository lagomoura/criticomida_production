'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plate } from '@/app/lib/types';
import PlateCard from './PlateCard';

interface PlateGalleryProps {
  plates: Plate[];
  favorites: { [idx: number]: boolean };
  gridImgIdx: { [idx: number]: number };
  onToggleFav: (idx: number) => void;
  onChangeImgIdx: (idx: number, newImgIdx: number) => void;
  onOpenModal: () => void;
}

export default function PlateGallery({
  plates,
  favorites,
  gridImgIdx,
  onToggleFav,
  onChangeImgIdx,
  onOpenModal,
}: PlateGalleryProps) {
  const t = useTranslations('restaurant.plateGallery');
  return (
    <div className="mb-4 w-full">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="mb-0 text-xl font-semibold text-neutral-900">
          {t('title')}
        </h3>
        <button
          className={
            'btn btn-gradient btn-lg flex items-center gap-2 rounded-full ' +
            'px-4 py-2 text-base font-bold shadow opacity-90'
          }
          type="button"
          onClick={onOpenModal}
        >
          <span className="text-xl" aria-hidden>
            🍽️
          </span>
          {t('addDish')}
        </button>
      </div>
      {plates.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-2 text-6xl" aria-hidden>
            📖🍽️
          </div>
          <h5 className="text-muted">
            {t('emptyTitle')}
          </h5>
          <p className="text-secondary">
            {t('emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plates.map((plate: Plate, idx: number) => (
            <PlateCard
              key={idx}
              plate={plate}
              idx={idx}
              isFav={!!favorites[idx]}
              imgIdx={gridImgIdx[idx] ?? 0}
              onToggleFav={onToggleFav}
              onChangeImgIdx={onChangeImgIdx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
