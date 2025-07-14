"use client";
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

export default function RestaurantCard({ name, image, location, rating, description, reviewCount, categoryLabel, showInfo = false }: RestaurantCardProps) {
  const [imgSrc, setImgSrc] = useState(image);
  return (
    <div className={showInfo ? "gallery-card" : "gallery-link"}>
      <div className="gallery-image-container" style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden', borderRadius: showInfo ? '16px 16px 0 0' : '16px' }}>
        <Image
          src={imgSrc}
          alt={name}
          fill
          className="gallery-image"
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 33vw"
          onError={() => setImgSrc('/img/restaurant-fallback.jpg')}
        />
        {/* Category badge (top left) */}
        {categoryLabel && (
          <div className="position-absolute top-0 start-0 m-3 px-3 py-2" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#ff6b35',
            borderRadius: '1.2em',
            fontWeight: 700,
            fontSize: '0.9em',
            boxShadow: '0 4px 12px rgba(255,107,53,0.25)',
            backdropFilter: 'blur(8px)',
            zIndex: 5
          }}>
            {categoryLabel}
          </div>
        )}
        {/* Review count badge (top right) */}
        <div className="position-absolute top-0 end-0 m-3 px-3 py-2" style={{
          background: 'rgba(0, 0, 0, 0.75)',
          color: 'white',
          borderRadius: '1.2em',
          fontWeight: 600,
          fontSize: '0.9em',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          zIndex: 5
        }}>
          {reviewCount} reseñas
        </div>
      </div>
      
      {/* Restaurant Information - Only show if showInfo is true */}
      {showInfo && (
        <div className="gallery-card-info">
          <h3 className="gallery-card-title">{name}</h3>
          <div className="gallery-card-meta">
            <span className="gallery-card-location">{location}</span>
            {rating > 0 && (
              <div className="gallery-card-rating">
                <span className="rating-stars">{'★'.repeat(Math.round(rating))}</span>
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