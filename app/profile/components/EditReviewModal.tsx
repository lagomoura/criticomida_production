'use client';

import React, { useState } from 'react';
import { MyReview, UpdateReviewRequest, PortionSize } from '@/app/lib/types';
import { updateReview } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import StarRating from '@/app/restaurants/[id]/components/StarRating';

interface EditReviewModalProps {
  review: MyReview;
  onSuccess: (updated: MyReview) => void;
  onClose: () => void;
}

export default function EditReviewModal({ review, onSuccess, onClose }: EditReviewModalProps) {
  const [rating, setRating] = useState(review.rating);
  const [note, setNote] = useState(review.note);
  const [dateTasted, setDateTasted] = useState(review.date_tasted);
  const [wouldOrderAgain, setWouldOrderAgain] = useState<boolean | null>(review.would_order_again);
  const [portionSize, setPortionSize] = useState<PortionSize | ''>(review.portion_size ?? '');
  const [visitedWith, setVisitedWith] = useState(review.visited_with ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data: UpdateReviewRequest = {
        rating,
        note: note.trim(),
        date_tasted: dateTasted,
        would_order_again: wouldOrderAgain ?? undefined,
        portion_size: portionSize || undefined,
        visited_with: visitedWith.trim() || undefined,
      };
      const updated = await updateReview(review.id, data);
      onSuccess({ ...review, ...updated });
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Error al guardar los cambios.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {review.restaurant_name}
            </p>
            <h2 className="text-lg font-bold text-neutral-900">{review.dish_name}</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="alert alert-danger text-sm">{error}</div>
          )}

          <div>
            <label className="form-label">Puntaje</label>
            <div className="mt-1">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="edit-note">Nota</label>
            <textarea
              id="edit-note"
              className="form-control mt-1 w-full"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="edit-date">Fecha</label>
              <input
                id="edit-date"
                type="date"
                className="form-control mt-1 w-full"
                value={dateTasted}
                onChange={(e) => setDateTasted(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="edit-portion">Porción</label>
              <select
                id="edit-portion"
                className="form-select mt-1 w-full"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value as PortionSize | '')}
              >
                <option value="">Sin especificar</option>
                <option value="small">Chica</option>
                <option value="medium">Mediana</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">¿Lo pedirías de nuevo?</label>
              <div className="mt-2 flex gap-3">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setWouldOrderAgain(wouldOrderAgain === val ? null : val)}
                    className={
                      'rounded-xl border-2 px-4 py-1.5 text-sm font-semibold transition-colors ' +
                      (wouldOrderAgain === val
                        ? val
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-red-400 bg-red-50 text-red-600'
                        : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300')
                    }
                  >
                    {val ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label" htmlFor="edit-visited">Fui con</label>
              <input
                id="edit-visited"
                type="text"
                className="form-control mt-1 w-full"
                placeholder="Ej: familia, amigos…"
                value={visitedWith}
                onChange={(e) => setVisitedWith(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-light" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
