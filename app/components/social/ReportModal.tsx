'use client';

import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import Textarea from '@/app/components/ui/Textarea';
import { createReport } from '@/app/lib/api/reports';
import type { ReportEntityType } from '@/app/lib/api/reports';
import { ApiError } from '@/app/lib/api/client';

export interface ReportModalProps {
  open: boolean;
  entityType: ReportEntityType;
  entityId: string;
  /** Optional one-line context for the moderator — e.g. "Pizza @ Güerrin". */
  subject?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportModal({
  open,
  entityType,
  entityId,
  subject,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason('');
    setError(null);
    setSentMessage(null);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, submitting, onClose]);

  const handleSubmit = useCallback(async () => {
    if (reason.trim().length < 3) {
      setError('Contanos un poco más para ayudar a moderación.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createReport({ entityType, entityId, reason: reason.trim() });
      setSentMessage('Reporte enviado. Gracias.');
      onSuccess?.();
      window.setTimeout(() => onClose(), 900);
    } catch (err) {
      setError(
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : 'No pudimos enviar el reporte. Probá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [reason, entityType, entityId, onClose, onSuccess]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !submitting && onClose()}
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border-default bg-surface-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="report-modal-title" className="font-display text-2xl font-medium text-text-primary">
            Reportar {labelFor(entityType)}
          </h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Cerrar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <FontAwesomeIcon icon={faXmark} aria-hidden />
          </button>
        </div>

        {subject && (
          <p className="mb-3 line-clamp-2 rounded-lg bg-surface-subtle p-2 font-sans text-xs text-text-secondary">
            {subject}
          </p>
        )}

        <Textarea
          label="¿Qué pasa con este contenido?"
          placeholder="Spam, contenido ofensivo, información falsa…"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          valueLength={reason.length}
          disabled={submitting || sentMessage !== null}
        />

        {error && (
          <p className="mt-3 font-sans text-sm text-action-danger" role="status" aria-live="polite">
            {error}
          </p>
        )}

        {sentMessage && (
          <p className="mt-3 font-sans text-sm text-action-secondary" role="status">
            {sentMessage}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => void handleSubmit()}
            loading={submitting}
            disabled={sentMessage !== null}
          >
            Enviar reporte
          </Button>
        </div>
      </div>
    </div>
  );
}

function labelFor(kind: ReportEntityType): string {
  if (kind === 'review') return 'reseña';
  if (kind === 'comment') return 'comentario';
  return 'usuario';
}
