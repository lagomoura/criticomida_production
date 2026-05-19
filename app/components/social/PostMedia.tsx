import Image from 'next/image';
import { cn } from '@/app/lib/utils/cn';
import type { PostMediaImage } from '@/app/lib/types/social';

export interface PostMediaProps {
  images: PostMediaImage[];
  className?: string;
  /** Marca el hero como LCP: priority + fetchPriority="high". Usar solo en la vista de detalle. */
  priority?: boolean;
}

/**
 * Layout rules:
 * - 0 images: render nothing.
 * - 1 image: 4:3 hero.
 * - 2 images: 1:1 grid, two columns.
 * - 3+ images: first as hero, remaining as 2-col thumbs (up to 4 visible; extras hidden).
 */
export default function PostMedia({ images, className, priority = false }: PostMediaProps) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    const img = images[0];
    return (
      <figure className={cn('overflow-hidden rounded-lg bg-surface-subtle', className)}>
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={img.url}
            alt={img.alt ?? ''}
            fill
            sizes="(min-width: 640px) 860px, 100vw"
            quality={82}
            className="object-cover"
            priority={priority}
            fetchPriority={priority ? 'high' : undefined}
          />
        </div>
      </figure>
    );
  }

  if (images.length === 2) {
    return (
      <div className={cn('grid grid-cols-2 gap-1', className)}>
        {images.map((img, i) => (
          <figure key={i} className="relative aspect-square overflow-hidden rounded-lg bg-surface-subtle">
            <Image
              src={img.url}
              alt={img.alt ?? ''}
              fill
              sizes="(min-width: 640px) 440px, 50vw"
              quality={82}
              className="object-cover"
              priority={priority && i === 0}
              fetchPriority={priority && i === 0 ? 'high' : undefined}
            />
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
        <Image
          src={hero.url}
          alt={hero.alt ?? ''}
          fill
          sizes="(min-width: 640px) 440px, 50vw"
          quality={82}
          className="object-cover"
          priority={priority}
          fetchPriority={priority ? 'high' : undefined}
        />
      </figure>
      {visible.map((img, i) => (
        <figure key={i} className="relative aspect-square overflow-hidden rounded-lg bg-surface-subtle">
          <Image src={img.url} alt={img.alt ?? ''} fill sizes="(min-width: 640px) 440px, 50vw" quality={82} className="object-cover" />
          {i === visible.length - 1 && extra > 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-espresso)]/55 font-sans text-lg font-medium text-text-inverse">
              +{extra}
            </span>
          )}
        </figure>
      ))}
    </div>
  );
}
