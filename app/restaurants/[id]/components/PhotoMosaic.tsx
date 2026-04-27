'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { RestaurantPhoto, GooglePhoto } from '@/app/lib/types/restaurant';
import Lightbox from './Lightbox';

interface PhotoMosaicProps {
  photos: RestaurantPhoto[];
  totalCount: number;
  googlePhotos?: GooglePhoto[] | null;
}

export default function PhotoMosaic({ photos, totalCount, googlePhotos }: PhotoMosaicProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const validGooglePhotos = (googlePhotos ?? []).filter((g): g is GooglePhoto & { url: string } => Boolean(g.url));

  if (photos.length === 0 && validGooglePhotos.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-[var(--color-crema-darker)] bg-[var(--color-white)] p-10 text-center">
        <p className="text-4xl" aria-hidden>📷</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)]">
          Aún no hay fotos
        </h2>
        <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
          Las fotos que los visitantes suban en sus reseñas aparecerán aquí.
        </p>
      </section>
    );
  }

  const ugcGallery = photos.map((p) => p.url);
  const googleGallery = validGooglePhotos.map((g) => g.url);
  const galleryUrls = [...ugcGallery, ...googleGallery];
  const open = lightboxIdx !== null;

  return (
    <section id="fotos">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)] sm:text-3xl">
            Galería
          </h2>
          <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
            {totalCount > 0 && `${totalCount} ${totalCount === 1 ? 'foto' : 'fotos'} de la comunidad`}
            {totalCount > 0 && validGooglePhotos.length > 0 && ' · '}
            {validGooglePhotos.length > 0 && `${validGooglePhotos.length} de Google`}
          </p>
        </div>
      </header>

      <ul className="columns-2 gap-3 [column-fill:_balance] sm:columns-3 lg:columns-4 [&>li]:mb-3 [&>li]:break-inside-avoid">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setLightboxIdx(i)}
              className="group block w-full overflow-hidden rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] focus:outline-none focus:ring-2 focus:ring-[var(--color-azafran)]"
              aria-label={`Ver foto de ${p.dish_name}`}
            >
              <Image
                src={p.url}
                alt={p.alt_text ?? `${p.dish_name} en ${p.user_display_name}`}
                width={600}
                height={800}
                className="h-auto w-full object-cover transition group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </button>
            <p className="mt-1 px-1 text-xs text-[var(--color-carbon-soft)]">
              {p.review_id ? (
                <Link
                  href={`/reviews/${p.review_id}`}
                  className="font-semibold text-[var(--color-carbon-mid)] no-underline hover:underline"
                >
                  {p.dish_name}
                </Link>
              ) : (
                <span className="font-semibold text-[var(--color-carbon-mid)]">{p.dish_name}</span>
              )}
              {' · '}
              {p.user_handle ? (
                <Link
                  href={`/u/${p.user_id}`}
                  className="no-underline hover:underline"
                >
                  @{p.user_handle}
                </Link>
              ) : (
                <span>{p.user_display_name}</span>
              )}
            </p>
          </li>
        ))}
        {validGooglePhotos.map((g, i) => (
          <li key={`g-${g.photo_reference ?? i}`}>
            <button
              type="button"
              onClick={() => setLightboxIdx(ugcGallery.length + i)}
              className="group block w-full overflow-hidden rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] focus:outline-none focus:ring-2 focus:ring-[var(--color-azafran)]"
              aria-label="Ver foto de Google"
            >
              {/* Google photoreference URLs are external (maps.googleapis.com)
                  and follow a 302 redirect — using next/image would require
                  whitelisting the host. Plain img is the correct choice here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.url}
                alt="Foto de Google Maps"
                loading="lazy"
                className="h-auto w-full object-cover transition group-hover:scale-105"
              />
            </button>
            <p
              className="mt-1 flex items-center gap-1 px-1 text-[10px] uppercase tracking-wide text-[var(--color-carbon-soft)]"
              title={g.attribution_html ?? undefined}
            >
              <span aria-hidden>G</span> Google
            </p>
          </li>
        ))}
      </ul>

      <Lightbox
        open={open}
        gallery={galleryUrls}
        galleryIdx={lightboxIdx ?? 0}
        onClose={() => setLightboxIdx(null)}
        onPrev={() => setLightboxIdx((i) => (i === null ? 0 : (i - 1 + galleryUrls.length) % galleryUrls.length))}
        onNext={() => setLightboxIdx((i) => (i === null ? 0 : (i + 1) % galleryUrls.length))}
      />
    </section>
  );
}
