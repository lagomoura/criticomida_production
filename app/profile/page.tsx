'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { getMyReviews } from '@/app/lib/api/reviews';
import { MyReview } from '@/app/lib/types';
import ReviewCard from './components/ReviewCard';
import AddReviewModal from './components/AddReviewModal';
import EditReviewModal from './components/EditReviewModal';
import EditProfileForm from './components/EditProfileForm';
import ThemeToggle from '@/app/components/ThemeToggle';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  critic: 'Crítico',
  user: 'Usuario',
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReview, setEditingReview] = useState<MyReview | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingReviews(true);
    setReviewsError(null);
    getMyReviews()
      .then(setReviews)
      .catch(() => setReviewsError('No se pudieron cargar tus reseñas.'))
      .finally(() => setLoadingReviews(false));
  }, [isAuthenticated]);

  function handleReviewAdded(review: MyReview) {
    setReviews((prev) => [review, ...prev]);
    setShowAddModal(false);
  }

  function handleReviewUpdated(updated: MyReview) {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingReview(null);
  }

  function handleReviewDeleted(reviewId: string) {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  // Loading auth
  if (authLoading) {
    return (
      <main id="main-content" className="cc-container py-16 flex justify-center">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--mainPink)] border-t-transparent" />
      </main>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <main id="main-content" className="cc-container py-12 md:py-16">
        <h1 className="mb-3 text-2xl font-bold text-neutral-900 md:text-3xl">Tu perfil</h1>
        <p className="mb-6 max-w-xl text-neutral-600">
          Necesitás estar logueado para ver tu panel de usuario.
        </p>
        <Link href="/" className="btn btn-primary">
          Ir al inicio
        </Link>
      </main>
    );
  }

  return (
    <>
      <main id="main-content" className="cc-container py-10 md:py-14">

        {/* User header */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mainPink)] text-2xl font-bold text-white">
            {user!.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-neutral-900">{user!.display_name}</h1>
              <span className="rounded-full bg-[var(--mainPink)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--mainPink)]">
                {ROLE_LABELS[user!.role] ?? user!.role}
              </span>
            </div>
            <p className="text-sm text-neutral-500">{user!.email}</p>
          </div>
        </div>

        {/* Edit public profile */}
        <EditProfileForm />

        {/* Quick link to saved reviews */}
        <Link
          href="/saved"
          className="mb-6 flex items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3 no-underline transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <div>
            <p className="font-sans text-sm font-medium text-text-primary">Guardados</p>
            <p className="font-sans text-xs text-text-muted">
              Las reseñas que marcaste para volver.
            </p>
          </div>
          <span className="font-sans text-sm text-action-primary">Ver →</span>
        </Link>

        {/* Theme setting */}
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3">
          <div>
            <p className="font-sans text-sm font-medium text-text-primary">Tema</p>
            <p className="font-sans text-xs text-text-muted">Alterná entre claro y oscuro.</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Reviews section */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-neutral-900">
              Mis reseñas
              {reviews.length > 0 && (
                <span className="ml-2 text-base font-normal text-neutral-400">
                  ({reviews.length})
                </span>
              )}
            </h2>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddModal(true)}
            >
              + Agregar reseña
            </button>
          </div>

          {loadingReviews ? (
            <div className="flex justify-center py-12">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--mainPink)] border-t-transparent" />
            </div>
          ) : reviewsError ? (
            <div className="alert alert-danger">{reviewsError}</div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-14 text-center">
              <p className="text-neutral-400">Todavía no tenés reseñas.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm mt-4"
                onClick={() => setShowAddModal(true)}
              >
                Escribir tu primera reseña
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={setEditingReview}
                  onDeleted={handleReviewDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <AddReviewModal
          onSuccess={handleReviewAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onSuccess={handleReviewUpdated}
          onClose={() => setEditingReview(null)}
        />
      )}
    </>
  );
}
