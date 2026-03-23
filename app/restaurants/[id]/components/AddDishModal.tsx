'use client';

import React, { useState, useEffect } from 'react';
import { createDish } from '@/app/lib/api/dishes';
import { ApiError } from '@/app/lib/api/client';
import { Dish, PriceTier } from '@/app/lib/types';

interface AddDishModalProps {
  show: boolean;
  restaurantSlug: string;
  onClose: () => void;
  onDishCreated: (dish: Dish) => void;
}

export default function AddDishModal({
  show,
  restaurantSlug,
  onClose,
  onDishCreated,
}: AddDishModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceTier, setPriceTier] = useState<PriceTier | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
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
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      onDishCreated(dish);
      onClose();
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

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-dish-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 id="add-dish-modal-title" className="text-lg font-semibold text-neutral-900">
            Agregar plato al menú
          </h2>
          <button
            type="button"
            className="cc-btn-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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

          {/* Footer */}
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
      </div>
    </div>
  );
}
