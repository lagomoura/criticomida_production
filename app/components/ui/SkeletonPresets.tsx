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
