'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import Tabs from '@/app/components/ui/Tabs';
import Modal from '@/app/components/ui/Modal';
import Textarea from '@/app/components/ui/Textarea';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import {
  approveClaim,
  listAdminClaims,
  rejectClaim,
  revokeClaim,
} from '@/app/lib/api/claims';
import type { ClaimAdminItem, ClaimStatus } from '@/app/lib/types/claim';
import { formatRelativeTime } from '@/app/lib/utils/time';

type ListState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; items: ClaimAdminItem[] };

type ReasonModal =
  | { kind: 'idle' }
  | { kind: 'reject'; claim: ClaimAdminItem }
  | { kind: 'revoke'; claim: ClaimAdminItem };

const TABS: { value: ClaimStatus; label: string }[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'verified', label: 'Verificados' },
  { value: 'rejected', label: 'Rechazados' },
  { value: 'revoked', label: 'Revocados' },
];

const METHOD_LABEL: Record<string, string> = {
  domain_email: 'Email del dominio',
  google_business: 'Google Business',
  manual_admin: 'Revisión manual',
  phone_callback: 'Llamada telefónica',
};

export default function AdminClaimsClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ClaimStatus>('pending');
  const [state, setState] = useState<ListState>({ kind: 'loading' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<ReasonModal>({ kind: 'idle' });
  const [reasonText, setReasonText] = useState('');

  const load = useCallback(async (status: ClaimStatus) => {
    setState({ kind: 'loading' });
    try {
      const page = await listAdminClaims({ status, page_size: 50 });
      setState({ kind: 'ready', items: page.items });
    } catch {
      setState({ kind: 'error' });
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void load(activeTab);
    }
  }, [authLoading, user, activeTab, load]);

  const handleApprove = useCallback(
    async (claim: ClaimAdminItem) => {
      setBusyId(claim.id);
      try {
        await approveClaim(claim.id);
        // Drop from current tab — moved to Verificados.
        setState((prev) =>
          prev.kind === 'ready'
            ? { kind: 'ready', items: prev.items.filter((c) => c.id !== claim.id) }
            : prev,
        );
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const closeReasonModal = useCallback(() => {
    setReasonModal({ kind: 'idle' });
    setReasonText('');
  }, []);

  const submitReason = useCallback(async () => {
    if (reasonModal.kind === 'idle') return;
    const trimmed = reasonText.trim();
    if (trimmed.length < 3) return;
    const claim = reasonModal.claim;
    setBusyId(claim.id);
    try {
      if (reasonModal.kind === 'reject') {
        await rejectClaim(claim.id, trimmed);
      } else {
        await revokeClaim(claim.id, trimmed);
      }
      setState((prev) =>
        prev.kind === 'ready'
          ? { kind: 'ready', items: prev.items.filter((c) => c.id !== claim.id) }
          : prev,
      );
      closeReasonModal();
    } finally {
      setBusyId(null);
    }
  }, [reasonModal, reasonText, closeReasonModal]);

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[50vh] items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <h1 className="font-display text-3xl font-medium text-text-primary">
          Acceso restringido
        </h1>
        <p className="font-sans text-sm text-text-muted">
          Esta página es solo para administradores.
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          Volver al feed
        </Button>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header>
        <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
          Reclamos de restaurantes
        </h1>
        <p className="font-sans text-sm text-text-muted">
          Aprobá, rechazá o revocá reclamos de propiedad.
        </p>
      </header>

      <Tabs
        ariaLabel="Filtro por estado"
        value={activeTab}
        items={TABS}
        onChange={(v) => setActiveTab(v as ClaimStatus)}
      />

      {state.kind === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} shape="box" width="100%" height={160} />
          ))}
        </div>
      )}

      {state.kind === 'error' && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <p className="mb-3 font-sans text-sm text-text-secondary">
            No pudimos cargar los reclamos.
          </p>
          <Button variant="outline" size="sm" onClick={() => void load(activeTab)}>
            Intentar de nuevo
          </Button>
        </div>
      )}

      {state.kind === 'ready' && state.items.length === 0 && (
        <EmptyState
          title={
            activeTab === 'pending'
              ? 'Sin reclamos pendientes'
              : `No hay reclamos ${TABS.find((t) => t.value === activeTab)?.label.toLowerCase()}`
          }
          description="Cuando los dueños reclamen sus locales aparecerán acá."
        />
      )}

      {state.kind === 'ready' && state.items.length > 0 && (
        <ul className="flex list-none flex-col gap-3 p-0">
          {state.items.map((claim) => (
            <li key={claim.id}>
              <ClaimRow
                claim={claim}
                busy={busyId === claim.id}
                tab={activeTab}
                onApprove={() => void handleApprove(claim)}
                onReject={() => {
                  setReasonText('');
                  setReasonModal({ kind: 'reject', claim });
                }}
                onRevoke={() => {
                  setReasonText('');
                  setReasonModal({ kind: 'revoke', claim });
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={reasonModal.kind !== 'idle'}
        onClose={closeReasonModal}
        title={
          reasonModal.kind === 'reject'
            ? 'Rechazar reclamo'
            : reasonModal.kind === 'revoke'
              ? 'Revocar verificación'
              : 'Acción'
        }
      >
        <div className="flex flex-col gap-3">
          <p className="font-sans text-sm text-text-secondary">
            Escribí el motivo. Va a quedar guardado en el historial del reclamo
            y se notifica al solicitante.
          </p>
          <Textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Motivo (mínimo 3 caracteres)…"
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="md" onClick={closeReasonModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={reasonText.trim().length < 3}
              loading={
                reasonModal.kind !== 'idle' && busyId === reasonModal.claim.id
              }
              onClick={() => void submitReason()}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ClaimRow({
  claim,
  busy,
  tab,
  onApprove,
  onReject,
  onRevoke,
}: {
  claim: ClaimAdminItem;
  busy: boolean;
  tab: ClaimStatus;
  onApprove: () => void;
  onReject: () => void;
  onRevoke: () => void;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
            {METHOD_LABEL[claim.verification_method] ?? claim.verification_method}
            {' · '}
            <time dateTime={claim.submitted_at}>
              {formatRelativeTime(claim.submitted_at)}
            </time>
          </p>
          <Link
            href={`/restaurants/${claim.restaurant.slug}`}
            className="mt-1 block font-display text-lg text-text-primary hover:underline"
          >
            {claim.restaurant.name}
          </Link>
          <p className="font-sans text-xs text-text-muted">
            {claim.restaurant.location_name}
          </p>
        </div>
        <span className="rounded-full bg-surface-subtle px-3 py-1 font-sans text-xs text-text-secondary">
          {claim.status}
        </span>
      </div>

      <div className="rounded-md bg-surface-subtle p-3 text-sm">
        <p className="font-sans text-text-secondary">
          <span className="font-medium">Solicitante:</span>{' '}
          {claim.claimant.display_name} ({claim.claimant.email})
        </p>
        {claim.contact_email && claim.contact_email !== claim.claimant.email && (
          <p className="font-sans text-text-secondary">
            <span className="font-medium">Email de contacto:</span>{' '}
            {claim.contact_email}
          </p>
        )}
        {claim.evidence_urls && claim.evidence_urls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {claim.evidence_urls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-action-primary hover:underline"
              >
                {url}
              </a>
            ))}
          </div>
        )}
        {claim.rejection_reason && (
          <p className="mt-2 font-sans text-text-secondary">
            <span className="font-medium">Motivo de rechazo / revocación:</span>{' '}
            {claim.rejection_reason}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {tab === 'pending' && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onReject}
            >
              Rechazar
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={busy}
              loading={busy}
              onClick={onApprove}
            >
              Aprobar
            </Button>
          </>
        )}
        {tab === 'verified' && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onRevoke}
          >
            Revocar
          </Button>
        )}
      </div>
    </article>
  );
}
