'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import Select from '@/app/components/ui/Select';
import Skeleton from '@/app/components/ui/Skeleton';
import Chip from '@/app/components/ui/Chip';
import RestaurantAutocomplete, {
  type SelectedPlace,
} from '@/app/components/social/RestaurantAutocomplete';
import DishAutocomplete, {
  type SelectedDish,
} from '@/app/components/social/DishAutocomplete';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { createPost, type ComposeRestaurant } from '@/app/lib/api/compose';
import { getDishDetail } from '@/app/lib/api/dishes-social';
import { uploadReviewPhoto } from '@/app/lib/api/reviews';
import { ApiError } from '@/app/lib/api/client';
import { useToast } from '@/app/components/ui/Toast';
import { cn } from '@/app/lib/utils/cn';
import type { PortionSize, PriceTier, ReviewExtras } from '@/app/lib/types/social';
import TechnicalPillars, {
  type TechnicalPillarsValue,
} from '@/app/[locale]/restaurants/[id]/components/TechnicalPillars';

const CATEGORY_KEYS = [
  'argentina',
  'italian',
  'japanese',
  'mexican',
  'pizza',
  'sweets',
  'healthy',
  'coffee',
  'other',
] as const;

const MIN_TEXT = 20;
const MAX_TEXT = 1200;

