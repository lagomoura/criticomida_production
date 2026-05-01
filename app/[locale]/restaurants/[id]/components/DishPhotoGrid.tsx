'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface DishPhoto {
  url: string;
  dish_name: string;
  user_display_name: string | null;
  alt_text: string | null;
}

interface DishPhotoGridProps {
  photos: DishPhoto[];
  onOpenLightbox: (index: number) => void;
}

const INITIAL_VISIBLE = 12;

export default function DishPhotoGrid({ photos, onOpenLightbox }: DishPhotoGridProps) {
  const [expanded, setExpanded] = useState(false);

  if (photos.length === 0) return null;

  const visible = expanded ? photos : photos.slice(0, INITIAL_VISIBLE);
  const hidden = photos.length - INITIAL_VISIBLE;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          Fotos de los platos
          <span className="ml-2 text-base font-normal text-neutral-400">({photos.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((photo, idx) => (
          <button
            key={`${photo.url}-${idx}`}
            type="button"
            className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mainPink)]"
            onClick={() => onOpenLightbox(idx)}
            aria-label={`Ver foto de ${photo.dish_name}`}
          >
            <Image
              src={photo.url}
              alt={photo.alt_text ?? photo.dish_name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <p className="truncate text-xs font-semibold text-white leading-tight">
                {photo.dish_name}
              </p>
              {photo.user_display_name && (
                <p className="truncate text-[10px] text-white/75 leading-tight">
                  por {photo.user_display_name}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {!expanded && hidden > 0 && (
        <button
          type="button"
          className="btn btn-light btn-sm mt-3"
          onClick={() => setExpanded(true)}
        >
          Ver las {hidden} fotos restantes
        </button>
      )}
      {expanded && photos.length > INITIAL_VISIBLE && (
        <button
          type="button"
          className="btn btn-ghost btn-sm mt-3 text-neutral-500"
          onClick={() => setExpanded(false)}
        >
          Ver menos
        </button>
      )}
    </section>
  );
}
