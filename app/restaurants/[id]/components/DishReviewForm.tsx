'use client';

import React, { useState } from 'react';
import { createReview } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { PortionSize, DishReview } from '@/app/lib/types';
import StarRating from './StarRating';

interface DishReviewFormProps {
  dishId: string;
  onSuccess: (review: DishReview) => void;
  onCancel: () => void;
}

interface ProConEntry {
  id: number;
  text: string;
}

let _id = 0;
function nextId() { return ++_id; }

export default function DishReviewForm({ dishId, onSuccess, onCancel }: DishReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [wouldOrderAgain, setWouldOrderAgain] = useState<boolean | null>(null);
  const [portionSize, setPortionSize] = useState<PortionSize | ''>('');
  const [dateTasted, setDateTasted] = useState(new Date().toISOString().slice(0, 10));
  const [visitedWith, setVisitedWith] = useState('');
  const [pros, setPros] = useState<ProConEntry[]>([{ id: nextId(), text: '' }]);
  const [cons, setCons] = useState<ProConEntry[]>([{ id: nextId(), text: '' }]);
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addPro() { setPros(p => [...p, { id: nextId(), text: '' }]); }
  function removePro(id: number) { setPros(p => p.filter(x => x.id !== id)); }
  function updatePro(id: number, text: string) { setPros(p => p.map(x => x.id === id ? { ...x, text } : x)); }

  function addCon() { setCons(c => [...c, { id: nextId(), text: '' }]); }
  function removeCon(id: number) { setCons(c => c.filter(x => x.id !== id)); }
  function updateCon(id: number, text: string) { setCons(c => c.map(x => x.id === id ? { ...x, text } : x)); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const prosFiltered = pros.map(p => p.text.trim()).filter(Boolean);
    const consFiltered = cons.map(c => c.text.trim()).filter(Boolean);
    const tagsFiltered = tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const review = await createReview(dishId, {
        rating,
        note,
        date_tasted: dateTasted,
        would_order_again: wouldOrderAgain ?? undefined,
        portion_size: portionSize || undefined,
        visited_with: visitedWith.trim() || undefined,
        pros_cons: [
          ...prosFiltered.map(text => ({ type: 'pro' as const, text })),
          ...consFiltered.map(text => ({ type: 'con' as const, text })),
        ],
        tags: tagsFiltered.map(tag => ({ tag })),
      });
      onSuccess(review);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'No se pudo enviar la reseña.');
      } else {
        setError('No se pudo enviar la reseña. Intentá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
      aria-label="Formulario de reseña"
    >
      {/* Rating */}
      <div>
        <label className="form-label mb-1">Calificación *</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      {/* Would order again */}
      <div>
        <span className="form-label mb-1 block">¿Lo pedirías de nuevo?</span>
        <div className="flex gap-2">
          {([
            { label: 'Sí', value: true },
            { label: 'No', value: false },
          ] as const).map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => setWouldOrderAgain(wouldOrderAgain === value ? null : value)}
              className={
                'rounded-lg border-2 px-4 py-1.5 text-sm font-semibold transition-colors ' +
                (wouldOrderAgain === value
                  ? value
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-red-400 bg-red-400 text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div>
        <label htmlFor="review-note" className="form-label mb-1">
          Notas
        </label>
        <textarea
          id="review-note"
          className="form-control"
          rows={3}
          placeholder="¿Qué te pareció el plato?"
          value={note}
          onChange={e => setNote(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* Pros */}
      <div>
        <span className="form-label mb-1 block">Pros</span>
        <div className="flex flex-col gap-2">
          {pros.map((pro) => (
            <div key={pro.id} className="flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Muy sabroso"
                value={pro.text}
                onChange={e => updatePro(pro.id, e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                className="btn-sm btn-outline-danger shrink-0 rounded-lg border-2 px-2"
                onClick={() => removePro(pro.id)}
                aria-label="Eliminar pro"
                disabled={pros.length === 1 || submitting}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-sm btn-outline-primary w-fit rounded-lg border-2 px-3 py-1 text-sm"
            onClick={addPro}
            disabled={submitting}
          >
            + Agregar pro
          </button>
        </div>
      </div>

      {/* Cons */}
      <div>
        <span className="form-label mb-1 block">Contras</span>
        <div className="flex flex-col gap-2">
          {cons.map((con) => (
            <div key={con.id} className="flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Muy caro"
                value={con.text}
                onChange={e => updateCon(con.id, e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                className="btn-sm btn-outline-danger shrink-0 rounded-lg border-2 px-2"
                onClick={() => removeCon(con.id)}
                aria-label="Eliminar contra"
                disabled={cons.length === 1 || submitting}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-sm btn-outline-primary w-fit rounded-lg border-2 px-3 py-1 text-sm"
            onClick={addCon}
            disabled={submitting}
          >
            + Agregar contra
          </button>
        </div>
      </div>

      {/* Secondary fields: portion, date, visited with, tags */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="review-portion" className="form-label mb-1">
            Tamaño de porción
          </label>
          <select
            id="review-portion"
            className="form-select"
            value={portionSize}
            onChange={e => setPortionSize(e.target.value as PortionSize | '')}
            disabled={submitting}
          >
            <option value="">Sin especificar</option>
            <option value="small">Pequeña</option>
            <option value="medium">Mediana</option>
            <option value="large">Grande</option>
          </select>
        </div>
        <div>
          <label htmlFor="review-date" className="form-label mb-1">
            Fecha de degustación
          </label>
          <input
            id="review-date"
            type="date"
            className="form-control"
            value={dateTasted}
            onChange={e => setDateTasted(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="review-visited" className="form-label mb-1">
            ¿Con quién fuiste?
          </label>
          <input
            id="review-visited"
            type="text"
            className="form-control"
            placeholder="Ej: Familia, Amigos, Solo"
            value={visitedWith}
            onChange={e => setVisitedWith(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="review-tags" className="form-label mb-1">
            Etiquetas
          </label>
          <input
            id="review-tags"
            type="text"
            className="form-control"
            placeholder="Ej: Vegano, Picante (separadas por coma)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      {error && (
        <p className="m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={submitting}
        >
          {submitting ? 'Enviando…' : 'Publicar reseña'}
        </button>
        <button
          type="button"
          className="btn btn-light btn-sm"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