export default function ComposeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuthContext();
  const toast = useToast();
  const t = useTranslations('compose');
  const tCat = useTranslations('compose.categoryOptions');

  const prefillDishId = searchParams?.get('dish') ?? null;

  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [dish, setDish] = useState<SelectedDish | null>(null);
  const [category, setCategory] = useState<string>('');
  const [scoreStr, setScoreStr] = useState('4.0');
  const [text, setText] = useState('');

  const [extrasOpen, setExtrasOpen] = useState(false);
  const [portionSize, setPortionSize] = useState<PortionSize | ''>('');
  const [wouldOrderAgain, setWouldOrderAgain] = useState<'' | 'yes' | 'no'>('');
  const [priceTier, setPriceTier] = useState<PriceTier | ''>('');
  const [dateTasted, setDateTasted] = useState('');
  const [visitedWith, setVisitedWith] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [photos, setPhotos] = useState<{ id: number; file: File; preview: string }[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const photoIdRef = useRef(0);

  const [pillars, setPillars] = useState<TechnicalPillarsValue>({
    presentation: null,
    value_prop: null,
    execution: null,
  });

  const [prefilling, setPrefilling] = useState(Boolean(prefillDishId));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const score = useMemo(() => {
    const n = Number(scoreStr);
    if (!Number.isFinite(n)) return null;
    const snapped = Math.round(n * 2) / 2;
    return Math.max(1, Math.min(5, snapped));
  }, [scoreStr]);

  const canSubmit =
    !submitting &&
    place !== null &&
    dish !== null &&
    dish.name.trim().length > 1 &&
    score !== null &&
    text.trim().length >= MIN_TEXT;

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const entries = files.map((file) => ({
      id: ++photoIdRef.current,
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((p) => [...p, ...entries]);
    e.target.value = '';
  }

  function removePhoto(id: number) {
    setPhotos((p) => {
      const removed = p.find((x) => x.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return p.filter((x) => x.id !== id);
    });
  }

  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildExtras = useCallback((): ReviewExtras | undefined => {
    const extras: ReviewExtras = {};
    if (portionSize) extras.portionSize = portionSize;
    if (wouldOrderAgain) extras.wouldOrderAgain = wouldOrderAgain === 'yes';
    if (priceTier) extras.priceTier = priceTier;
    if (dateTasted) extras.dateTasted = dateTasted;
    if (visitedWith.trim()) extras.visitedWith = visitedWith.trim();
    if (isAnonymous) extras.isAnonymous = true;
    if (pros.length) extras.pros = pros;
    if (cons.length) extras.cons = cons;
    if (tags.length) extras.tags = tags;
    if (pillars.presentation) extras.presentation = pillars.presentation;
    if (pillars.value_prop) extras.valueProp = pillars.value_prop;
    if (pillars.execution) extras.execution = pillars.execution;
    return Object.keys(extras).length > 0 ? extras : undefined;
  }, [portionSize, wouldOrderAgain, priceTier, dateTasted, visitedWith, isAnonymous, pros, cons, tags, pillars]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!canSubmit || !user || score === null || !place || !dish) return;
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
        let imageUrls: string[] = [];
        if (photos.length > 0) {
          imageUrls = await Promise.all(
            photos.map((p, i) => uploadReviewPhoto(user.id, p.file, i)),
          );
        }

        const baseExtras = buildExtras();
        const extrasWithImages: ReviewExtras | undefined =
          imageUrls.length > 0
            ? {
                ...(baseExtras ?? {}),
                images: imageUrls.map((url, i) => ({
                  url,
                  altText:
                    imageUrls.length > 1
                      ? t('photoAltIndexed', { i: i + 1, dish: dish.name.trim() })
                      : t('photoAltSingle', { dish: dish.name.trim() }),
                  displayOrder: i,
                })),
              }
            : baseExtras;

        const post = await createPost({
          dishName: dish.name.trim(),
          dishId: dish.id,
          restaurant,
          category: category.trim() || null,
          score,
          text: text.trim(),
          extras: extrasWithImages,
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
    [canSubmit, user, score, place, dish, category, text, buildExtras, photos, router, toast, t],
  );

  const handleAddChip = (value: string, list: string[], setList: (v: string[]) => void, clear: () => void) => {
    const v = value.trim();
    if (!v || list.includes(v)) return;
    setList([...list, v]);
    clear();
  };

  const handleRemoveChip = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((item) => item !== value));
  };

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
    <div className="cc-container flex max-w-2xl flex-col gap-6 py-6">
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <RestaurantAutocomplete
            value={place}
            onChange={setPlace}
            disabled={submitting}
            placeholder={t('restaurantPlaceholder')}
          />

          <DishAutocomplete
            restaurantPlaceId={place?.place_id ?? null}
            value={dish}
            onChange={setDish}
            disabled={submitting}
          />

          <Select
            label={t('categoryLabel')}
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
          >
            <option value="">{t('categoryNone')}</option>
            {CATEGORY_KEYS.map((c) => (
              <option key={c} value={tCat(c)}>
                {tCat(c)}
              </option>
            ))}
          </Select>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="score-input" className="font-sans text-sm font-medium text-text-secondary">
              {t('scoreLabel')}
              <span aria-hidden className="ml-0.5 text-action-danger">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                id="score-input"
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
                {score !== null ? score.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          <TechnicalPillars
            value={pillars}
            onChange={setPillars}
            disabled={submitting}
          />


          <Textarea
            label={t('reviewLabel')}
            name="text"
            placeholder={t('reviewPlaceholder')}
            required
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_TEXT}
            valueLength={text.length}
            helpText={text.trim().length < MIN_TEXT ? t('minCharsHint', { n: MIN_TEXT }) : undefined}
            disabled={submitting}
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium text-text-secondary">
              {t('photosLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative h-20 w-20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt=""
                    className="h-full w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    disabled={submitting}
                    aria-label={t('removePhoto')}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-action-danger text-xs text-text-inverse shadow-[var(--shadow-base)] hover:opacity-90 disabled:opacity-40"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={submitting}
                className="group flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-default bg-surface-card text-text-muted transition-all hover:border-action-primary hover:text-action-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-xl leading-none">+</span>
                <span className="text-[10px] font-medium">{t('photoButton')}</span>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handlePhotoAdd}
              />
            </div>
            <p className="font-sans text-xs text-text-muted">
              {t('photosHint')}
            </p>
          </div>

          <section className="rounded-2xl border border-border-default bg-surface-card">
            <button
              type="button"
              onClick={() => setExtrasOpen((o) => !o)}
              aria-expanded={extrasOpen}
              aria-controls="extras-panel"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-sans text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <span>{t('moreDetails')}</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                aria-hidden
                className={cn(
                  'h-3.5 w-3.5 text-text-muted transition-transform',
                  extrasOpen && 'rotate-180',
                )}
              />
            </button>

            {extrasOpen && (
              <div id="extras-panel" className="flex flex-col gap-4 border-t border-border-default p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label={t('portionLabel')}
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value as PortionSize | '')}
                    disabled={submitting}
                  >
                    <option value="">{t('portionUnspecified')}</option>
                    <option value="small">{t('portionSmall')}</option>
                    <option value="medium">{t('portionMedium')}</option>
                    <option value="large">{t('portionLarge')}</option>
                  </Select>
                  <Select
                    label={t('wouldOrderAgainLabel')}
                    value={wouldOrderAgain}
                    onChange={(e) => setWouldOrderAgain(e.target.value as '' | 'yes' | 'no')}
                    disabled={submitting}
                  >
                    <option value="">{t('portionUnspecified')}</option>
                    <option value="yes">{t('yes')}</option>
                    <option value="no">{t('no')}</option>
                  </Select>
                  <Select
                    label={t('priceLabel')}
                    value={priceTier}
                    onChange={(e) => setPriceTier(e.target.value as PriceTier | '')}
                    disabled={submitting}
                  >
                    <option value="">{t('portionUnspecified')}</option>
                    <option value="$">{t('priceCheap')}</option>
                    <option value="$$">{t('priceMid')}</option>
                    <option value="$$$">{t('priceHigh')}</option>
                  </Select>
                  <Input
                    label={t('dateTastedLabel')}
                    type="date"
                    value={dateTasted}
                    onChange={(e) => setDateTasted(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <Input
                  label={t('visitedWithLabel')}
                  placeholder={t('visitedWithPlaceholder')}
                  value={visitedWith}
                  onChange={(e) => setVisitedWith(e.target.value)}
                  disabled={submitting}
                  maxLength={200}
                />

                <ChipInput
                  label={t('prosLabel')}
                  placeholder={t('prosPlaceholder')}
                  addLabel={t('addChip')}
                  removeLabelTemplate={(item) => t('removeChip', { item })}
                  value={prosInput}
                  onChange={setProsInput}
                  onAdd={() =>
                    handleAddChip(prosInput, pros, setPros, () => setProsInput(''))
                  }
                  onRemove={(v) => handleRemoveChip(v, pros, setPros)}
                  items={pros}
                  tone="positive"
                  disabled={submitting}
                />

                <ChipInput
                  label={t('consLabel')}
                  placeholder={t('consPlaceholder')}
                  addLabel={t('addChip')}
                  removeLabelTemplate={(item) => t('removeChip', { item })}
                  value={consInput}
                  onChange={setConsInput}
                  onAdd={() =>
                    handleAddChip(consInput, cons, setCons, () => setConsInput(''))
                  }
                  onRemove={(v) => handleRemoveChip(v, cons, setCons)}
                  items={cons}
                  tone="negative"
                  disabled={submitting}
                />

                <ChipInput
                  label={t('tagsLabel')}
                  placeholder={t('tagsPlaceholder')}
                  addLabel={t('addChip')}
                  removeLabelTemplate={(item) => t('removeChip', { item })}
                  value={tagsInput}
                  onChange={setTagsInput}
                  onAdd={() =>
                    handleAddChip(tagsInput, tags, setTags, () => setTagsInput(''))
                  }
                  onRemove={(v) => handleRemoveChip(v, tags, setTags)}
                  items={tags}
                  disabled={submitting}
                />

                <label className="flex cursor-pointer items-center gap-2 font-sans text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 accent-action-primary"
                  />
                  {t('anonymousLabel')}
                </label>
              </div>
            )}
          </section>

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

function ChipInput({
  label,
  placeholder,
  addLabel,
  removeLabelTemplate,
  value,
  onChange,
  onAdd,
  onRemove,
  items,
  tone,
  disabled,
}: {
  label: string;
  placeholder: string;
  addLabel: string;
  removeLabelTemplate: (item: string) => string;
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (v: string) => void;
  items: string[];
  tone?: 'positive' | 'negative';
  disabled?: boolean;
}) {
  const border = tone === 'positive' ? 'border-action-secondary/40' : tone === 'negative' ? 'border-action-danger/40' : 'border-border-default';
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans text-sm font-medium text-text-secondary">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-10 flex-1 rounded-md border bg-surface-card px-3 font-sans text-sm text-text-primary',
            'placeholder:text-text-muted',
            'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-60',
            border,
          )}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled || !value.trim()}
          className="h-10 rounded-md border border-border-default bg-surface-card px-3 font-sans text-sm text-text-secondary transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addLabel}
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip key={item} onRemove={() => onRemove(item)} removeLabel={removeLabelTemplate(item)}>
              {item}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
