'use client';

import { Link } from '@/app/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/lib/utils/cn';
import type { ReviewPost } from '@/app/lib/types/social';
import PostHeader from './PostHeader';
import DishDecisionBlock from './DishDecisionBlock';
import PostBody from './PostBody';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import PostExtras from './PostExtras';
import WantToTryButton from '@/app/components/dishes/WantToTryButton';

export interface PostCardProps {
  post: ReviewPost;
  /** When true (review detail), skip text clamp and the overlay link. */
  expanded?: boolean;
  onOpenPost?: (postId: string) => void;
  onOpenDish?: (dishId: string) => void;
  onOpenAuthor?: (userId: string) => void;
  onOpenRestaurant?: (restaurantId: string) => void;
  onToggleLike?: (postId: string, next: boolean) => void;
  onToggleSave?: (postId: string, next: boolean) => void;
  onToggleWantToTry?: (dishId: string, next: boolean) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onOpenMenu?: (postId: string) => void;
  onReport?: (postId: string) => void;
  className?: string;
}

export default function PostCard({
  post,
  expanded = false,
  onOpenPost,
  onOpenDish,
  onOpenAuthor,
  onOpenRestaurant,
  onToggleLike,
  onToggleSave,
  onToggleWantToTry,
  onComment,
  onShare,
  onOpenMenu,
  onReport,
  className,
}: PostCardProps) {
  const t = useTranslations('social.post');
  if (post.status === 'removed') {
    return (
      <article
        className={cn(
          'rounded-2xl border border-border-default bg-surface-card p-5 text-center font-sans text-sm text-text-muted',
          className,
        )}
      >
        {t('removed')}
      </article>
    );
  }

  const overlayEnabled = !expanded && Boolean(onOpenPost);
  const verified = post.verifiedByExpert === true;

  return (
    <article
      className={cn(
        'relative isolate flex flex-col gap-4 rounded-2xl border bg-surface-card p-4 sm:p-5',
        'shadow-[var(--shadow-base)] transition-[transform,box-shadow] duration-[var(--duration-standard)]',
        'motion-safe:[transition-timing-function:var(--ease-standard)]',
        verified
          ? 'border-[color:var(--color-terracota)]/45'
          : 'border-border-subtle',
        overlayEnabled && 'hover:-translate-y-[2px] hover:shadow-[var(--shadow-elevated)]',
        className,
      )}
    >
      {/* Overlay link: fills the whole card and sits BEHIND the content so that
          interactive children (buttons/links) intercept their clicks first. */}
      {overlayEnabled && (
        <Link
          href={`/reviews/${post.id}`}
          aria-label={t('openReview', { dishName: post.dish.name })}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          onClick={(e) => {
            // Let Link do its thing but also notify the parent for analytics / prefetch coordination.
            onOpenPost?.(post.id);
            // Do not call preventDefault — allow native link behavior (middle-click, cmd+click, etc.).
            void e;
          }}
        />
      )}

      {/* Content sits above the overlay. Non-interactive blocks use
          pointer-events-none so bare clicks pass through to the link. */}
      <div className="relative z-10">
        <PostHeader
          author={post.author}
          createdAt={post.createdAt}
          onOpenAuthor={onOpenAuthor}
          onOpenMenu={onOpenMenu ? () => onOpenMenu(post.id) : undefined}
          verified={verified}
          discoveryRank={post.discoveryRank ?? null}
        />
      </div>

      {/* Media inmediatamente después del header: la foto es el héroe del plato.
          Convención Letterboxd/Beli: media precede al texto descriptivo.
          pointer-events-none en feed para que el overlay-link reciba el tap. */}
      {post.media && post.media.length > 0 && (
        <div className={cn('relative z-10', overlayEnabled && 'pointer-events-none')}>
          <PostMedia images={post.media} />
        </div>
      )}

      <div className="relative z-10">
        <DishDecisionBlock
          dish={post.dish}
          score={post.score}
          onOpenDish={onOpenDish}
          onOpenRestaurant={onOpenRestaurant}
        />
      </div>

      {/* Body text: in feed mode, let clicks fall through to the overlay link
          (no nested Ver más to protect). In detail mode, normal interactivity. */}
      <div className={cn('relative z-10', overlayEnabled && 'pointer-events-none')}>
        <PostBody
          text={post.text}
          alwaysExpanded={expanded}
          showExpandToggle={!overlayEnabled}
        />
      </div>

      {expanded && post.extras && (
        <div className="relative z-10 border-t border-border-default pt-4">
          <PostExtras extras={post.extras} />
        </div>
      )}

      <div className="relative z-10">
        <PostActions
          postId={post.id}
          stats={post.stats}
          viewerState={post.viewerState}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          onComment={onComment}
          onShare={onShare}
          onReport={onReport}
        />
      </div>

      {onToggleWantToTry && (
        <div className="relative z-10 flex justify-end">
          <WantToTryButton
            dishId={post.dish.id}
            active={Boolean(post.viewerState.wantToTry)}
            onToggle={onToggleWantToTry}
          />
        </div>
      )}
    </article>
  );
}
