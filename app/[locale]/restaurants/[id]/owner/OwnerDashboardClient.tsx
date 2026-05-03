'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import Image from 'next/image';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import { getRestaurant } from '@/app/lib/api/restaurants';
import { uploadRestaurantImage } from '@/app/lib/api/images';
import {
  addOfficialPhoto,
  deleteOfficialPhoto,
  listOfficialPhotos,
  listOwnerReviews,
  type OwnerReviewItem,
  type SentimentLabel,
} from '@/app/lib/api/owner-content';
import type { OfficialPhoto } from '@/app/lib/types/owner-content';
import BusinessChatLauncher from '@/app/components/chat/BusinessChatLauncher';

interface Props {
  restaurantSlug: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLocation: string;
}

type GateState =
  | { kind: 'checking' }
  | { kind: 'forbidden' }
  | { kind: 'not_signed_in' }
  | { kind: 'authorized' };

const PHOTO_CAP = 5;

const SENTIMENT_FILTERS: { key: SentimentLabel | null; tKey: string }[] = [
  { key: null, tKey: 'sentimentFilterAll' },
  { key: 'positive', tKey: 'sentimentFilterPositive' },
  { key: 'neutral', tKey: 'sentimentFilterNeutral' },
  { key: 'negative', tKey: 'sentimentFilterNegative' },
];

const SENTIMENT_BADGE_CLASSES: Record<SentimentLabel, string> = {
  positive: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-neutral-200 text-neutral-700',
  negative: 'bg-rose-100 text-rose-700',
};

