'use client';

import Image from 'next/image';

interface PhotoGalleryProps {
  gallery: string[];
  galleryIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenLightbox: () => void;
}

export default function PhotoGallery({
  gallery,
  galleryIdx,
  onPrev,
  onNext,
  onOpenLightbox,
}: PhotoGalleryProps) {
  if (gallery.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 w-full">
      <div className="cc-card mb-3 shadow-sm">
        <div className="cc-card-body">
          <h5 className="card-title mb-2">Galería de fotos</h5>
          <div className="flex items-center justify-center gap-3">
            <button
              className="btn btn-light btn-sm"
              type="button"
              onClick={onPrev}
              aria-label="Anterior foto"
            >
              ‹
            </button>
            <Image
              src={gallery[galleryIdx]}
              alt={`Foto ${galleryIdx + 1} de ${gallery.length}`}
              className="gallery-thumb max-h-[260px] max-w-[400px] cursor-pointer rounded object-cover shadow"
              width={400}
              height={300}
              onClick={onOpenLightbox}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onOpenLightbox();
                }
              }}
            />
            <button
              className="btn btn-light btn-sm"
              type="button"
              onClick={onNext}
              aria-label="Siguiente foto"
            >
              ›
            </button>
          </div>
          <div className="mt-2 text-center text-sm text-neutral-600">
            {galleryIdx + 1} / {gallery.length}
          </div>
        </div>
      </div>
    </div>
  );
}
