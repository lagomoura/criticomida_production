'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createDish } from '@/app/lib/api/dishes';
import { ApiError } from '@/app/lib/api/client';
import { Dish, DishReview, PriceTier } from '@/app/lib/types';
import DishReviewForm from './DishReviewForm';

interface AddDishModalProps {
  show: boolean;
  restaurantSlug: string;
  onClose: () => void;
  onDishCreated: (dish: Dish, review?: DishReview) => void;
}

export default function AddDishModal({
  show,
  restaurantSlug,
  onClose,
  onDishCreated,
}: AddDishModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [createdDish, setCreatedDish] = useState<Dish | null>(null);
  // Tracks whether the parent was already notified to prevent double-add
  const notifiedRef = useRef(false);

  // Step 1 fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceTier, setPriceTier] = useState<PriceTier | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (show) {
      setStep(1);
      setCreatedDish(null);
      notifiedRef.current = false;
      setName('');
      setDescription('');
      setPriceTier('');
      setError(null);
    }
  }, [show]);

  // Close on Escape
  useEffect(() => {
    if (!show) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  function notify(dish: Dish, review?: DishReview) {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    onDishCreated(dish, review);
  }

  function handleClose() {
    if (createdDish) notify(createdDish);
    onClose();
  }

  async function handleSubmitDish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const dish = await createDish(restaurantSlug, {
        name: name.trim(),
        description: description.trim() || undefined,
        price_tier: priceTier || undefined,
      });
      setCreatedDish(dish);
      setStep(2);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'No se pudo agregar el plato.');
      } else {
        setError('No se pudo agregar el plato. Intentá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleReviewSuccess(review: DishReview) {
    notify(createdDish!, review);
    onClose();
  }

  function handleSkipReview() {
    notify(createdDish!);
    onClose();
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-dish-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget && step === 1) handleClose(); }}
    >
      <div className={`w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${step === 2 ? 'max-w-2xl' : 'max-w-md'}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            {step === 2 && (
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mainPink)]">
                Plato agregado
              </p>
            )}
            <h2 id="add-dish-modal-title" className="text-lg font-semibold text-neutral-900">
              {step === 1 ? 'Agregar plato al menú' : `¿Querés reseñar "${createdDish?.name}"?`}
            </h2>
          </div>
          <button
            type="button"
            className="cc-btn-close"
            aria-label="Cerrar"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* Step 1 — dish form */}
        {step === 1 && (
          <form onSubmit={handleSubmitDish}>
            <div className="flex flex-col gap-4 px-5 py-4">
              <div>
                <label htmlFor="dish-name" className="form-label">
                  Nombre del plato *
                </label>
                <input
                  id="dish-name"
                  type="text"
                  className="form-control"
                  placeholder="Ej: Milanesa napolitana"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={submitting}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="dish-description" className="form-label">
                  Descripción
                </label>
                <textarea
                  id="dish-description"
                  className="form-control"
                  rows={2}
                  placeholder="Descripción breve del plato (opcional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="dish-price" className="form-label">
                  Rango de precio
                </label>
                <select
                  id="dish-price"
                  className="form-select"
                  value={priceTier}
                  onChange={e => setPriceTier(e.target.value as PriceTier | '')}
                  disabled={submitting}
                >
                  <option value="">Sin especificar</option>
                  <option value="$">$ — Económico</option>
                  <option value="$$">$$ — Moderado</option>
                  <option value="$$$">$$$ — Premium</option>
                </select>
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4">
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !name.trim()}
              >
                {submitting ? 'Agregando…' : 'Agregar plato'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — optional review */}
        {step === 2 && createdDish && (
          <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: '70vh' }}>
            <DishReviewForm
              dishId={createdDish.id}
              onSuccess={handleReviewSuccess}
              onCancel={handleSkipReview}
              cancelLabel="Saltar por ahora"
            />
          </div>
        )}
      </div>
    </div>
  );
}