export default function OwnerDashboardClient({
  restaurantSlug,
  restaurantId,
  restaurantName,
  restaurantLocation,
}: Props) {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('ownerDashboard');
  const locale = useLocale();

  const [gate, setGate] = useState<GateState>({ kind: 'checking' });
  const [isAdminViewer, setIsAdminViewer] = useState(false);
  const [photos, setPhotos] = useState<OfficialPhoto[]>([]);
  const [reviews, setReviews] = useState<OwnerReviewItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentLabel | null>(
    null,
  );
  const [sortByNegativeFirst, setSortByNegativeFirst] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadReviews = useCallback(async () => {
    try {
      const reviewsResp = await listOwnerReviews(restaurantSlug, {
        sentiment: sentimentFilter ?? undefined,
        sort: sortByNegativeFirst ? 'sentiment_asc' : undefined,
      });
      setReviews(reviewsResp.items);
      setPendingCount(reviewsResp.pending_count);
    } catch {
      // Silent — el render decide qué mostrar.
    }
  }, [restaurantSlug, sentimentFilter, sortByNegativeFirst]);

  const loadAll = useCallback(async () => {
    try {
      const [photosResp] = await Promise.all([
        listOfficialPhotos(restaurantSlug),
        loadReviews(),
      ]);
      setPhotos(photosResp.items);
    } catch {
      // Silent — el render decide qué mostrar.
    }
  }, [restaurantSlug, loadReviews]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setGate({ kind: 'not_signed_in' });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const detail = await getRestaurant(restaurantSlug);
        if (cancelled) return;
        const isAdmin = user.role === 'admin';
        if (!detail.viewer_is_owner && !isAdmin) {
          setGate({ kind: 'forbidden' });
          return;
        }
        setIsAdminViewer(isAdmin && !detail.viewer_is_owner);
        setGate({ kind: 'authorized' });
        await loadAll();
      } catch {
        if (!cancelled) setGate({ kind: 'forbidden' });
      }
    })();
    return () => {
      cancelled = true;
    };
    // loadAll is recreated when sentimentFilter changes; we only want
    // the auth-gate effect to run on identity/slug changes, so we
    // intentionally exclude loadAll here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, restaurantSlug]);

  useEffect(() => {
    if (gate.kind !== 'authorized') return;
    void loadReviews();
  }, [gate.kind, loadReviews]);

  const handleUpload = useCallback(
    async (file: File) => {
      setPhotoError(null);
      if (photos.length >= PHOTO_CAP) {
        setPhotoError(t('photoMaxError', { n: PHOTO_CAP }));
        return;
      }
      setPhotoBusy(true);
      try {
        const url = await uploadRestaurantImage(file, restaurantId);
        const created = await addOfficialPhoto(restaurantSlug, {
          url,
          alt_text: file.name.replace(/\.[^/.]+$/, '').slice(0, 80),
          display_order: photos.length,
        });
        setPhotos((prev) => [...prev, created]);
      } catch (err) {
        setPhotoError(
          err instanceof ApiError && err.status === 409
            ? t('photoMaxError', { n: PHOTO_CAP })
            : t('photoUploadError'),
        );
      } finally {
        setPhotoBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [photos.length, restaurantId, restaurantSlug, t],
  );

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      if (!confirm(t('photoDeleteConfirm'))) return;
      try {
        await deleteOfficialPhoto(restaurantSlug, photoId);
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } catch {
        setPhotoError(t('photoDeleteError'));
      }
    },
    [restaurantSlug, t],
  );

  if (gate.kind === 'checking' || authLoading) {
    return (
      <div className="cc-container flex min-h-[40vh] items-center justify-center py-12">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (gate.kind === 'not_signed_in') {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">{t('signInTitle')}</h1>
        <p className="font-sans text-sm text-text-muted">
          {t('signInDescription')}
        </p>
        <div>
          <Button variant="primary" size="md" onClick={() => router.push('/')}>
            {t('goHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (gate.kind === 'forbidden') {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">{t('forbiddenTitle')}</h1>
        <p className="font-sans text-sm text-text-muted">
          {t('forbiddenDescription', { name: restaurantName })}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="text-sm font-semibold text-[var(--color-canela)] no-underline hover:underline"
          >
            {t('backToRestaurant')}
          </Link>
          <Link
            href={`/restaurants/${restaurantSlug}/claim`}
            className="text-sm font-semibold text-text-muted no-underline hover:underline"
          >
            {t('claimAction')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-8 py-8">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
          {t('kicker')}
        </p>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">
          {restaurantName}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {restaurantLocation}
        </p>
        {isAdminViewer && (
          <p className="mt-2 inline-flex items-center gap-2 self-start rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {t('adminViewerNotice')}
          </p>
        )}
      </header>

      <BusinessChatLauncher
        restaurantScopeId={restaurantId}
        restaurantName={restaurantName}
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium">{t('officialPhotos')}</h2>
          <span className="font-sans text-xs text-text-muted">
            {photos.length} / {PHOTO_CAP}
          </span>
        </div>
        <p className="font-sans text-sm text-text-secondary">
          {t('photosIntro')}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100"
            >
              <Image
                src={photo.url}
                alt={photo.alt_text ?? t('photoDefaultAlt')}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => void handleDeletePhoto(photo.id)}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
              >
                {t('photoDeleteAction')}
              </button>
            </div>
          ))}
          {photos.length < PHOTO_CAP && (
            <label
              className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border-default bg-surface-subtle text-center font-sans text-xs text-text-muted hover:bg-surface-card ${
                photoBusy ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={photoBusy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
              <span className="text-2xl" aria-hidden>+</span>
              <span>{photoBusy ? t('photoUploading') : t('photoUploadCta')}</span>
            </label>
          )}
        </div>

        {photoError && (
          <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
            {photoError}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium">{t('reviewsHeading')}</h2>
          {reviews.length > 0 && (
            <span className="font-sans text-xs text-text-muted">
              {t('reviewsCounter', { pending: pendingCount, total: reviews.length })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label={t('sentimentFilterLabel')} className="flex flex-wrap gap-1.5">
            {SENTIMENT_FILTERS.map(({ key, tKey }) => {
              const active = sentimentFilter === key;
              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setSentimentFilter(key)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 font-sans text-xs font-semibold transition ${
                    active
                      ? 'bg-[var(--color-canela)] text-white'
                      : 'bg-surface-subtle text-text-secondary hover:bg-surface-card'
                  }`}
                >
                  {t(tKey)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSortByNegativeFirst((v) => !v)}
            aria-pressed={sortByNegativeFirst}
            className={`ml-auto rounded-full px-3 py-1 font-sans text-xs font-semibold transition ${
              sortByNegativeFirst
                ? 'bg-rose-600 text-white'
                : 'bg-surface-subtle text-text-secondary hover:bg-surface-card'
            }`}
          >
            {t('sentimentSortNegativeFirst')}
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-default p-6 text-center font-sans text-sm text-text-muted">
            {sentimentFilter !== null ? t('noReviewsForFilter') : t('noReviews')}
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-2 p-0">
            {reviews.map((review) => (
              <li key={review.id}>
                <Link
                  href={`/reviews/${review.id}`}
                  className="flex flex-col gap-1 rounded-2xl border border-border-default bg-surface-card p-4 no-underline transition hover:border-[var(--color-canela)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-base text-text-primary">
                      {review.dish_name}
                      <span className="ml-2 font-sans text-sm text-text-muted">
                        ★ {review.rating.toFixed(1)}
                      </span>
                    </span>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {review.sentiment_label && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SENTIMENT_BADGE_CLASSES[review.sentiment_label]}`}
                        >
                          {t(`sentiment_${review.sentiment_label}`)}
                        </span>
                      )}
                      {review.has_owner_response ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          {t('responded')}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          {t('notResponded')}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="line-clamp-2 font-sans text-sm text-text-secondary">
                    {review.note}
                  </p>
                  <p className="font-sans text-xs text-text-muted">
                    {review.is_anonymous
                      ? t('anonymous')
                      : review.user_handle
                        ? `@${review.user_handle}`
                        : review.user_display_name}{' '}
                    · {new Date(review.date_tasted).toLocaleDateString(locale)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--color-crema-darker)] bg-surface-subtle p-4">
        <h2 className="font-display text-lg">{t('moreChangesHeading')}</h2>
        <p className="font-sans text-sm text-text-muted">
          {t('moreChangesDescription')}
        </p>
      </section>

      <footer>
        <Link
          href={`/restaurants/${restaurantSlug}`}
          className="font-sans text-sm text-[var(--color-canela)] no-underline hover:underline"
        >
          {t('backToPublic')}
        </Link>
      </footer>
    </div>
  );
}
