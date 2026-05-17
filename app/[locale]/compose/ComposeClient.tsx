'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faCircle,
  faCircleCheck,
  faLock,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import RestaurantAutocomplete, {
  type SelectedPlace,
} from '@/app/components/social/RestaurantAutocomplete';
import DishAutocomplete, {
  type SelectedDish,
} from '@/app/components/social/DishAutocomplete';
import ReviewFormBody, {
  companyToVisitedWith,
  type PhotoEntry,
  type ReviewFormBodyValue,
} from '@/app/components/social/ReviewFormBody';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { createPost, type ComposeRestaurant } from '@/app/lib/api/compose';
import { getDishDetail } from '@/app/lib/api/dishes-social';
import { uploadReviewPhoto } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { useToast } from '@/app/components/ui/Toast';
import type { PriceTier, ReviewExtras } from '@/app/lib/types/social';
import {
  clearComposeDraft,
  hasDetailsContent,
  readComposeDraft,
  writeComposeDraft,
} from '@/app/lib/utils/compose-draft';

const MIN_TEXT = 20;
const MAX_TEXT = 1200;

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

const PRICE_TIER_OPTIONS: { value: PriceTier; symbol: string; labelKey: string }[] = [
  { value: '$', symbol: '$', labelKey: 'priceTierCheap' },
  { value: '$$', symbol: '$$', labelKey: 'priceTierMid' },
  { value: '$$$', symbol: '$$$', labelKey: 'priceTierHigh' },
];

function makeBodyInitial(): ReviewFormBodyValue {
  return {
    rating: 5,
    wouldOrderAgain: null,
    pillars: { presentation: null, value_prop: null, execution: null },
    note: '',
    pros: [],
    cons: [],
    existingImages: [],
    photos: [],
    pricePaid: '',
    portionSize: '',
    dateTasted: new Date().toISOString().slice(0, 10),
    mealPeriod: null,
    companyType: null,
    visitedWith: '',
    tags: [],
    isAnonymous: false,
  };
}

