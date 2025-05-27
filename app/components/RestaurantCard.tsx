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
}

export default function RestaurantCard({ name, image, location, rating, description, reviewCount, categoryLabel }: RestaurantCardProps) {
  const [imgSrc, setImgSrc] = useState(image);
  return (
    <div className="gallery-card">
      <div className="gallery-image-container" style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
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
          <div className="gallery-category-badge">
            {categoryLabel}
          </div>
        )}
        {/* Review count badge (top right) */}
        <div className="gallery-review-badge">
          {reviewCount} reseñas
        </div>
      </div>
      
      {/* Restaurant Information */}
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
    </div>
  );
} 