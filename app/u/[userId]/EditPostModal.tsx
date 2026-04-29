'use client';

import { FormEvent, useEffect, useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import Select from '@/app/components/ui/Select';
import { getPost } from '@/app/lib/api/posts';
import { updateReview } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import type { PortionSize, ReviewPost } from '@/app/lib/types/social';

const MIN_TEXT = 20;
const MAX_TEXT = 1200;

export interface EditPostModalProps {
  postId: string;
  onClose: () => void;
  onUpdated: (postId: string, overlay: Partial<ReviewPost>) => void;
}

export default function EditPostModal({ postId, onClose, onUpdated }: EditPostModalProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Source post (for header context: dish + restaurant).
  const [source, setSource] = useState<ReviewPost | null>(null);

  // Form state — populated once the post loads.
  const [scoreStr, setScoreStr] = useState('4.0');
  const [text, setText] = useState('');
  const [dateTasted, setDateTasted] = useState('');
  const [portionSize, setPortionSize] = useState<PortionSize | ''>('');
  const [wouldOrderAgain, setWouldOrderAgain] = useState<'' | 'yes' | 'no'>('');
  const [visitedWith, setVisitedWith] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getPost(postId)
      .then((post) => {
        if (cancelled) return;
        setSource(post);
        setScoreStr(post.score.toFixed(1));
        setText(post.text);
        setDateTasted(
          post.extras?.dateTasted ?? post.createdAt.slice(0, 10),
        );
        setPortionSize(post.extras?.portionSize ?? '');
        setWouldOrderAgain(
          post.extras?.wouldOrderAgain == null
            ? ''
            : post.extras.wouldOrderAgain
              ? 'yes'
              : 'no',
        );
        setVisitedWith(post.extras?.visitedWith ?? '');
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError('No pudimos cargar la reseña. Probá de nuevo.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const score = Number(scoreStr);
  const trimmedText = text.trim();
  const canSubmit =
    !loading &&
    !submitting &&
    !loadError &&
    Number.isFinite(score) &&
    score >= 1 &&
    score <= 5 &&
    trimmedText.length >= MIN_TEXT &&
    trimmedText.length <= MAX_TEXT &&
    Boolean(dateTasted);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateReview(postId, {
        rating: score,
        note: trimmedText,
        date_tasted: dateTasted,
        portion_size: portionSize || undefined,
        would_order_again:
          wouldOrderAgain === '' ? undefined : wouldOrderAgain === 'yes',
        visited_with: visitedWith.trim() || undefined,
      });
      onUpdated(postId, {
        score,
        text: trimmedText,
        extras: {
          ...(source?.extras ?? {}),
          dateTasted,
          portionSize: portionSize || null,
          wouldOrderAgain:
            wouldOrderAgain === '' ? null : wouldOrderAgain === 'yes',
          visitedWith: visitedWith.trim() || null,
        },
      });
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.detail : 'No se pudo guardar. Probá de nuevo.',
      );
      setSubmitting(false);
    }
  }

  const title = source ? `Editar reseña de ${source.dish.name}` : 'Editar reseña';
  const description = source ? source.dish.restaurantName : undefined;

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      description={description}
      size="lg"
      busy={submitting}
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="font-sans text-sm text-action-danger" role="alert">
            {loadError}
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {submitError && (
            <p className="font-sans text-sm text-action-danger" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-score" className="font-sans text-sm font-medium text-text-secondary">
              Puntaje (1–5)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="edit-score"
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={scoreStr}
                onChange={(e) => setScoreStr(e.target.value)}
                disabled={submitting}
                className="flex-1 accent-action-primary"
              />
              <span
                className="w-16 text-right font-display text-3xl font-medium tabular-nums text-text-primary"
                aria-live="polite"
              >
                {Number.isFinite(score) ? score.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          <Textarea
            label="Reseña"
            name="text"
            required
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            maxLength={MAX_TEXT}
            valueLength={trimmedText.length}
            helpText={`Mínimo ${MIN_TEXT} caracteres.`}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Fecha"
              type="date"
              required
              value={dateTasted}
              onChange={(e) => setDateTasted(e.target.value)}
              disabled={submitting}
            />
            <Select
              label="Porción"
              value={portionSize}
              onChange={(e) => setPortionSize(e.target.value as PortionSize | '')}
              disabled={submitting}
            >
              <option value="">Sin especificar</option>
              <option value="small">Chica</option>
              <option value="medium">Mediana</option>
              <option value="large">Grande</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="font-sans text-sm font-medium text-text-secondary">
                ¿Lo pedirías de nuevo?
              </span>
              <div className="flex gap-2">
                {(['yes', 'no'] as const).map((val) => {
                  const active = wouldOrderAgain === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setWouldOrderAgain(active ? '' : val)
                      }
                      disabled={submitting}
                      className={
                        'rounded-xl border-2 px-4 py-1.5 font-sans text-sm font-medium transition-colors disabled:opacity-60 ' +
                        (active
                          ? val === 'yes'
                            ? 'border-action-primary bg-action-primary/10 text-action-primary'
                            : 'border-action-danger bg-action-danger/10 text-action-danger'
                          : 'border-border-default bg-transparent text-text-secondary hover:border-border-strong')
                      }
                    >
                      {val === 'yes' ? 'Sí' : 'No'}
                    </button>
                  );
                })}
              </div>
            </div>
            <Input
              label="Fui con"
              type="text"
              placeholder="Familia, amigos…"
              value={visitedWith}
              onChange={(e) => setVisitedWith(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={submitting}
              disabled={!canSubmit}
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