export default function ComposeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuthContext();
  const toast = useToast();
  const t = useTranslations('compose');
  const tForm = useTranslations('restaurant.dishReviewForm');
  const tModal = useTranslations('restaurant.publishReviewModal');

  const prefillDishId = searchParams?.get('dish') ?? null;

  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [dish, setDish] = useState<SelectedDish | null>(null);
  const [priceTier, setPriceTier] = useState<PriceTier | null>(null);
  const [body, setBody] = useState<ReviewFormBodyValue>(makeBodyInitial);

  const [prefilling, setPrefilling] = useState(Boolean(prefillDishId));
  const [submitting, setSubmitting] = useState(false);
  // Progressive-disclosure state for the new compose layout. `expandedDetails`
  // toggles the "Agregar detalles" collapse below the essentials block. Auto-
  // opens on draft restore when the saved body has any optional content.
  const [expandedDetails, setExpandedDetails] = useState(false);
  // Tracks upload status per-photo (keyed by PhotoEntry.id) so we can show
  // granular progress in the submit button while Promise.all runs in parallel.
  const [uploadProgress, setUploadProgress] = useState<Map<number, UploadStatus>>(new Map());
  const [formError, setFormError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  // Hydration gate for the autosave effect: skip the very first render so we
  // don't clobber the persisted draft with the empty initial state before the
  // restore effect has had a chance to run.
  const draftHydrated = useRef(false);

  // Restore a persisted draft on mount. Skipped when the URL pre-fills a dish
  // — that flow is "review *this* dish", not "continue your last review".
  useEffect(() => {
    if (prefillDishId) {
      draftHydrated.current = true;
      return;
    }
    const snap = readComposeDraft();
    if (snap) {
      if (snap.place) setPlace(snap.place);
      if (snap.dish) setDish(snap.dish);
      setPriceTier(snap.priceTier);
      setBody({ ...snap.body, photos: [], existingImages: [] });
      setDraftRestored(true);
      // Auto-expand the details collapse when the restored body holds any
      // optional content — the user lands on what they were filling out, not
      // a hidden panel. Fall back to the persisted flag if present.
      if (snap.expandedDetails || hasDetailsContent(snap.body)) {
        setExpandedDetails(true);
      }
    }
    draftHydrated.current = true;
  }, [prefillDishId]);

  // Autosave with a 600ms debounce. Photos and existingImages are stripped:
  // File/Blob references can't survive a reload, and re-syncing stale
  // ObjectURLs would point at nothing. The user re-attaches the photos but
  // keeps the costly text/rating/metadata.
  useEffect(() => {
    if (!draftHydrated.current) return;
    if (submitting) return;
    const handle = window.setTimeout(() => {
      // We can't import the inferred Omit type cleanly here; the writer
      // accepts the same shape minus `savedAt`, which we provide.
      const bodyWithoutPhotos = {
        ...body,
        photos: undefined,
        existingImages: undefined,
      };
      delete (bodyWithoutPhotos as Record<string, unknown>).photos;
      delete (bodyWithoutPhotos as Record<string, unknown>).existingImages;
      writeComposeDraft({
        place,
        dish,
        priceTier,
        body: bodyWithoutPhotos as Parameters<typeof writeComposeDraft>[0]['body'],
        expandedDetails,
      });
    }, 600);
    return () => window.clearTimeout(handle);
  }, [place, dish, priceTier, body, submitting, expandedDetails]);

  // Cleanup blob previews on unmount.
  useEffect(() => {
    return () => {
      body.photos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDiscardDraft = useCallback(() => {
    clearComposeDraft();
    setPlace(null);
    setDish(null);
    setPriceTier(null);
    setBody(makeBodyInitial());
    setDraftRestored(false);
    setExpandedDetails(false);
  }, []);

  useEffect(() => {
    if (!prefillDishId) return;
    let cancelled = false;
    setPrefilling(true);
    (async () => {
      try {
        const detail = await getDishDetail(prefillDishId);
        if (cancelled) return;
        setDish({ id: null, name: detail.name });
      } catch {
        // Non-fatal — user can fill manually.
      } finally {
        if (!cancelled) setPrefilling(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prefillDishId]);

  const isNewDish = dish !== null && dish.id === null;

  const noteLength = body.note.trim().length;

  const canSubmit =
    !submitting &&
    place !== null &&
    dish !== null &&
    dish.name.trim().length > 1 &&
    noteLength >= MIN_TEXT &&
    noteLength <= MAX_TEXT;

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!canSubmit || !user || !place || !dish) return;

      // Validate price (mirror ReviewFormBody handling but raise via toast).
      const trimmedPrice = body.pricePaid.trim();
      let pricePaidParsed: number | undefined;
      if (trimmedPrice !== '') {
        const n = Number(trimmedPrice);
        if (!Number.isFinite(n) || n <= 0) {
          setFormError(tForm('priceInvalid'));
          return;
        }
        pricePaidParsed = n;
      }

      setSubmitting(true);
      setFormError(null);

      // Reset progress so a retry starts clean.
      if (body.photos.length > 0) {
        setUploadProgress(
          new Map(body.photos.map((p) => [p.id, 'pending'])),
        );
      }

      const restaurant: ComposeRestaurant = {
        placeId: place.place_id,
        name: place.name,
        formattedAddress: place.formatted_address,
        latitude: place.latitude,
        longitude: place.longitude,
        city: place.city,
        googleMapsUrl: place.google_maps_url,
        website: place.website,
        phoneNumber: place.phone_number,
      };

      // Tracks each upload individually so the button copy can show live
      // progress ("Subiendo 2/3 fotos…"). Promise.all is kept — any single
      // failure aborts the whole submit so we never publish a partial set.
      const runUpload = async (photo: PhotoEntry, index: number): Promise<string> => {
        setUploadProgress((prev) => new Map(prev).set(photo.id, 'uploading'));
        try {
          const url = await uploadReviewPhoto(user.id, photo.file, index);
          setUploadProgress((prev) => new Map(prev).set(photo.id, 'done'));
          return url;
        } catch (err) {
          setUploadProgress((prev) => new Map(prev).set(photo.id, 'error'));
          throw err;
        }
      };

      // Failsafe: si la navegación post-submit no descarga la pantalla
      // (puede pasar en dev con HMR, o si el router.push se traga la
      // navegación silenciosamente), liberamos el botón al cabo de 12 s
      // para que el usuario no quede prendido en "Publicando…" para
      // siempre. El reset se cancela en el catch (que ya pone false) y
      // se cancela también después de un router.push exitoso para no
      // gatillar tarde si la navegación efectivamente ocurrió.
      const failsafeUnlock = window.setTimeout(() => {
        setSubmitting(false);
      }, 12000);

      try {
        const imageUrls = body.photos.length > 0
          ? await Promise.all(body.photos.map((p, i) => runUpload(p, i)))
          : [];

        const prosFiltered = body.pros.map((p) => p.trim()).filter(Boolean);
        const consFiltered = body.cons.map((c) => c.trim()).filter(Boolean);
        const tagsFiltered = body.tags.map((s) => s.trim()).filter(Boolean);
        const visitedWithPayload = companyToVisitedWith(body.companyType, body.visitedWith);

        const trimmedDishName = dish.name.trim();
        const altFor = (i: number, total: number) =>
          total > 1
            ? tForm('altPhotoIndexed', { index: i + 1, dish: trimmedDishName })
            : tForm('altPhotoSingle', { dish: trimmedDishName });

        const extras: ReviewExtras = {};
        if (body.portionSize) extras.portionSize = body.portionSize;
        if (body.wouldOrderAgain !== null) extras.wouldOrderAgain = body.wouldOrderAgain;
        if (visitedWithPayload) extras.visitedWith = visitedWithPayload;
        if (body.isAnonymous) extras.isAnonymous = true;
        if (body.dateTasted) extras.dateTasted = body.dateTasted;
        if (body.mealPeriod) extras.mealPeriod = body.mealPeriod;
        if (isNewDish && priceTier) extras.priceTier = priceTier;
        if (pricePaidParsed !== undefined) extras.pricePaid = pricePaidParsed;
        if (prosFiltered.length) extras.pros = prosFiltered;
        if (consFiltered.length) extras.cons = consFiltered;
        if (tagsFiltered.length) extras.tags = tagsFiltered;
        if (body.pillars.presentation) extras.presentation = body.pillars.presentation;
        if (body.pillars.value_prop) extras.valueProp = body.pillars.value_prop;
        if (body.pillars.execution) extras.execution = body.pillars.execution;
        if (imageUrls.length > 0) {
          extras.images = imageUrls.map((url, i) => ({
            url,
            altText: altFor(i, imageUrls.length),
            displayOrder: i,
          }));
        }

        const post = await createPost({
          dishName: trimmedDishName,
          dishId: dish.id,
          restaurant,
          score: body.rating,
          text: body.note.trim(),
          extras: Object.keys(extras).length > 0 ? extras : undefined,
          author: {
            id: user.id,
            displayName: user.display_name || user.email,
            handle: null,
            avatarUrl: user.avatar_url ?? null,
          },
        });
        clearComposeDraft();
        const postId = post.id;
        toast.toast({
          title: t('successTitle'),
          description: t('successDescription', { dish: dish.name, restaurant: place.name }),
          variant: 'success',
          duration: 6000,
          action: {
            label: t('viewReview'),
            onClick: () => router.push(`/reviews/${postId}`),
          },
        });
        router.push(`/reviews/${postId}`);
        // Plan A: la navegación descarga la pantalla, no hace falta
        // resetear submitting. Plan B (defensivo): si por algún motivo
        // la nav no descarga (HMR, ruta inválida, etc.) liberamos el
        // botón después de un beat corto para que el usuario pueda
        // intentar volver a publicar o navegar al review desde el toast.
        window.clearTimeout(failsafeUnlock);
        window.setTimeout(() => setSubmitting(false), 1500);
      } catch (err) {
        window.clearTimeout(failsafeUnlock);
        const message =
          err instanceof ApiError && typeof err.detail === 'string'
            ? err.detail
            : t('errorMessage');
        setFormError(message);
        toast.error(t('errorTitle'), message);
        setSubmitting(false);
      }
    },
    [canSubmit, user, place, dish, body, priceTier, isNewDish, router, toast, t, tForm],
  );

  const minCharsHint = useMemo(() => {
    if (noteLength === 0) return null;
    if (noteLength >= MIN_TEXT) return null;
    return t('minCharsHint', { remaining: MIN_TEXT - noteLength });
  }, [noteLength, t]);

  /**
   * The three publish requirements as a live checklist. Shown continuously
   * near the CTA while incomplete so the user always knows what's missing —
   * closing the feedback loop instead of one reactive hint on the disabled
   * button (mobile-ux audit Medio #7).
   */
  const requirements = useMemo(
    () => [
      { key: 'restaurant', label: t('checklistRestaurant'), done: place !== null },
      {
        key: 'dish',
        label: t('checklistDish'),
        done: dish !== null && dish.name.trim().length > 1,
      },
      {
        key: 'note',
        label: t('checklistNote'),
        done: noteLength >= MIN_TEXT && noteLength <= MAX_TEXT,
      },
    ],
    [place, dish, noteLength, t],
  );

  /**
   * Dynamic copy for the submit button that reflects the current upload phase:
   *   - idle / no photos: "Publicar reseña" (static label, spinner added by Button)
   *   - photos uploading: "Subiendo 2/3 foto(s)…"
   *   - all uploaded, creating post: "Publicando…"
   */
  const submitLabel = useMemo(() => {
    if (!submitting) return t('submit');
    const total = body.photos.length;
    if (total === 0) return t('creatingPost');
    const doneCount = Array.from(uploadProgress.values()).filter(
      (s) => s === 'done',
    ).length;
    // While at least one photo is still pending/uploading, show granular counter.
    if (doneCount < total) {
      return t('uploadingPhotos', { done: doneCount, total });
    }
    // All photos done — now the createPost call is in flight.
    return t('creatingPost');
  }, [submitting, body.photos.length, uploadProgress, t]);

  if (authLoading) return <LoadingView />;

  if (!user) {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <FontAwesomeIcon icon={faLock} className="h-8 w-8 text-text-muted" aria-hidden />
        <h1 className="font-display text-3xl font-medium text-text-primary">
          {t('anonTitle')}
        </h1>
        <p className="max-w-md font-sans text-sm text-text-muted">
          {t('anonDescription')}
        </p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/login?next=/compose')}
          >
            {t('signIn')}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => router.push('/registro?next=/compose')}
          >
            {t('createAccount')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cc-container flex max-w-3xl flex-col gap-4 py-5"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)' }}
    >
      <header className="flex flex-col gap-1">
        <h1 className="line-clamp-2 font-display text-3xl font-medium text-text-primary sm:text-4xl">
          {dish?.name?.trim()
            ? t('titleWithDish', { dish: dish.name.trim() })
            : t('title')}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {t('subtitle')}
        </p>
      </header>

      {draftRestored && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-color-terracota/40 bg-color-terracota-pale px-3.5 py-3 shadow-[var(--shadow-micro)]"
        >
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="m-0 font-sans text-sm font-semibold text-text-primary">
              {t('draftRestoredTitle')}
            </p>
            <p className="m-0 font-sans text-[12.5px] leading-snug text-text-secondary">
              {t('draftRestoredDesc')}
            </p>
          </div>
        </div>
      )}

      {prefilling ? (
        <Skeleton shape="box" width="100%" height={320} />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          noValidate
        >
          {/* 1. Essentials — captura emocional primero: foto + rating +
              ¿lo pedirías? + nota. El "qué pasó" antes del "dónde fue". */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-border-subtle bg-surface-page p-3 text-text-primary sm:gap-3 sm:p-4">
            <ReviewFormBody
              value={body}
              onChange={setBody}
              mode="essentials"
              dishId={dish?.id ?? undefined}
              dishName={dish?.name ?? ''}
              currencyCode={null}
              submitting={submitting}
            />
          </div>

          {/* 2. Identificación — restaurante + plato. Va después de la
              captura para que el formulario no arranque pidiendo datos fríos.
              El kicker editorial le da jerarquía de "sección" a este bloque
              en vez de que se lea como dos campos sueltos más (social-design
              audit Alto #2). */}
          <div className="flex flex-col gap-3">
            <div
              role="separator"
              aria-label={t('identificationKicker')}
              className="flex items-center gap-3 pt-1"
            >
              <span className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-[0.20em] text-color-terracota">
                {t('identificationKicker')}
              </span>
              <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
            </div>
            <RestaurantAutocomplete
              value={place}
              onChange={setPlace}
              disabled={submitting}
              label={t('restaurantQuestion')}
              placeholder={t('restaurantPlaceholder')}
            />
            <DishAutocomplete
              restaurantPlaceId={place?.place_id ?? null}
              value={dish}
              onChange={setDish}
              disabled={submitting}
              label={t('dishQuestion')}
            />
          </div>

          {/* 3. Agregar detalles — single toggle. Esconde lo opcional para
              que el usuario no sienta que tiene 14 campos por completar. */}
          <button
            type="button"
            onClick={() => setExpandedDetails((v) => !v)}
            aria-expanded={expandedDetails}
            aria-controls="compose-details"
            className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-2xl border border-border-default bg-surface-card px-4 py-3 text-left font-sans text-sm font-semibold text-text-primary transition-colors hover:border-color-terracota focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <span className="flex flex-col">
              <span>{expandedDetails ? t('collapseDetails') : t('addDetailsCta')}</span>
              {!expandedDetails && (
                <span className="font-normal text-xs text-text-muted">
                  {t('addDetailsHint')}
                </span>
              )}
            </span>
            <FontAwesomeIcon
              icon={expandedDetails ? faChevronUp : faChevronDown}
              className="h-3 w-3 text-text-muted"
              aria-hidden
            />
          </button>

          <div
            id="compose-details"
            hidden={!expandedDetails}
            className="flex flex-col gap-3"
          >
            {/* Price tier — sólo cuando se está creando un plato nuevo;
                para platos existentes ya vino del catálogo. */}
            {isNewDish && (
              <div>
                <label className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  {tModal('priceRangeLabel')}
                </label>
                <div role="radiogroup" aria-label={tModal('priceRangeLabel')} className="grid grid-cols-3 gap-2">
                  {PRICE_TIER_OPTIONS.map((opt) => {
                    const isSelected = priceTier === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={submitting}
                        onClick={() => setPriceTier(isSelected ? null : opt.value)}
                        className={[
                          'flex flex-col items-center justify-center gap-0.5',
                          'rounded-xl border-2 px-3 py-2 transition-all',
                          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                          isSelected
                            ? 'border-color-terracota bg-color-terracota-pale text-color-terracota-deep shadow-[var(--shadow-micro)]'
                            : 'border-border-subtle bg-surface-card text-text-secondary hover:border-border-default hover:bg-surface-subtle',
                        ].join(' ')}
                      >
                        <span className="font-display text-xl font-semibold leading-none">
                          {opt.symbol}
                        </span>
                        <span className="text-[9.5px] font-medium uppercase tracking-[0.1em]">
                          {tModal(opt.labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detalles del review body — pilares, pros/cons, contexto,
                tags, anónimo. Misma forma que el modal. */}
            <div className="flex flex-col gap-2.5 rounded-2xl border border-border-subtle bg-surface-page p-3 text-text-primary sm:gap-3 sm:p-4">
              <ReviewFormBody
                value={body}
                onChange={setBody}
                mode="details"
                dishId={dish?.id ?? undefined}
                dishName={dish?.name ?? ''}
                currencyCode={null}
                submitting={submitting}
              />
            </div>
          </div>

          {minCharsHint && (
            <p className="m-0 font-sans text-xs text-text-muted" role="status" aria-live="polite">
              {minCharsHint}
            </p>
          )}

          {formError && (
            <p className="m-0 font-sans text-sm text-action-danger" role="status" aria-live="polite">
              {formError}
            </p>
          )}

          {/* Sticky submit bar — el botón "Descartar borrador" se monta
              acá cuando hay draft restaurado para que viva en la zona del
              pulgar, junto al CTA primario. */}
          <div
            className="sticky bottom-0 z-30 -mx-3 mt-1 border-t border-border-subtle bg-surface-page/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-surface-page/85 sm:-mx-0 sm:px-0"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
          >
            {!canSubmit && !submitting && (
              <div
                className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1"
                role="status"
                aria-live="polite"
              >
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  {t('checklistTitle')}
                </span>
                {requirements.map((r) => (
                  <span
                    key={r.key}
                    className={
                      'inline-flex items-center gap-1 font-sans text-xs ' +
                      (r.done
                        ? 'text-color-dorado'
                        : 'font-semibold text-text-secondary')
                    }
                  >
                    <FontAwesomeIcon
                      icon={r.done ? faCircleCheck : faCircle}
                      className={r.done ? 'h-3 w-3' : 'h-2 w-2'}
                      aria-hidden
                    />
                    {r.label}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {draftRestored && (
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  disabled={submitting}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-border-default bg-surface-card px-3 font-sans text-xs font-semibold text-text-secondary transition-colors hover:border-color-terracota-deep hover:text-color-terracota-deep focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3 w-3" aria-hidden />
                  {t('draftDiscard')}
                </button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={submitting}
                onClick={() => router.back()}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                disabled={!canSubmit}
                aria-label={submitting ? submitLabel : undefined}
              >
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function LoadingView() {
  return (
    <div className="cc-container flex max-w-2xl flex-col gap-4 py-6">
      <Skeleton shape="line" width="40%" height={32} />
      <Skeleton shape="line" width="80%" />
      <Skeleton shape="box" width="100%" height={360} />
    </div>
  );
}
