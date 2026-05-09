import Skeleton from './Skeleton';
import { cn } from '@/app/lib/utils/cn';

/** Skeleton for a feed/post card. Matches PostCard layout shape. */
export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-border-default bg-surface-card p-4 sm:p-5',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" width={32} height={32} />
        <div className="flex flex-col gap-1.5">
          <Skeleton shape="line" width={120} />
          <Skeleton shape="line" width={80} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton shape="line" width="60%" height={24} />
          <Skeleton shape="line" width="40%" />
        </div>
        <Skeleton shape="box" width={56} height={32} className="rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton shape="line" />
        <Skeleton shape="line" />
        <Skeleton shape="line" width="70%" />
      </div>
      <Skeleton shape="box" width="100%" height={220} />
      <div className="flex gap-6">
        <Skeleton shape="line" width={50} />
        <Skeleton shape="line" width={50} />
        <Skeleton shape="line" width={50} />
      </div>
    </div>
  );
}

/** Skeleton matching RestaurantCard (4:3 image, optional info row). */
export function RestaurantCardSkeleton({
  showInfo = true,
  className,
}: {
  showInfo?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn('overflow-hidden rounded-2xl bg-surface-card', className)}>
      <Skeleton shape="box" className="aspect-[4/3] w-full rounded-none" />
      {showInfo && (
        <div className="flex flex-col gap-2 p-4">
          <Skeleton shape="line" width="70%" height={20} />
          <div className="flex items-center justify-between">
            <Skeleton shape="line" width="40%" />
            <Skeleton shape="line" width={50} />
          </div>
          <Skeleton shape="line" width="90%" />
        </div>
      )}
    </div>
  );
}

/** Compact skeleton for a dish list item: square thumb + 2 lines + rating pill. */
export function DishCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card p-3',
        className,
      )}
    >
      <Skeleton shape="box" width={64} height={64} className="shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton shape="line" width="60%" height={18} />
        <Skeleton shape="line" width="40%" />
      </div>
      <Skeleton shape="box" width={48} height={28} className="rounded-full" />
    </div>
  );
}

/** Compact line entry skeleton for notifications/comments. */
export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('flex items-start gap-3 py-3', className)}>
      <Skeleton shape="circle" width={36} height={36} className="shrink-0" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton shape="line" width="80%" />
        <Skeleton shape="line" width="50%" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the owner/settings (IA preferences) loading state.
 * Mirrors the page shape: back nav + header + 1 big card (tone + language + kpis) + footer link.
 */
export function OwnerSettingsSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('cc-container py-8', className)}>
      {/* Back nav */}
      <div className="mb-8">
        <Skeleton shape="line" width={120} height={14} />
      </div>
      {/* Header: kicker + h1 + subtitle */}
      <div className="mb-8 flex flex-col gap-2">
        <Skeleton shape="line" width={80} height={10} />
        <Skeleton shape="line" width={240} height={32} />
        <Skeleton shape="line" width={200} height={14} />
      </div>
      {/* Big settings card */}
      <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-border-default bg-surface-card p-6">
        {/* Tone select */}
        <div className="flex flex-col gap-2">
          <Skeleton shape="line" width={100} height={14} />
          <Skeleton shape="line" width={220} height={12} />
          <Skeleton shape="box" width="100%" height={40} className="rounded-lg" />
        </div>
        {/* Language select */}
        <div className="flex flex-col gap-2">
          <Skeleton shape="line" width={80} height={14} />
          <Skeleton shape="line" width={200} height={12} />
          <Skeleton shape="box" width="100%" height={40} className="rounded-lg" />
        </div>
        {/* KPI checkboxes */}
        <div className="flex flex-col gap-2">
          <Skeleton shape="line" width={140} height={14} />
          <Skeleton shape="line" width={260} height={12} />
          <div className="flex flex-col gap-3 pt-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton shape="box" width={16} height={16} className="rounded" />
                <Skeleton shape="line" width={180} height={14} />
              </div>
            ))}
          </div>
        </div>
        {/* Save button */}
        <div>
          <Skeleton shape="box" width={120} height={40} className="rounded-lg" />
        </div>
      </div>
      {/* Footer link */}
      <Skeleton shape="line" width={140} height={14} />
    </div>
  );
}

/**
 * Skeleton for the /settings page loading state.
 * Mirrors the page shape: user header + edit-profile card + 4 option rows.
 */
export function SettingsSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('cc-container py-10 md:py-14', className)}>
      {/* User header */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Skeleton shape="circle" width={56} height={56} />
        <div className="flex flex-col gap-2">
          <Skeleton shape="line" width={160} height={20} />
          <Skeleton shape="line" width={100} height={14} />
        </div>
      </div>
      {/* Edit profile card */}
      <div className="mb-8 rounded-2xl border border-border-default bg-surface-card px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton shape="line" width="50%" height={16} />
            <Skeleton shape="line" width="70%" />
          </div>
          <Skeleton shape="box" width={80} height={32} className="rounded-lg" />
        </div>
      </div>
      {/* Option rows */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="mb-6 flex items-center justify-between rounded-2xl border border-border-default bg-surface-card px-4 py-3"
        >
          <div className="flex flex-col gap-1.5">
            <Skeleton shape="line" width={120} height={16} />
            <Skeleton shape="line" width={180} />
          </div>
          <Skeleton shape="box" width={64} height={32} className="rounded-full" />
        </div>
      ))}
    </div>
  );
}
