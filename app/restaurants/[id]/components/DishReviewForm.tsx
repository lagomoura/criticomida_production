'use client';

import React, { useState } from 'react';
import { createReview, uploadReviewPhoto } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { PortionSize, DishReview } from '@/app/lib/types';
import StarRating from './StarRating';

interface DishReviewFormProps {
  dishId: string;
  onSuccess: (review: DishReview) => void;
  onCancel: () => void;
  cancelLabel?: string;
}

interface ProConEntry {
  id: number;
  text: string;
}

let _id = 0;
function nextId() { return ++_id; }

interface PhotoEntry {
  id: number;
  file: File;
  preview: string;
}

export default function DishReviewForm({ dishId, onSuccess, onCancel, cancelLabel = 'Cancelar' }: DishReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [wouldOrderAgain, setWouldOrderAgain] = useState<boolean | null>(null);
  const [portionSize, setPortionSize] = useState<PortionSize | ''>('');
  const [dateTasted, setDateTasted] = useState(new Date().toISOString().slice(0, 10));
  const [visitedWith, setVisitedWith] = useState('');
  const [pros, setPros] = useState<ProConEntry[]>([{ id: nextId(), text: '' }]);
  const [cons, setCons] = useState<ProConEntry[]>([{ id: nextId(), text: '' }]);
  const [tags, setTags] = useState('');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addPro() { setPros(p => [...p, { id: nextId(), text: '' }]); }
  function removePro(id: number) { setPros(p => p.filter(x => x.id !== id)); }
  function updatePro(id: number, text: string) { setPros(p => p.map(x => x.id === id ? { ...x, text } : x)); }

  function addCon() { setCons(c => [...c, { id: nextId(), text: '' }]); }
  function removeCon(id: number) { setCons(c => c.filter(x => x.id !== id)); }
  function updateCon(id: number, text: string) { setCons(c => c.map(x => x.id === id ? { ...x, text } : x)); }

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const entries: PhotoEntry[] = files.map(file => ({
      id: nextId(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(p => [...p, ...entries]);
    e.target.value = '';
  }

  function removePhoto(id: number) {
    setPhotos(p => {
      const removed = p.find(x => x.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return p.filter(x => x.id !== id);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const prosFiltered = pros.map(p => p.text.trim()).filter(Boolean);
    const consFiltered = cons.map(c => c.text.trim()).filter(Boolean);
    const tagsFiltered = tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const imageUrls = await Promise.all(
        photos.map((photo, i) => uploadReviewPhoto(dishId, photo.file, i))
      );

      const review = await createReview(dishId, {
        rating,
        note,
        date_tasted: dateTasted,
        would_order_again: wouldOrderAgain ?? undefined,
        portion_size: portionSize || undefined,
        visited_with: visitedWith.trim() || undefined,
        is_anonymous: isAnonymous,
        pros_cons: [
          ...prosFiltered.map(text => ({ type: 'pro' as const, text })),
          ...consFiltered.map(text => ({ type: 'con' as const, text })),
        ],
        tags: tagsFiltered.map(tag => ({ tag })),
        images: imageUrls.map((url, i) => ({ url, display_order: i })),
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
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
      aria-label="Formulario de reseña"
    >
      {/* Main two-column layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: rating + would order again + note */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="form-label mb-1">Calificación *</label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

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

          <div className="flex flex-1 flex-col">
            <label htmlFor="review-note" className="form-label mb-1">
              Notas
            </label>
            <textarea
              id="review-note"
              className="form-control flex-1"
              rows={4}
              placeholder="¿Qué te pareció el plato?"
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Right: pros + cons */}
        <div className="flex flex-col gap-3">
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

          {/* Photos */}
          <div>
            <span className="form-label mb-1 block">Fotos</span>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative h-16 w-16 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    disabled={submitting}
                    aria-label="Eliminar foto"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-[var(--mainPink)] hover:text-[var(--mainPink)]">
                <span className="text-xl leading-none">+</span>
                <span className="text-[10px]">Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handlePhotoAdd}
                  disabled={submitting}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary fields: portion, date, visited with, tags */}
      <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-3 sm:grid-cols-4">
        <div>
          <label htmlFor="review-portion" className="form-label mb-1">
            Porción
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
            Fecha
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
            ¿Con quién?
          </label>
          <input
            id="review-visited"
            type="text"
            className="form-control"
            placeholder="Familia, Amigos…"
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
            placeholder="Vegano, Picante…"
            value={tags}
            onChange={e => setTags(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      {/* Footer: anonymous + actions */}
      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-neutral-300 accent-[var(--mainPink)]"
          />
          Publicar de forma anónima
        </label>

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
            {cancelLabel}
          </button>
        </div>
      </div>

      {error && (
        <p className="m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
