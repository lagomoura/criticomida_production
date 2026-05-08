'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Select from '@/app/components/ui/Select';
import Skeleton from '@/app/components/ui/Skeleton';
import RestaurantAutocomplete, {
  type SelectedPlace,
} from '@/app/components/social/RestaurantAutocomplete';
import DishAutocomplete, {
  type SelectedDish,
} from '@/app/components/social/DishAutocomplete';
import ReviewFormBody, {
  companyToVisitedWith,
  type ReviewFormBodyValue,
} from '@/app/components/social/ReviewFormBody';
import {
  REVIEW_CATEGORY_GROUPS,
  categorySlugToI18nKey,
} from '@/app/data/review-categories';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { createPost, type ComposeRestaurant } from '@/app/lib/api/compose';
import { getDishDetail } from '@/app/lib/api/dishes-social';
import { uploadReviewPhoto } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { useToast } from '@/app/components/ui/Toast';
import type { PriceTier, ReviewExtras } from '@/app/lib/types/social';

const MIN_TEXT = 20;
const MAX_TEXT = 1200;

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
  const tCat = useTranslations('categories');
  const tSec = useTranslations('categoriesIndex');

  const prefillDishId = searchParams?.get('dish') ?? null;

  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [dish, setDish] = useState<SelectedDish | null>(null);
  const [category, setCategory] = useState<string>('');
  const [priceTier, setPriceTier] = useState<PriceTier | null>(null);
  const [body, setBody] = useState<ReviewFormBodyValue>(makeBodyInitial);

  const [prefilling, setPrefilling] = useState(Boolean(prefillDishId));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Cleanup blob previews on unmount.
  useEffect(() => {
    return () => {
      body.photos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (detail.category) setCategory(detail.category);
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

      try {
        const imageUrls = body.photos.length > 0
          ? await Promise.all(
              body.photos.map((p, i) => uploadReviewPhoto(user.id, p.file, i)),
            )
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
          category: category.trim() || null,
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
        toast.success(
          t('successTitle'),
          t('successDescription', { dish: dish.name, restaurant: place.name }),
        );
        router.push(`/reviews/${post.id}`);
      } catch (err) {
        const message =
          err instanceof ApiError && typeof err.detail === 'string'
            ? err.detail
            : t('errorMessage');
        setFormError(message);
        toast.error(t('errorTitle'), message);
        setSubmitting(false);
      }
    },
    [canSubmit, user, place, dish, body, priceTier, isNewDish, category, router, toast, t, tForm],
  );

  const minCharsHint = useMemo(() => {
    if (noteLength === 0) return null;
    if (noteLength >= MIN_TEXT) return null;
    return t('minCharsHint', { n: MIN_TEXT });
  }, [noteLength, t]);

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
    <div className="cc-container flex max-w-3xl flex-col gap-4 py-5">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
          {t('title')}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {t('subtitle')}
        </p>
      </header>

      {prefilling ? (
        <Skeleton shape="box" width="100%" height={320} />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
          noValidate
        >
          {/* 1. Restaurant picker (Google Places) */}
          <RestaurantAutocomplete
            value={place}
            onChange={setPlace}
            disabled={submitting}
            placeholder={t('restaurantPlaceholder')}
          />

          {/* 2. Dish picker */}
          <DishAutocomplete
            restaurantPlaceId={place?.place_id ?? null}
            value={dish}
            onChange={setDish}
            disabled={submitting}
          />

          {/* 3. Category — keeps current behavior: tags the restaurant when
              new. Always shown; the user can pre-set it for new restaurants. */}
          <Select
            label={t('categoryLabel')}
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
          >
            <option value="">{t('categoryNone')}</option>
            {REVIEW_CATEGORY_GROUPS.map((group) => (
              <optgroup key={group.titleKey} label={tSec(group.titleKey)}>
                {group.slugs.map((slug) => (
                  <option key={slug} value={slug}>
                    {tCat(categorySlugToI18nKey(slug))}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>

          {/* 4. Price tier — only shown when the dish is being created from
              scratch. Tier is a property of the Dish, not the Review, so for
              existing dishes it's already set in the catalog. */}
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
                          ? 'border-color-azafran bg-color-azafran-pale text-color-canela shadow-[var(--shadow-micro)]'
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

          {/* 5. The full review body — same component used by the restaurant modal */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-border-subtle bg-surface-page p-3 text-text-primary sm:gap-3 sm:p-4">
            <ReviewFormBody
              value={body}
              onChange={setBody}
              dishId={dish?.id ?? undefined}
              dishName={dish?.name ?? ''}
              currencyCode={null}
              submitting={submitting}
            />
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

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={submitting}
              onClick={() => router.back()}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting} disabled={!canSubmit}>
              {t('submit')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function LoadingView() {
  return (
    <div className="cc-container flex max-w-2xl flex-col gap-4 py-6">
      <Skeleton shape="line" width="40%" height={32} />
      <Skeleton shape="line" width="80%" />
      <Skeleton shape="box" width="100%" height={360} />
    </div>
  );
}
