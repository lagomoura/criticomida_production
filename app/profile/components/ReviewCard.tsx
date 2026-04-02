'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MyReview } from '@/app/lib/types';
import { deleteReview } from '@/app/lib/api/reviews';
import StarRating from '@/app/restaurants/[id]/components/StarRating';

interface ReviewCardProps {
  review: MyReview;
  onEdit: (review: MyReview) => void;
  onDeleted: (reviewId: string) => void;
}

export default function ReviewCard({ review, onEdit, onDeleted }: ReviewCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteReview(review.id);
      onDeleted(review.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="cc-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {review.restaurant_name}
          </p>
          <h3 className="mt-0.5 truncate text-base font-bold text-neutral-900">
            {review.dish_name}
          </h3>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{review.note}</p>

      <p className="mt-2 text-xs text-neutral-400">
        {new Date(review.date_tasted).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/restaurants/${review.restaurant_slug}`}
          className="btn btn-sm btn-outline-primary text-xs"
        >
          Ver restaurante
        </Link>
        <button
          type="button"
          className="btn btn-sm btn-light text-xs"
          onClick={() => onEdit(review)}
        >
          Editar
        </button>
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">¿Seguro?</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger text-xs"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost text-xs"
              onClick={() => setConfirming(false)}
              disabled={deleting}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-ghost text-xs text-red-500 hover:bg-red-50"
            onClick={() => setConfirming(true)}
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
