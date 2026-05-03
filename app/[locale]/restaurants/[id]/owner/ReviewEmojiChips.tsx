'use client';

import { useTranslations } from 'next-intl';
import type { OwnerReviewItem } from '@/app/lib/api/owner-content';

type Tone = 'neutral' | 'positive' | 'negative' | 'warning';

interface Chip {
  key: string;
  emoji: string;
  /** Texto i18n descriptivo para tooltip + aria-label (más largo). */
  label: string;
  /** Texto corto que se renderiza visiblemente debajo del emoji. */
  shortLabel: string;
  /** Tono del fondo. ``positive`` = destaque, ``negative`` = problema. */
  tone?: Tone;
}

interface Props {
  review: OwnerReviewItem;
}

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-surface-subtle text-text-secondary',
  positive: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  negative: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
};

/**
 * Fila de chips emoji + label que comunican señales del review de un vistazo.
 *
 * Cada chip muestra siempre el label visible debajo del emoji (no solo
 * tooltip) para que el dueño no tenga que adivinar el significado.
 *
 * Pilares técnicos solo destacan extremos (1 = problema, 3 = destaque).
 * El destaque se comunica con el color del chip (emerald=positive,
 * rose=negative), no con un ⭐ compuesto que choca con el chip de
 * crítico verificado.
 */
export default function ReviewEmojiChips({ review }: Props) {
  const t = useTranslations('ownerDashboard.chips');
  const chips: Chip[] = [];

  // --- Sentimiento ---
  if (review.sentiment_label === 'positive') {
    chips.push({
      key: 'sent-pos',
      emoji: '😊',
      label: t('sentimentPositive'),
      shortLabel: t('sentimentPositiveShort'),
    });
  } else if (review.sentiment_label === 'neutral') {
    chips.push({
      key: 'sent-neu',
      emoji: '😐',
      label: t('sentimentNeutral'),
      shortLabel: t('sentimentNeutralShort'),
    });
  } else if (review.sentiment_label === 'negative') {
    chips.push({
      key: 'sent-neg',
      emoji: '😟',
      label: t('sentimentNegative'),
      shortLabel: t('sentimentNegativeShort'),
    });
  }

  if (review.sentiment_score !== null) {
    if (review.sentiment_score > 0.8) {
      chips.push({
        key: 'sent-fire',
        emoji: '🔥',
        label: t('sentimentExtremePositive'),
        shortLabel: t('sentimentExtremePositiveShort'),
        tone: 'positive',
      });
    } else if (review.sentiment_score < -0.8) {
      chips.push({
        key: 'sent-alarm',
        emoji: '🚨',
        label: t('sentimentExtremeNegative'),
        shortLabel: t('sentimentExtremeNegativeShort'),
        tone: 'negative',
      });
    }
  }

  // --- Pilares técnicos: solo extremos ---
  if (review.presentation === 3 || review.presentation === 1) {
    const tone: Tone = review.presentation === 3 ? 'positive' : 'negative';
    chips.push({
      key: 'pres',
      emoji: '🎨',
      label: t(tone === 'positive' ? 'pillarPresentationStrong' : 'pillarPresentationWeak'),
      shortLabel: t('pillarPresentationShort'),
      tone,
    });
  }
  if (review.execution === 3 || review.execution === 1) {
    const tone: Tone = review.execution === 3 ? 'positive' : 'negative';
    chips.push({
      key: 'exec',
      emoji: '👨‍🍳',
      label: t(tone === 'positive' ? 'pillarExecutionStrong' : 'pillarExecutionWeak'),
      shortLabel: t('pillarExecutionShort'),
      tone,
    });
  }
  if (review.value_prop === 3 || review.value_prop === 1) {
    const tone: Tone = review.value_prop === 3 ? 'positive' : 'negative';
    chips.push({
      key: 'val',
      emoji: '💰',
      label: t(tone === 'positive' ? 'pillarValueStrong' : 'pillarValueWeak'),
      shortLabel: t('pillarValueShort'),
      tone,
    });
  }

  // --- Volvería a pedir ---
  if (review.would_order_again === true) {
    chips.push({
      key: 'reorder',
      emoji: '🔁',
      label: t('wouldOrderAgain'),
      shortLabel: t('wouldOrderAgainShort'),
      tone: 'positive',
    });
  }

  // --- Tamaño de porción ---
  if (review.portion_size === 'small') {
    chips.push({
      key: 'portion-s',
      emoji: '🥄',
      label: t('portionSmall'),
      shortLabel: t('portionSmallShort'),
    });
  } else if (review.portion_size === 'medium') {
    chips.push({
      key: 'portion-m',
      emoji: '🍽️',
      label: t('portionMedium'),
      shortLabel: t('portionMediumShort'),
    });
  } else if (review.portion_size === 'large') {
    chips.push({
      key: 'portion-l',
      emoji: '🍱',
      label: t('portionLarge'),
      shortLabel: t('portionLargeShort'),
    });
  }

  // --- Tipo de autor ---
  if (review.is_anonymous) {
    chips.push({
      key: 'author-anon',
      emoji: '🥷',
      label: t('authorAnonymous'),
      shortLabel: t('authorAnonymousShort'),
    });
  } else if (review.author_role === 'critic') {
    chips.push({
      key: 'author-critic',
      emoji: '🏆',
      label: t('authorCritic'),
      shortLabel: t('authorCriticShort'),
    });
  } else if (review.author_role === 'admin') {
    chips.push({
      key: 'author-admin',
      emoji: '🛡️',
      label: t('authorAdmin'),
      shortLabel: t('authorAdminShort'),
    });
  }

  // --- Demografía del autor ---
  if (!review.is_anonymous) {
    if (review.author_gender === 'female') {
      chips.push({
        key: 'gender-f',
        emoji: '👩',
        label: t('genderFemale'),
        shortLabel: t('genderFemaleShort'),
      });
    } else if (review.author_gender === 'male') {
      chips.push({
        key: 'gender-m',
        emoji: '👨',
        label: t('genderMale'),
        shortLabel: t('genderMaleShort'),
      });
    } else if (review.author_gender === 'non_binary') {
      chips.push({
        key: 'gender-nb',
        emoji: '🧑',
        label: t('genderNonBinary'),
        shortLabel: t('genderNonBinaryShort'),
      });
    }

    if (review.author_age_range) {
      chips.push({
        key: 'age',
        emoji: '🎂',
        label: t('ageRange', { range: review.author_age_range }),
        shortLabel: review.author_age_range,
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-stretch gap-1" aria-label={t('rowAriaLabel')}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          title={chip.label}
          aria-label={chip.label}
          className={`inline-flex flex-col items-center gap-0 rounded-md px-1.5 py-0.5 ${
            TONE_CLASSES[chip.tone ?? 'neutral']
          }`}
        >
          <span aria-hidden className="text-base leading-none">
            {chip.emoji}
          </span>
          <span className="font-sans text-[9px] font-medium uppercase tracking-wide leading-tight">
            {chip.shortLabel}
          </span>
        </span>
      ))}
    </div>
  );
}
