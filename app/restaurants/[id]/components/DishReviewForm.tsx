'use client';

import React, { useRef, useState } from 'react';
import { createReview, updateReview, uploadReviewPhoto } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { PortionSize, DishReview, PillarScore } from '@/app/lib/types';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import MentionTextarea from '@/app/components/social/MentionTextarea';
import StarRating from './StarRating';
import TechnicalPillars, { type TechnicalPillarsValue } from './TechnicalPillars';

/** Subset de DishReview necesario para pre-llenar el form en modo edición. */
export interface DishReviewFormInitial {
  rating: number;
  note: string;
  date_tasted: string;
  time_tasted: string | null;
  portion_size: PortionSize | null;
  would_order_again: boolean | null;
  visited_with: string | null;
  is_anonymous: boolean;
  presentation: PillarScore | null;
  value_prop: PillarScore | null;
  execution: PillarScore | null;
  pros_cons: { type: 'pro' | 'con'; text: string }[];
  tags: { tag: string }[];
  images: { id: string; url: string; alt_text: string | null }[];
}

interface DishReviewFormProps {
  /**
   * Plato a reseñar. Pasá `dishId` cuando el plato ya existe; pasá
   * `resolveDishId` cuando el plato todavía no existe — se invoca al submit
   * y debe crear el plato y devolver su id (lo usa PublishReviewModal).
   * Tiene que pasarse exactamente uno de los dos en modo create.
   */
  dishId?: string;
  resolveDishId?: () => Promise<string>;
  dishName: string;
  onSuccess: (review: DishReview) => void;
  onCancel: () => void;
  cancelLabel?: string;
  /** Default 'create'. En 'edit' se requiere `reviewId` + `initial`. */
  mode?: 'create' | 'edit';
  reviewId?: string;
  initial?: DishReviewFormInitial;
  submitLabel?: string;
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

interface ExistingImage {
  id: string;
  url: string;
  alt_text: string | null;
}

function toProConEntries(items: { text: string }[]): ProConEntry[] {
  if (items.length === 0) return [{ id: nextId(), text: '' }];
  return items.map(({ text }) => ({ id: nextId(), text }));
}

/** "HH:MM:SS" o "HH:MM" → "HH:MM" para input[type=time]. */
function trimTime(value: string | null): string {
  if (!value) return '';
  const parts = value.split(':');
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : '';
}

export default function DishReviewForm({
  dishId,
  resolveDishId,
  dishName,
  onSuccess,
  onCancel,
  cancelLabel = 'Cancelar',
  mode = 'create',
  reviewId,
  initial,
  submitLabel,
}: DishReviewFormProps) {
  const isEdit = mode === 'edit';

  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [pillars, setPillars] = useState<TechnicalPillarsValue>({
    presentation: initial?.presentation ?? null,
    value_prop: initial?.value_prop ?? null,
    execution: initial?.execution ?? null,
  });
  const [note, setNote] = useState(initial?.note ?? '');
  const [noteMentions, setNoteMentions] = useState<string[]>([]);
  const { user } = useAuthContext();
  const [wouldOrderAgain, setWouldOrderAgain] = useState<boolean | null>(
    initial?.would_order_again ?? null,
  );
  const [portionSize, setPortionSize] = useState<PortionSize | ''>(
    initial?.portion_size ?? '',
  );
  const [dateTasted, setDateTasted] = useState(
    initial?.date_tasted ?? new Date().toISOString().slice(0, 10),
  );
  const [timeTasted, setTimeTasted] = useState(trimTime(initial?.time_tasted ?? null));
  const [visitedWith, setVisitedWith] = useState(initial?.visited_with ?? '');
  const initialPros = initial?.pros_cons.filter((x) => x.type === 'pro') ?? [];
  const initialCons = initial?.pros_cons.filter((x) => x.type === 'con') ?? [];
  const [pros, setPros] = useState<ProConEntry[]>(toProConEntries(initialPros));
  const [cons, setCons] = useState<ProConEntry[]>(toProConEntries(initialCons));
  const [tags, setTags] = useState(
    initial?.tags.map((t) => t.tag).join(', ') ?? '',
  );
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    initial?.images ?? [],
  );
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(initial?.is_anonymous ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // File picker programático (evita quirks de <label>+input nesteado).
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  function removeExistingImage(id: string) {
    setExistingImages((imgs) => imgs.filter((x) => x.id !== id));
  }

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

    const trimmedDishName = dishName.trim();
    const altFor = (index: number, total: number) =>
      total > 1 ? `Foto ${index + 1} de ${trimmedDishName}` : `Foto de ${trimmedDishName}`;

    try {
      if (isEdit) {
        if (!reviewId) throw new Error('Falta el id de la reseña a editar.');

        // Upload sólo las nuevas; las existentes ya tienen URL.
        const newUrls = await Promise.all(
          photos.map((photo, i) => uploadReviewPhoto(reviewId, photo.file, i)),
        );

        const keptExisting: { url: string; alt_text?: string }[] = existingImages.map((img) => ({
          url: img.url,
          alt_text: img.alt_text ?? undefined,
        }));
        const newOnes: { url: string; alt_text?: string }[] = newUrls.map((url) => ({ url }));
        const total = keptExisting.length + newOnes.length;
        const allImages = [...keptExisting, ...newOnes].map((img, i) => ({
          url: img.url,
          alt_text: img.alt_text ?? altFor(i, total),
          display_order: i,
        }));

        const review = await updateReview(reviewId, {
          rating,
          note,
          date_tasted: dateTasted,
          time_tasted: timeTasted || undefined,
          would_order_again: wouldOrderAgain ?? undefined,
          portion_size: portionSize || undefined,
          visited_with: visitedWith.trim() || undefined,
          is_anonymous: isAnonymous,
          presentation: pillars.presentation ?? undefined,
          value_prop: pillars.value_prop ?? undefined,
          execution: pillars.execution ?? undefined,
          pros_cons: [
            ...prosFiltered.map(text => ({ type: 'pro' as const, text })),
            ...consFiltered.map(text => ({ type: 'con' as const, text })),
          ],
          tags: tagsFiltered.map(tag => ({ tag })),
          images: allImages,
          mentioned_user_ids: noteMentions,
        });
        onSuccess(review);
        return;
      }

      const resolvedDishId = dishId ?? (await resolveDishId?.());
      if (!resolvedDishId) {
        throw new Error('Falta el plato para reseñar.');
      }

      const imageUrls = await Promise.all(
        photos.map((photo, i) => uploadReviewPhoto(resolvedDishId, photo.file, i))
      );

      const review = await createReview(resolvedDishId, {
        rating,
        note,
        date_tasted: dateTasted,
        time_tasted: timeTasted || undefined,
        would_order_again: wouldOrderAgain ?? undefined,
        portion_size: portionSize || undefined,
        visited_with: visitedWith.trim() || undefined,
        is_anonymous: isAnonymous,
        presentation: pillars.presentation ?? undefined,
        value_prop: pillars.value_prop ?? undefined,
        execution: pillars.execution ?? undefined,
        pros_cons: [
          ...prosFiltered.map(text => ({ type: 'pro' as const, text })),
          ...consFiltered.map(text => ({ type: 'con' as const, text })),
        ],
        tags: tagsFiltered.map(tag => ({ tag })),
        images: imageUrls.map((url, i) => ({
          url,
          alt_text: altFor(i, imageUrls.length),
          display_order: i,
        })),
        mentioned_user_ids: noteMentions,
      });
      onSuccess(review);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'No se pudo enviar la reseña.');
      } else {
        setError(isEdit ? 'No se pudo guardar la reseña. Intentá de nuevo.' : 'No se pudo enviar la reseña. Intentá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-page p-4 text-text-primary"
      aria-label="Formulario de reseña"
    >
      {/* Top: rating + would-order-again (full width, the gate) */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-3 sm:p-4">
        <div>
          <label className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Calificación <span className="text-color-azafran">*</span>
          </label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <span className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            ¿Lo pedirías de nuevo?
          </span>
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
                  'rounded-full border-2 px-4 py-1.5 font-sans text-sm font-semibold transition-colors ' +
                  (wouldOrderAgain === value
                    ? value
                      ? 'border-color-albahaca bg-color-albahaca text-text-inverse'
                      : 'border-color-paprika bg-color-paprika text-text-inverse'
                    : 'border-border-subtle bg-surface-page text-text-secondary hover:border-border-default hover:bg-surface-subtle')
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 pilares técnicos — siempre visibles */}
      <TechnicalPillars
        value={pillars}
        onChange={setPillars}
        disabled={submitting}
      />

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Left: notes */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-1 flex-col">
            <SubLabel htmlFor="review-note">Notas</SubLabel>
            <MentionTextarea
              id="review-note"
              label="Notas"
              hideLabel
              textareaClassName={inputBase + ' flex-1 resize-none'}
              rows={4}
              placeholder="¿Qué te pareció el plato?"
              value={note}
              onChange={setNote}
              onMentionsChange={setNoteMentions}
              currentUserId={user?.id ?? null}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Right: pros + cons */}
        <div className="flex flex-col gap-3">
          <div>
            <SubLabel>Pros</SubLabel>
            <div className="flex flex-col gap-2">
              {pros.map((pro) => (
                <div key={pro.id} className="flex gap-2">
                  <input
                    type="text"
                    className={inputBase + ' flex-1'}
                    placeholder="Ej: Muy sabroso"
                    value={pro.text}
                    onChange={e => updatePro(pro.id, e.target.value)}
                    disabled={submitting}
                  />
                  <RemoveBtn
                    onClick={() => removePro(pro.id)}
                    disabled={pros.length === 1 || submitting}
                    label="Eliminar pro"
                  />
                </div>
              ))}
              <AddChipBtn onClick={addPro} disabled={submitting} label="Agregar pro" />
            </div>
          </div>

          <div>
            <SubLabel>Contras</SubLabel>
            <div className="flex flex-col gap-2">
              {cons.map((con) => (
                <div key={con.id} className="flex gap-2">
                  <input
                    type="text"
                    className={inputBase + ' flex-1'}
                    placeholder="Ej: Muy caro"
                    value={con.text}
                    onChange={e => updateCon(con.id, e.target.value)}
                    disabled={submitting}
                  />
                  <RemoveBtn
                    onClick={() => removeCon(con.id)}
                    disabled={cons.length === 1 || submitting}
                    label="Eliminar contra"
                  />
                </div>
              ))}
              <AddChipBtn onClick={addCon} disabled={submitting} label="Agregar contra" />
            </div>
          </div>

          {/* Photos */}
          <div>
            <SubLabel>Fotos</SubLabel>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative h-16 w-16 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt_text ?? ''}
                    className="h-full w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    disabled={submitting}
                    aria-label="Eliminar foto"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-color-paprika text-[10px] text-text-inverse shadow-[var(--shadow-base)] hover:bg-color-paprika-light"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.map((photo) => (
                <div key={photo.id} className="relative h-16 w-16 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt=""
                    className="h-full w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    disabled={submitting}
                    aria-label="Eliminar foto"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-color-paprika text-[10px] text-text-inverse shadow-[var(--shadow-base)] hover:bg-color-paprika-light"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={submitting}
                className="group flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-border-default bg-surface-card text-text-muted transition-all hover:border-color-azafran hover:bg-color-azafran-pale hover:text-color-azafran disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-lg leading-none">+</span>
                <span className="text-[10px] font-medium">Foto</span>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handlePhotoAdd}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary fields: portion, date, visited with, tags */}
      <div className="grid grid-cols-1 gap-3 border-t border-border-subtle pt-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <SubLabel htmlFor="review-portion">Porción</SubLabel>
          <select
            id="review-portion"
            className={inputBase + ' appearance-none pr-9 bg-[length:14px] bg-no-repeat bg-[right_0.85rem_center]'}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 16 16' fill='none' stroke='%236B6358' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")" }}
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
          <SubLabel htmlFor="review-date">Fecha y hora</SubLabel>
          <div className="flex gap-2">
            <input
              id="review-date"
              type="date"
              className={inputBase + ' flex-1'}
              value={dateTasted}
              onChange={e => setDateTasted(e.target.value)}
              disabled={submitting}
            />
            <input
              id="review-time"
              type="time"
              aria-label="Hora"
              className={inputBase + ' flex-1'}
              value={timeTasted}
              onChange={e => setTimeTasted(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>
        <div>
          <SubLabel htmlFor="review-visited">¿Con quién?</SubLabel>
          <input
            id="review-visited"
            type="text"
            className={inputBase}
            placeholder="Familia, Amigos…"
            value={visitedWith}
            onChange={e => setVisitedWith(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <SubLabel htmlFor="review-tags">Etiquetas</SubLabel>
          <input
            id="review-tags"
            type="text"
            className={inputBase}
            placeholder="Vegano, Picante…"
            value={tags}
            onChange={e => setTags(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      {/* Footer: anonymous + actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <label className="flex cursor-pointer items-center gap-2 font-sans text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-border-default accent-color-azafran"
          />
          Publicar de forma anónima
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-action-primary px-6 py-2.5 font-sans text-sm font-semibold text-text-inverse shadow-[var(--shadow-base)] transition-all hover:bg-action-primary-hover hover:shadow-[var(--shadow-media)] active:translate-y-[1px] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? (isEdit ? 'Guardando…' : 'Enviando…')
              : (submitLabel ?? (isEdit ? 'Guardar cambios' : 'Publicar reseña'))}
          </button>
        </div>
      </div>

      {error && (
        <p
          className="m-0 rounded-xl border border-color-paprika/30 bg-color-paprika-pale px-3 py-2 font-sans text-sm font-medium text-color-paprika"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}

/* ---------- Local visual helpers (semantic tokens) ---------- */

const inputBase = [
  'w-full rounded-xl border border-border-subtle bg-surface-card',
  'px-3.5 py-2.5 font-sans text-sm text-text-primary',
  'placeholder:text-text-muted/80 transition-all',
  'focus:border-color-azafran focus:outline-none',
  'focus-visible:[box-shadow:var(--focus-ring)]',
  'disabled:opacity-60',
].join(' ');

function SubLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary"
    >
      {children}
    </label>
  );
}

function RemoveBtn({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-text-muted transition-colors hover:border-color-paprika/40 hover:bg-color-paprika-pale hover:text-color-paprika disabled:opacity-40"
    >
      ×
    </button>
  );
}

function AddChipBtn({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-dashed border-border-default bg-surface-card px-3 py-1.5 font-sans text-xs font-semibold text-text-secondary transition-all hover:border-color-azafran hover:bg-color-azafran-pale hover:text-color-canela disabled:opacity-40"
    >
      <span aria-hidden>＋</span>
      {label}
    </button>
  );
}
