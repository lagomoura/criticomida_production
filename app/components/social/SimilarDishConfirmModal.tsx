'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import type { DishSuggestion } from '@/app/lib/api/dishes';

export interface SimilarDishConfirmModalProps {
  attemptedName: string;
  suggestions: DishSuggestion[];
  onPickExisting: (suggestion: DishSuggestion) => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

/**
 * Pre-create dedup gate. Triggered when the user is about to create a dish
 * whose normalized name (lower + unaccent + collapsed spaces) is similar to
 * something already in this restaurant. Forces a deliberate choice before
 * splitting reviews across two near-identical dish rows.
 */
export default function SimilarDishConfirmModal({
  attemptedName,
  suggestions,
  onPickExisting,
  onCreateNew,
  onCancel,
}: SimilarDishConfirmModalProps) {
  const exact = suggestions.find((s) => s.isExactNormalized);
  const description = exact
    ? `Ya existe "${exact.name}" — la versión normalizada coincide con lo que escribiste. Si es el mismo plato, sumá tu reseña ahí.`
    : 'Encontramos platos parecidos en este restaurante. Si es el mismo, sumá tu reseña ahí — así los puntajes se promedian en lugar de dividirse.';

  return (
    <Modal
      open
      onClose={onCancel}
      title="¿Es el mismo plato?"
      description={description}
      size="md"
    >
      <p className="m-0 mb-3 font-sans text-sm text-text-secondary">
        Estás por crear: <strong className="font-medium text-text-primary">&ldquo;{attemptedName}&rdquo;</strong>
      </p>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {suggestions.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPickExisting(s)}
              className="group flex w-full items-center gap-3 rounded-xl border border-border-default bg-surface-card px-4 py-3 text-left transition-colors hover:border-action-primary hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <FontAwesomeIcon
                icon={faUtensils}
                className="h-4 w-4 text-text-muted group-hover:text-action-primary"
                aria-hidden
              />
              <span className="flex-1 truncate font-sans text-sm font-medium text-text-primary">
                {s.name}
              </span>
              <span className="shrink-0 font-sans text-xs text-text-muted tabular-nums">
                {s.reviewCount === 0
                  ? 'sin reseñas'
                  : s.reviewCount === 1
                    ? '1 reseña'
                    : `${s.reviewCount} reseñas`}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          Volver a editar
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={onCreateNew}>
          <FontAwesomeIcon icon={faPlus} className="mr-1.5 h-3 w-3" aria-hidden />
          No, crear plato nuevo
        </Button>
      </div>
    </Modal>
  );
}
