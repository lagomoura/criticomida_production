import Image from 'next/image';
import { cn } from '@/app/lib/utils/cn';
import type { PostMediaImage } from '@/app/lib/types/social';

export interface PostMediaProps {
  images: PostMediaImage[];
  className?: string;
}

/**
 * Layout rules:
 * - 0 images: render nothing.
 * - 1 image: 4:3 hero.
 * - 2 images: 1:1 grid, two columns.
 * - 3+ images: first as hero, remaining as 2-col thumbs (up to 4 visible; extras hidden).
 */
export default function PostMedia({ images, className }: PostMediaProps) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    const img = images[0];
    return (
      <figure className={cn('overflow-hidden rounded-lg bg-surface-subtle', className)}>
        <div className="relative aspect-[4/3] w-full">
          <Image src={img.url} alt={img.alt ?? ''} fill sizes="(min-width: 640px) 640px, 100vw" className="object-cover" unoptimized />
        </div>
      </figure>
    );
  }

  if (images.length === 2) {
    return (
      <div className={cn('grid grid-cols-2 gap-1', className)}>
        {images.map((img, i) => (
          <figure key={i} className="relative aspect-square overflow-hidden rounded-lg bg-surface-subtle">
            <Image src={img.url} alt={img.alt ?? ''} fill sizes="(min-width: 640px) 320px, 50vw" className="object-cover" unoptimized />
          </figure>
        ))}
      </div>
    );
  }

  const [hero, ...rest] = images;
  const visible = rest.slice(0, 3);
  const extra = rest.length - visible.length;

  return (
    <div className={cn('grid grid-cols-2 gap-1', className)}>
      <figure className="relative col-span-1 row-span-2 aspect-[3/4] overflow-hidden rounded-lg bg-surface-subtle">
        <Image src={hero.url} alt={hero.alt ?? ''} fill sizes="(min-width: 640px) 320px, 50vw" className="object-cover" unoptimized />
      </figure>
      {visible.map((img, i) => (
        <figure key={i} className="relative aspect-square overflow-hidden rounded-lg bg-surface-subtle">
          <Image src={img.url} alt={img.alt ?? ''} fill sizes="(min-width: 640px) 160px, 50vw" className="object-cover" unoptimized />
          {i === visible.length - 1 && extra > 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 font-sans text-lg font-medium text-white">
              +{extra}
            </span>
          )}
        </figure>
      ))}
    </div>
  );
}
