'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faImage,
  faPlus,
  faTrashCan,
  faPenToSquare,
  faCamera,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { createDish, updateDish } from '@/app/lib/api/dishes';
import { uploadDishCoverImage } from '@/app/lib/api/images';
import { ApiError } from '@/app/lib/api/client';
import { Dish } from '@/app/lib/types';

interface AddDishModalProps {
  show: boolean;
  restaurantSlug: string;
  /** Para detectar duplicados al tipear. */
  existingDishes?: Dish[];
  onClose: () => void;
  /** Creó el plato y cierra. */
  onDishCreated: (dish: Dish) => void;
  /** Creó el plato y arranca el flow de reseña con ese plato pre-seleccionado. */
  onDishCreatedAndReview?: (dish: Dish) => void;
  /** El user eligió un plato existente del menú al detectar duplicado: arranca review. */
  onSelectExistingForReview?: (dish: Dish) => void;
}

type SubmitMode = 'just-add' | 'and-review';

export default function AddDishModal({
  show,
  restaurantSlug,
  existingDishes = [],
  onClose,
  onDishCreated,
  onDishCreatedAndReview,
  onSelectExistingForReview,
}: AddDishModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitMode, setSubmitMode] = useState<SubmitMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const submitting = submitMode !== null;

  // Detección liviana de duplicados: ranking simple — exacto > startsWith > contains.
  const duplicateMatches = useMemo<Dish[]>(() => {
    const q = name.trim().toLowerCase();
    if (q.length < 2 || existingDishes.length === 0) return [];
    const exact: Dish[] = [];
    const starts: Dish[] = [];
    const contains: Dish[] = [];
    for (const d of existingDishes) {
      const n = d.name.toLowerCase();
      if (n === q) exact.push(d);
      else if (n.startsWith(q)) starts.push(d);
      else if (n.includes(q)) contains.push(d);
    }
    return [...exact, ...starts, ...contains].slice(0, 3);
  }, [name, existingDishes]);

  const hasExactDuplicate = useMemo(
    () => duplicateMatches.some((d) => d.name.trim().toLowerCase() === name.trim().toLowerCase()),
    [duplicateMatches, name],
  );
  const previewRef = useRef<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Reset on open + cleanup blob URL on close.
  useEffect(() => {
    if (show) {
      setName('');
      setDescription('');
      setCoverFile(null);
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setCoverPreview(null);
      setError(null);
      setWarning(null);
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
    };
  }, []);

  // Lock scroll + close on Escape.
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
  }, [show, onClose, submitting]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setCoverPreview(url);
    } else {
      setCoverPreview(null);
    }
    setCoverFile(file);
  }

  function clearCover() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setCoverFile(null);
    setCoverPreview(null);
  }

  async function handleSubmit(mode: SubmitMode) {
    if (!name.trim() || submitting) return;
    setError(null);
    setWarning(null);
    setSubmitMode(mode);

    try {
      let dish = await createDish(restaurantSlug, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      if (coverFile) {
        try {
          const url = await uploadDishCoverImage(coverFile, dish.id);
          dish = await updateDish(dish.id, { cover_image_url: url });
        } catch {
          setWarning('El plato se creó, pero no se pudo subir la foto. Podés agregarla más tarde.');
        }
      }

      if (mode === 'and-review' && onDishCreatedAndReview) {
        // El padre se encarga de cerrar este modal + abrir el de reseña.
        onDishCreatedAndReview(dish);
      } else {
        onDishCreated(dish);
        onClose();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : 'No se pudo agregar el plato.');
      } else {
        setError('No se pudo agregar el plato. Intentá de nuevo.');
      }
    } finally {
      setSubmitMode(null);
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-end justify-center sm:items-center"
      role="presentation"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !submitting && onClose()}
        disabled={submitting}
        className="absolute inset-0 cursor-default bg-color-carbon/55 backdrop-blur-md transition-opacity motion-safe:animate-[cc-modal-fade-in_180ms_ease-out] disabled:cursor-wait"
      />

      {/* Sheet / Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-dish-title"
        className={[
          'relative z-10 grid w-full overflow-hidden bg-surface-card text-text-primary',
          // Grid 3 filas: chrome, body scrollable, footer sticky.
          // minmax(0,1fr) en el body es necesario para que el overflow-y-auto
          // funcione sin colapsar (ver comentario en PublishReviewModal).
          'grid-rows-[auto_minmax(0,1fr)_auto]',
          'max-h-[92dvh] sm:max-h-[88dvh] sm:max-w-[28rem]',
          'rounded-t-3xl sm:rounded-3xl',
          'border-t border-border-subtle sm:border',
          'shadow-[var(--shadow-floating)]',
          'motion-safe:animate-[cc-modal-sheet-up_320ms_var(--ease-spoon)] sm:motion-safe:animate-[cc-modal-pop_240ms_var(--ease-spoon)]',
        ].join(' ')}
      >
        {/* Row 1: chrome */}
        <div>
        {/* Drag indicator (mobile) */}
        <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-border-default" aria-hidden />
        </div>

        {/* Header */}
        <header className="relative px-6 pt-5 pb-4 sm:px-7 sm:pt-7 sm:pb-5">
          <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.22em] text-color-azafran">
            Menú · Nueva entrada
          </p>
          <h2
            id="add-dish-title"
            className="mt-1.5 font-display text-[2rem] font-medium leading-[1.1] text-text-primary sm:text-[2.25rem]"
          >
            Agregar plato
          </h2>
          <p className="mt-1.5 font-sans text-sm leading-snug text-text-muted">
            Sumá una nueva entrada al menú del local. Después podés reseñarla.
          </p>

          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            aria-label="Cerrar"
            className={[
              'absolute right-4 top-4 sm:right-5 sm:top-5',
              'inline-flex h-9 w-9 items-center justify-center rounded-full',
              'text-text-muted transition-all',
              'hover:bg-surface-subtle hover:text-text-primary',
              'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              'disabled:opacity-40',
            ].join(' ')}
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="mx-6 h-px bg-border-subtle sm:mx-7" aria-hidden />
        </div>

        {/* Row 2 + 3: body + footer (mantengo la estructura del form para
            que envuelva ambos y el submit funcione naturalmente, pero el
            grid del padre dimensiona body y footer independientemente). */}
        <div className="contents">
          <div className="overflow-y-auto px-6 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-col gap-5">
              {/* Cover photo dropzone */}
              <CoverPhotoField
                preview={coverPreview}
                onChange={handleCoverChange}
                onClear={clearCover}
                disabled={submitting}
              />

              {/* Nombre */}
              <Field label="Nombre del plato" required>
                <input
                  id="dish-name"
                  type="text"
                  autoFocus
                  className={inputClass}
                  placeholder="Ej. Milanesa napolitana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                  maxLength={200}
                  aria-describedby={duplicateMatches.length > 0 ? 'dish-duplicate-hint' : undefined}
                />
                {/* Hint de duplicados — aparece si hay matches con lo tipeado */}
                {duplicateMatches.length > 0 && (
                  <DuplicatesHint
                    id="dish-duplicate-hint"
                    matches={duplicateMatches}
                    exact={hasExactDuplicate}
                    onPick={(d) => {
                      if (onSelectExistingForReview) {
                        onSelectExistingForReview(d);
                      }
                    }}
                  />
                )}
              </Field>

              {/* Descripción */}
              <Field label="Descripción" hint="Opcional">
                <textarea
                  id="dish-description"
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="¿Qué lleva? (ingredientes principales, breve)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  maxLength={500}
                />
              </Field>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-color-paprika/30 bg-color-paprika-pale px-4 py-3 text-sm font-medium text-color-paprika"
                >
                  {error}
                </div>
              )}
              {warning && (
                <div
                  role="status"
                  className="rounded-xl border border-color-azafran/30 bg-color-azafran-pale px-4 py-3 text-sm font-medium text-color-canela"
                >
                  {warning}
                </div>
              )}
            </div>
          </div>

          {/* Footer sticky — dos CTAs */}
          <footer className="shrink-0 border-t border-border-subtle bg-surface-card px-6 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => handleSubmit('just-add')}
                disabled={submitting || !name.trim() || hasExactDuplicate}
                className={[
                  'inline-flex items-center justify-center gap-2 rounded-full',
                  'border-2 border-color-azafran bg-surface-card px-5 py-2.5',
                  'font-sans text-sm font-semibold text-color-canela',
                  'transition-all hover:bg-color-azafran-pale',
                  'active:translate-y-[1px]',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                ].join(' ')}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  className={`h-3.5 w-3.5 ${submitMode === 'just-add' ? 'animate-spin' : ''}`}
                  aria-hidden
                />
                {submitMode === 'just-add' ? 'Agregando…' : 'Solo agregar'}
              </button>

              {onDishCreatedAndReview && (
                <button
                  type="button"
                  onClick={() => handleSubmit('and-review')}
                  disabled={submitting || !name.trim() || hasExactDuplicate}
                  className={[
                    'inline-flex items-center justify-center gap-2 rounded-full',
                    'bg-action-primary px-6 py-2.5',
                    'font-sans text-sm font-semibold text-text-inverse',
                    'shadow-[var(--shadow-base)] transition-all',
                    'hover:bg-action-primary-hover hover:shadow-[var(--shadow-media)]',
                    'active:translate-y-[1px] active:shadow-[var(--shadow-micro)]',
                    'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
                  ].join(' ')}
                >
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    className={`h-3.5 w-3.5 ${submitMode === 'and-review' ? 'animate-spin' : ''}`}
                    aria-hidden
                  />
                  {submitMode === 'and-review' ? 'Agregando…' : 'Agregar y reseñar'}
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>

    </div>
  );
}

