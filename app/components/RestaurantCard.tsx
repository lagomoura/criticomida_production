'use client';

import Image from 'next/image';
import { useState } from 'react';

interface RestaurantCardProps {
  name: string;
  image: string;
  location: string;
  rating: number;
  description: string;
  reviewCount: number;
  categoryLabel?: string;
  showInfo?: boolean;
}

export default function RestaurantCard({
  name,
  image,
  location,
  rating: ratingProp,
  description,
  reviewCount,
  categoryLabel,
  showInfo = false,
}: RestaurantCardProps) {
  const [imgSrc, setImgSrc] = useState(image);
  const rating = Number(ratingProp);
  const topRadius = showInfo ? 'rounded-t-2xl' : 'rounded-2xl';

  return (
    <div className={showInfo ? 'gallery-card' : 'gallery-link'}>
      <div
        className={`gallery-image-container relative aspect-[4/3] w-full overflow-hidden ${topRadius}`}
      >
        <Image
          src={imgSrc}
          alt={name}
          fill
          className="gallery-image object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          onError={() => setImgSrc('/img/restaurant-fallback.jpg')}
        />
        {categoryLabel && (
          <div
            className={
              'absolute left-0 top-0 z-[5] m-3 rounded-[1.2em] ' +
              'bg-white/95 px-3 py-2 text-sm font-bold text-orange-500 ' +
              'shadow-[0_4px_12px_rgba(255,107,53,0.25)] backdrop-blur-sm'
            }
          >
            {categoryLabel}
          </div>
        )}
        <div
          className={
            'absolute right-0 top-0 z-[5] m-3 rounded-[1.2em] ' +
            'bg-black/75 px-3 py-2 text-sm font-semibold text-white ' +
            'shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-sm'
          }
        >
          {reviewCount} reseñas
        </div>
      </div>

      {showInfo && (
        <div className="gallery-card-info">
          <h3 className="gallery-card-title">{name}</h3>
          <div className="gallery-card-meta">
            <span className="gallery-card-location">{location}</span>
            {rating > 0 && (
              <div className="gallery-card-rating">
                <span className="rating-stars">
                  {'★'.repeat(Math.round(rating))}
                </span>
                <span className="rating-number">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="gallery-card-description">{description}</p>
        </div>
      )}
    </div>
  );
}
