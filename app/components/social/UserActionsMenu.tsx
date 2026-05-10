'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import { useToast } from '@/app/components/ui/Toast';
import ReportModal from '@/app/components/social/ReportModal';
import { blockUser, muteUser } from '@/app/lib/api/safety';
import { ApiError } from '@/app/lib/api/client';
import type { ReportEntityType } from '@/app/lib/api/reports';

type ConfirmStep = 'menu' | 'confirmBlock';

export interface UserActionsMenuProps {
  open: boolean;
  onClose: () => void;
  /** Target user that the menu acts upon. */
  targetUserId: string;
  targetDisplayName: string;
  targetHandle: string | null | undefined;
  /**
   * When set, the menu offers "Reportar reseña/comentario" as its primary
   * option. Without it, only "Reportar usuario" + Silenciar + Bloquear
   * are shown.
   */
  reportContext?: {
    entityType: ReportEntityType;
    entityId: string;
    subject?: string;
  };
  /**
   * Fired after a successful block. The parent can use this to remove the
   * user's content from the in-memory feed without waiting for the next
   * fetch (the backend will already exclude them, but optimistic removal
   * keeps the UI snappy).
   */
  onBlocked?: (userId: string) => void;
  /** Same as onBlocked but for mute. */
  onMuted?: (userId: string) => void;
}

export default function UserActionsMenu({
  open,
  onClose,
  targetUserId,
  targetDisplayName,
  targetHandle,
  reportContext,
  onBlocked,
  onMuted,
}: UserActionsMenuProps) {
  const t = useTranslations('social.userActions');
  const toast = useToast();
  const [step, setStep] = useState<ConfirmStep>('menu');
  const [reportTarget, setReportTarget] = useState<
    | { kind: ReportEntityType; id: string; subject?: string }
    | null
  >(null);
  const [busy, setBusy] = useState<'block' | 'mute' | null>(null);

  const targetLabel = targetHandle ? `@${targetHandle}` : targetDisplayName;

  function close() {
    setStep('menu');
    setReportTarget(null);
    setBusy(null);
    onClose();
  }

  function handleReportEntity() {
    if (!reportContext) return;
    setReportTarget({
      kind: reportContext.entityType,
      id: reportContext.entityId,
      subject: reportContext.subject,
    });
  }

  function handleReportUser() {
    setReportTarget({ kind: 'user', id: targetUserId, subject: targetLabel });
  }

  async function handleMute() {
    setBusy('mute');
    try {
      await muteUser(targetUserId);
      toast.toast({
        title: t('mutedToastTitle', { name: targetLabel }),
        description: t('mutedToastDescription'),
        variant: 'success',
      });
      onMuted?.(targetUserId);
      close();
    } catch (err) {
      toast.toast({
        title: t('errorTitle'),
        description:
          err instanceof ApiError && err.detail ? err.detail : t('errorGeneric'),
        variant: 'error',
      });
      setBusy(null);
    }
  }

  async function handleConfirmBlock() {
    setBusy('block');
    try {
      await blockUser(targetUserId);
      toast.toast({
        title: t('blockedToastTitle', { name: targetLabel }),
        description: t('blockedToastDescription'),
        variant: 'success',
      });
      onBlocked?.(targetUserId);
      close();
    } catch (err) {
      toast.toast({
        title: t('errorTitle'),
        description:
          err instanceof ApiError && err.detail ? err.detail : t('errorGeneric'),
        variant: 'error',
      });
      setBusy(null);
    }
  }

  // ReportModal owns its own portal/lifecycle, so it renders alongside.
  if (reportTarget) {
    return (
      <ReportModal
        open
        entityType={reportTarget.kind}
        entityId={reportTarget.id}
        subject={reportTarget.subject}
        onClose={close}
      />
    );
  }

  if (step === 'confirmBlock') {
    return (
      <Modal
        open
        onClose={busy ? () => {} : close}
        title={t('confirmBlockTitle', { name: targetLabel })}
        description={t('confirmBlockDescription')}
        size="sm"
        busy={busy === 'block'}
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setStep('menu')}
              disabled={busy === 'block'}
            >
              {t('back')}
            </Button>
            <button
              type="button"
              onClick={() => void handleConfirmBlock()}
              disabled={busy === 'block'}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md bg-action-danger px-3 py-2.5 text-xs font-medium text-text-inverse transition-colors hover:brightness-110 disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {busy === 'block' ? t('blocking') : t('confirmBlock')}
            </button>
          </>
        }
      >
        <ul className="list-disc space-y-1 pl-5 font-sans text-sm text-text-secondary">
          <li>{t('confirmBlockBullet1')}</li>
          <li>{t('confirmBlockBullet2')}</li>
          <li>{t('confirmBlockBullet3')}</li>
        </ul>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : close}
      title={t('menuTitle', { name: targetLabel })}
      hideTitle
      size="sm"
      position="bottom-sheet"
    >
      <ul className="flex flex-col" role="list">
        {reportContext && (
          <li>
            <button
              type="button"
              onClick={handleReportEntity}
              className="w-full min-h-[44px] rounded-md px-3 py-2.5 text-left font-sans text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {reportContext.entityType === 'review'
                ? t('reportReview')
                : t('reportComment')}
            </button>
          </li>
        )}
        <li>
          <button
            type="button"
            onClick={() => void handleMute()}
            disabled={busy !== null}
            className="w-full min-h-[44px] rounded-md px-3 py-2.5 text-left font-sans text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <span className="block">{t('mute', { name: targetLabel })}</span>
            <span className="block font-normal text-xs text-text-muted">
              {t('muteHint')}
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setStep('confirmBlock')}
            disabled={busy !== null}
            className="w-full min-h-[44px] rounded-md px-3 py-2.5 text-left font-sans text-sm font-medium text-action-danger transition-colors hover:bg-surface-subtle disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <span className="block">{t('block', { name: targetLabel })}</span>
            <span className="block font-normal text-xs text-text-muted">
              {t('blockHint')}
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={handleReportUser}
            className="w-full min-h-[44px] rounded-md px-3 py-2.5 text-left font-sans text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {t('reportUser', { name: targetLabel })}
          </button>
        </li>
      </ul>
    </Modal>
  );
}