/* ---------- Local building blocks (kept inline for cohesion) ---------- */

const inputClass = [
  'w-full rounded-xl border border-border-subtle bg-surface-page',
  'px-4 py-3 font-sans text-base text-text-primary',
  'placeholder:text-text-muted/80',
  'transition-all',
  'focus:border-color-azafran focus:bg-surface-card focus:outline-none',
  'focus-visible:[box-shadow:var(--focus-ring)]',
  'disabled:opacity-60',
].join(' ');

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
          {label}
          {required && <span className="ml-1 text-color-azafran" aria-hidden>*</span>}
        </span>
        {hint && (
          <span className="font-sans text-[10.5px] uppercase tracking-[0.1em] text-text-muted">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function DuplicatesHint({
  id,
  matches,
  exact,
  onPick,
}: {
  id: string;
  matches: Dish[];
  exact: boolean;
  onPick: (dish: Dish) => void;
}) {
  return (
    <div
      id={id}
      role="region"
      aria-label="Platos similares ya en el menú"
      className={[
        'mt-2 overflow-hidden rounded-xl border bg-surface-card transition-colors',
        exact
          ? 'border-color-azafran bg-color-azafran-pale'
          : 'border-border-subtle',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 border-b border-border-subtle px-3.5 py-2">
        <FontAwesomeIcon
          icon={faStar}
          className={[
            'h-3 w-3',
            exact ? 'text-color-azafran' : 'text-text-muted',
          ].join(' ')}
          aria-hidden
        />
        <p className="m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          {exact ? 'Ya existe — reseñalo' : 'Quizás ya existe'}
        </p>
      </div>
      <ul className="flex flex-col">
        {matches.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onPick(d)}
              className={[
                'group flex w-full items-center gap-3 px-3.5 py-2.5 text-left',
                'transition-colors hover:bg-color-azafran-pale/50',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              ].join(' ')}
            >
              {d.cover_image_url ? (
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-surface-subtle">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.cover_image_url} alt="" className="h-full w-full object-cover" />
                </span>
              ) : (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-muted">
                  <FontAwesomeIcon icon={faImage} className="h-3 w-3" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate font-sans text-sm font-semibold text-text-primary">
                  {d.name}
                </p>
                {d.review_count > 0 && (
                  <p className="m-0 font-sans text-[11px] text-text-muted">
                    {d.review_count} reseña{d.review_count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <span className="font-sans text-[11px] font-semibold text-color-canela transition-transform group-hover:translate-x-0.5">
                Reseñalo →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoverPhotoField({
  preview,
  onChange,
  onClear,
  disabled,
}: {
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  if (preview) {
    return (
      <div className="relative h-44 overflow-hidden rounded-2xl border border-border-subtle bg-surface-page">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-color-carbon/55 to-transparent" />
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          aria-label="Quitar foto"
          className={[
            'absolute right-3 top-3',
            'inline-flex h-9 items-center gap-1.5 rounded-full px-3',
            'bg-surface-card/90 text-xs font-semibold text-text-primary backdrop-blur',
            'shadow-[var(--shadow-base)] transition-all',
            'hover:bg-surface-card hover:shadow-[var(--shadow-media)]',
            'disabled:opacity-40',
          ].join(' ')}
        >
          <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" aria-hidden />
          Quitar
        </button>
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-surface-card/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-color-azafran backdrop-blur">
          <FontAwesomeIcon icon={faImage} className="h-3 w-3" aria-hidden />
          Foto cargada
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        'relative flex h-44 flex-col items-center justify-center gap-3',
        'rounded-2xl border-2 border-dashed border-border-default bg-surface-page',
        'transition-all',
      ].join(' ')}
    >
      <p className="m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
        Foto del plato · Opcional
      </p>
      <div className="flex items-center gap-2.5">
        {/* Cámara nativa: capture='environment' abre la cámara trasera en móvil */}
        <label
          className={[
            'group inline-flex cursor-pointer items-center gap-2 rounded-full',
            'bg-action-primary px-4 py-2.5',
            'font-sans text-sm font-semibold text-text-inverse shadow-[var(--shadow-base)]',
            'transition-all hover:bg-action-primary-hover hover:shadow-[var(--shadow-media)]',
            'active:translate-y-[1px]',
            'focus-within:outline-none focus-within:[box-shadow:var(--focus-ring)]',
          ].join(' ')}
        >
          <FontAwesomeIcon icon={faCamera} className="h-3.5 w-3.5" aria-hidden />
          Tomar foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={onChange}
            disabled={disabled}
          />
        </label>
        <label
          className={[
            'group inline-flex cursor-pointer items-center gap-2 rounded-full',
            'border-2 border-color-azafran bg-surface-card px-4 py-2.5',
            'font-sans text-sm font-semibold text-color-canela',
            'transition-all hover:bg-color-azafran-pale',
            'active:translate-y-[1px]',
            'focus-within:outline-none focus-within:[box-shadow:var(--focus-ring)]',
          ].join(' ')}
        >
          <FontAwesomeIcon icon={faImage} className="h-3.5 w-3.5" aria-hidden />
          Galería
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onChange}
            disabled={disabled}
          />
        </label>
      </div>
      <span className="font-sans text-[11px] text-text-muted">
        En el móvil, “Tomar foto” abre la cámara directo
      </span>
    </div>
  );
}
