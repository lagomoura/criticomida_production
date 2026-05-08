'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import type { ReviewPost } from '@/app/lib/types/social';

export interface PostActionsMenuProps {
  post: ReviewPost;
  onClose: () => void;
  onDelete: (postId: string) => Promise<void>;
  onEdit: (postId: string) => void;
}

export default function PostActionsMenu({ post, onClose, onDelete, onEdit }: PostActionsMenuProps) {
  const t = useTranslations('profile.postActionsMenu');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      await onDelete(post.id);
      onClose();
    } catch {
      setDeleting(false);
      setError(t('deleteError'));
    }
  }

  if (confirming) {
    return (
      <Modal
        open
        onClose={onClose}
        title={t('deleteTitle')}
        description={t('deleteDescription', { dishName: post.dish.name })}
        size="sm"
        busy={deleting}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
              {t('back')}
            </Button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-action-danger px-3 text-xs font-medium text-white transition-colors hover:brightness-110 disabled:opacity-60 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              {deleting ? t('deleting') : t('confirmDelete')}
            </button>
          </>
        }
      >
        {error && (
          <p className="font-sans text-sm text-action-danger" role="alert">
            {error}
          </p>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={t('menuTitle')}
      hideTitle
      size="sm"
      position="bottom-sheet"
    >
      <ul className="flex flex-col" role="list">
        <li>
          <button
            type="button"
            onClick={() => onEdit(post.id)}
            className="w-full rounded-md px-3 py-3 text-left font-sans text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {t('edit')}
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="w-full rounded-md px-3 py-3 text-left font-sans text-sm font-medium text-action-danger transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {t('delete')}
          </button>
        </li>
      </ul>
    </Modal>
  );
}
