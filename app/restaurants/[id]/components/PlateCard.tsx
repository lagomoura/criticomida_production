'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Plate } from '@/app/lib/types';

interface PlateCardProps {
  plate: Plate;
  idx: number;
  isFav: boolean;
  imgIdx: number;
  onToggleFav: (idx: number) => void;
  onChangeImgIdx: (idx: number, newImgIdx: number) => void;
}

export default function PlateCard({
  plate,
  idx,
  isFav,
  imgIdx,
  onToggleFav,
  onChangeImgIdx,
}: PlateCardProps) {
  const images =
    plate.images ??
    (plate.image ? [plate.image] : ['/img/food-fallback.jpg']);
  const rawSrc = images[imgIdx];
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  useEffect(() => {
    setUseFallbackImage(false);
  }, [rawSrc]);

  const imageSrc = useFallbackImage ? '/img/food-fallback.jpg' : rawSrc;
  const dateObj = new Date(plate.date);
  const formattedDate = dateObj.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const stars =
    '★'.repeat(plate.rating ?? 5) +
    '☆'.repeat(5 - (plate.rating ?? 5));
  const priceLabel = plate.price || '$$';
  const portionLabel = plate.portion || 'Medium';
  const wouldOrderAgain = plate.wouldOrderAgain !== false;
  const tags = plate.tags && plate.tags.length > 0 ? plate.tags : [];
  const visitedWith = plate.visitedWith || '';
  const time = plate.time || '';

  function handleShare() {
    navigator.clipboard.writeText(window.location.href + `#plate-${idx}`);
    alert('¡Enlace copiado!');
  }

  return (
    <div
      className="diary-plate-animate mb-4 w-full"
      style={{ '--diary-anim-order': idx } as React.CSSProperties}
      aria-label={`Plato: ${plate.name}, comido el ${formattedDate}`}
      id={`plate-${idx}`}
    >
      <div
        className={
          'diary-plate-card wow-plate-card relative mx-auto flex h-full ' +
          'max-w-lg flex-col overflow-hidden rounded-3xl border border-white/90 ' +
          'bg-white/98 shadow-sm backdrop-blur-md transition duration-300 ' +
          'hover:-translate-y-2 hover:scale-[1.02] hover:bg-white ' +
          'hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]'
        }
        tabIndex={0}
      >
        <div
          className={
            'relative aspect-[4/3] w-full min-h-0 overflow-hidden ' +
            'rounded-t-3xl bg-gradient-to-br from-amber-50 to-amber-100'
          }
        >
          <Image
            src={imageSrc}
            alt={plate.name}
            fill
            className={
              'diary-plate-img plate-image-hover object-cover brightness-[0.96] ' +
              'contrast-[1.05] transition duration-300'
            }
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setUseFallbackImage(true)}
          />
          <span
            className={
              'absolute left-0 top-0 m-3 rounded-[1.2em] bg-white/95 px-3 ' +
              'py-2 text-base font-bold text-amber-600 shadow-md ' +
              'backdrop-blur-sm'
            }
            title="Calificación"
          >
            {stars}
          </span>
          <span
            className={
              'absolute right-0 top-0 m-3 rounded-[1.2em] bg-white/95 px-3 ' +
              'py-2 text-base font-bold text-green-800 shadow-md ' +
              'backdrop-blur-sm'
            }
            title="Precio"
          >
            <span role="img" aria-label="money">
              💲
            </span>{' '}
            {priceLabel}
          </span>
          <button
            className={
              'wow-fav-btn btn btn-light btn-sm absolute bottom-0 right-0 m-2 ' +
              'rounded-full shadow-md transition-colors duration-200 ' +
              (isFav
                ? 'bg-orange-300 text-white'
                : 'bg-white text-orange-300')
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav(idx);
            }}
            aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            type="button"
          >
            <span
              className={
                'inline-block text-xl transition-transform duration-200 ' +
                (isFav ? 'scale-125' : 'scale-100')
              }
            >
              {isFav ? '❤️' : '🤍'}
            </span>
          </button>
          {images.length > 1 && (
            <>
              <button
                className={
                  'wow-slider-btn btn btn-light btn-sm absolute left-2 top-1/2 ' +
                  'z-[2] -translate-y-1/2 rounded-full shadow-md'
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeImgIdx(
                    idx,
                    (imgIdx - 1 + images.length) % images.length,
                  );
                }}
                aria-label="Imagen anterior"
                type="button"
              >
                ‹
              </button>
              <button
                className={
                  'wow-slider-btn btn btn-light btn-sm absolute right-2 top-1/2 ' +
                  'z-[2] -translate-y-1/2 rounded-full shadow-md'
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeImgIdx(idx, (imgIdx + 1) % images.length);
                }}
                aria-label="Siguiente imagen"
                type="button"
              >
                ›
              </button>
              <div
                className={
                  'absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[0.7em] ' +
                  'bg-black/25 px-3 py-0.5 pb-2 text-base text-white ' +
                  'shadow-[0_2px_8px_#000]'
                }
              >
                {imgIdx + 1} / {images.length}
              </div>
            </>
          )}
        </div>
        <div
          className={
            'flex flex-1 flex-col justify-between px-6 pb-4 pt-6 md:px-8 ' +
            'md:pt-7'
          }
        >
          <div className="mb-3 grid gap-3 md:grid-cols-12">
            <div className="col-span-12 flex flex-col justify-start md:col-span-8">
              <h5
                className={
                  'mb-2 break-words text-xl font-bold leading-snug ' +
                  'text-orange-900'
                }
              >
                {plate.name}
              </h5>
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className={
                      'badge inline-flex items-center rounded-[0.8em] border ' +
                      'border-amber-400 bg-gradient-to-br from-amber-50 ' +
                      'to-amber-200 px-3 py-1 text-sm font-semibold text-neutral-900'
                    }
                  >
                    <span role="img" aria-label="tag">
                      🏷️
                    </span>{' '}
                    {tag}
                  </span>
                ))}
              </div>
              <div
                className={
                  'line-clamp-2 min-h-10 max-h-[3.75rem] overflow-hidden ' +
                  'text-base leading-snug text-neutral-800'
                }
              >
                <span role="img" aria-label="note" className="mr-2">
                  📝
                </span>
                <span className="font-medium">
                  {plate.note || (
                    <span className="italic text-neutral-500">
                      Sin notas adicionales
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div
              className={
                'col-span-12 mt-2 flex flex-col items-start gap-3 ' +
                'md:col-span-4 md:mt-0 md:items-end'
              }
            >
              <span
                className={
                  'inline-flex rounded-[0.8em] bg-gradient-to-br from-blue-700 ' +
                  'to-blue-800 px-4 py-2 text-sm font-medium text-white ' +
                  'shadow-md'
                }
                title="Tamaño de porción"
              >
                <span role="img" aria-label="portion">
                  🍽️
                </span>{' '}
                {portionLabel}
              </span>
              <span
                className={
                  'inline-flex rounded-[0.8em] border px-4 py-2 text-sm ' +
                  'font-semibold ' +
                  (wouldOrderAgain
                    ? 'border-green-500 bg-gradient-to-br from-green-50 ' +
                      'to-green-200 text-green-900'
                    : 'border-red-400 bg-gradient-to-br from-red-50 ' +
                      'to-red-200 text-red-900')
                }
                title="¿Lo pedirías de nuevo?"
              >
                {wouldOrderAgain ? (
                  <>
                    <span role="img" aria-label="repeat">
                      🔁
                    </span>{' '}
                    De nuevo
                  </>
                ) : (
                  <>
                    <span role="img" aria-label="no-repeat">
                      🚫
                    </span>{' '}
                    No
                  </>
                )}
              </span>
              <button
                className={
                  'btn btn-outline-primary btn-sm rounded-[0.8em] border-blue-500 ' +
                  'bg-gradient-to-br from-sky-50 to-sky-200 px-4 py-2 ' +
                  'font-semibold tracking-wide text-blue-900 shadow-sm'
                }
                title="Compartir"
                onClick={handleShare}
                type="button"
              >
                <span role="img" aria-label="share">
                  🔗
                </span>{' '}
                Compartir
              </button>
            </div>
          </div>
          <div
            className={
              'mb-2 grid gap-2 rounded-xl border border-amber-300/30 ' +
              'bg-amber-100/30 p-2 md:grid-cols-2'
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="flex items-center text-lg font-bold text-green-800"
                aria-hidden
              >
                <span role="img" aria-label="pro">
                  👍
                </span>
              </span>
              {plate.pros.length === 0 ? (
                <span className="badge bg-light text-secondary">—</span>
              ) : (
                plate.pros.map((pro: string, i: number) => (
                  <span
                    key={i}
                    className={
                      'badge inline-flex items-center rounded border ' +
                      'border-green-200 bg-green-50 px-2 py-1 text-sm ' +
                      'font-semibold text-green-900'
                    }
                  >
                    <span className="text-green-800" aria-hidden>
                      ➕
                    </span>{' '}
                    {pro}
                  </span>
                ))
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="flex items-center text-lg font-bold text-red-800"
                aria-hidden
              >
                <span role="img" aria-label="con">
                  👎
                </span>
              </span>
              {plate.cons.length === 0 ? (
                <span className="badge bg-light text-secondary">—</span>
              ) : (
                plate.cons.map((con: string, i: number) => (
                  <span
                    key={i}
                    className={
                      'badge inline-flex items-center rounded border ' +
                      'border-red-200 bg-red-50 px-2 py-1 text-sm ' +
                      'font-semibold text-red-900'
                    }
                  >
                    <span className="text-red-800" aria-hidden>
                      ➖
                    </span>{' '}
                    {con}
                  </span>
                ))
              )}
            </div>
          </div>
          <div
            className={
              'card-footer-row flex flex-wrap items-center justify-between ' +
              'gap-2 border-t border-amber-300/30 pb-1 pt-2 text-sm ' +
              'text-neutral-600 transition-colors duration-200 ' +
              'hover:bg-amber-50/50'
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              {time && (
                <span
                  className="flex items-center gap-1"
                  title="Hora de la comida"
                >
                  <span role="img" aria-label="clock">
                    ⏰
                  </span>
                  <span className="font-medium">{time}</span>
                </span>
              )}
              {visitedWith && (
                <span className="flex items-center gap-1" title="Compañía">
                  <span role="img" aria-label="group">
                    👥
                  </span>
                  <span className="font-medium">{visitedWith}</span>
                </span>
              )}
            </div>
            <span
              className={
                'badge border bg-light text-xs font-medium text-muted ' +
                'text-neutral-600'
              }
              title="Fecha de la visita"
            >
              <span role="img" aria-label="calendar">
                📅
              </span>{' '}
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
