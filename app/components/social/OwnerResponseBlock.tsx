'use client';

import { useEffect, useState } from 'react';
import Button from '@/app/components/ui/Button';
import { ApiError } from '@/app/lib/api/client';
import { getRestaurant } from '@/app/lib/api/restaurants';
import {
  deleteOwnerResponse,
  getOwnerResponse,
  upsertOwnerResponse,
} from '@/app/lib/api/owner-content';
import type { OwnerResponse } from '@/app/lib/types/owner-content';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

interface Props {
  reviewId: string;
  /** UUID o slug del restaurante. Se usa para chequear si el viewer es el
   *  owner verificado y mostrar los controles de edición.
   *  El backend `GET /restaurants/{slug_or_id}` acepta ambos. */
  restaurantSlugOrId: string;
}

type Mode =
  | { kind: 'loading' }
  | { kind: 'view'; response: OwnerResponse | null; canEdit: boolean }
  | { kind: 'edit'; draft: string; saving: boolean; error?: string };

export default function OwnerResponseBlock({
  reviewId,
  restaurantSlugOrId,
}: Props) {
  const { user, isLoading: authLoading } = useAuthContext();
  const [mode, setMode] = useState<Mode>({ kind: 'loading' });

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      try {
        const [response, restaurant] = await Promise.all([
          getOwnerResponse(reviewId).catch(() => null),
          user
            ? getRestaurant(restaurantSlugOrId).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        const canEdit = Boolean(restaurant?.viewer_is_owner);
        setMode({ kind: 'view', response, canEdit });
      } catch {
        if (!cancelled) setMode({ kind: 'view', response: null, canEdit: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, reviewId, restaurantSlugOrId]);

  if (mode.kind === 'loading') return null;

  if (mode.kind === 'edit') {
    const trimmed = mode.draft.trim();
    const valid = trimmed.length >= 3 && trimmed.length <= 2000;

    async function handleSave() {
      if (mode.kind !== 'edit' || !valid) return;
      setMode({ ...mode, saving: true, error: undefined });
      try {
        const saved = await upsertOwnerResponse(reviewId, trimmed);
        setMode({ kind: 'view', response: saved, canEdit: true });
      } catch (err) {
        setMode({
          ...mode,
          saving: false,
          error:
            err instanceof ApiError
              ? err.status === 403
                ? 'Solo el dueño verificado puede responder.'
                : 'No se pudo guardar la respuesta.'
              : 'No se pudo guardar la respuesta.',
        });
      }
    }

    function handleCancel() {
      setMode({
        kind: 'view',
        response: mode.kind === 'edit' ? null : null,
        canEdit: true,
      });
    }

    return (
      <section
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
        aria-labelledby="owner-response-edit-title"
      >
        <p
          id="owner-response-edit-title"
          className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700"
        >
          <span aria-hidden>✓</span>
          Respuesta del restaurante
        </p>
        <textarea
          value={mode.draft}
          onChange={(e) => setMode({ ...mode, draft: e.target.value })}
          rows={4}
          maxLength={2000}
          placeholder="Respondé a este comensal (mínimo 3 caracteres)…"
          className="w-full rounded-md border border-emerald-300 bg-white px-3 py-2 font-sans text-sm"
        />
        {mode.error && (
          <p className="mt-2 font-sans text-xs text-red-600">{mode.error}</p>
        )}
        <div className="mt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!valid || mode.saving}
            loading={mode.saving}
            onClick={() => void handleSave()}
          >
            Guardar respuesta
          </Button>
        </div>
      </section>
    );
  }

  // view mode
  const { response, canEdit } = mode;

  async function handleDelete() {
    if (!response) return;
    if (!confirm('¿Eliminar la respuesta del restaurante?')) return;
    try {
      await deleteOwnerResponse(reviewId);
      setMode({ kind: 'view', response: null, canEdit: true });
    } catch {
      // Silent failure — recargá si pasa.
    }
  }

  if (!response) {
    if (!canEdit) return null;
    return (
      <section className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 p-4 text-center">
        <p className="font-sans text-xs uppercase tracking-wider text-emerald-700">
          Sos el dueño verificado
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() =>
            setMode({ kind: 'edit', draft: '', saving: false })
          }
        >
          Responder esta reseña
        </Button>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
      aria-labelledby="owner-response-title"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p
          id="owner-response-title"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700"
        >
          <span aria-hidden>✓</span>
          Respuesta del restaurante
        </p>
        {canEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setMode({
                  kind: 'edit',
                  draft: response.body,
                  saving: false,
                })
              }
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
      <p className="whitespace-pre-wrap font-sans text-sm text-text-primary">
        {response.body}
      </p>
      <p className="mt-2 font-sans text-xs text-text-muted">
        {new Date(response.updated_at).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    </section>
  );
}
