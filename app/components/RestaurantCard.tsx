"use client";
import Image from 'next/image';
import { useState } from 'react';

interface RestaurantCardProps {
  name: string;
  image: string;
  location: string;
  rating: number;
  description: string;
}

export default function RestaurantCard({ name, image, location, rating, description }: RestaurantCardProps) {
  const [imgSrc, setImgSrc] = useState(image);
  return (
    <div className="restaurant-card shadow-sm">
      <div className="restaurant-card-img-container">
        <Image
          src={imgSrc}
          alt={name}
          fill
          className="restaurant-card-img"
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 33vw"
          onError={() => setImgSrc('/img/restaurant-fallback.jpg')}
        />
      </div>
      <div className="restaurant-card-body">
        <h3 className="restaurant-card-title">{name}</h3>
        <div className="restaurant-card-meta">
          <span className="restaurant-card-location">{location}</span>
          <span className="restaurant-card-rating">{'★'.repeat(Math.round(rating))} <span className="restaurant-card-rating-num">{rating.toFixed(1)}</span></span>
        </div>
        <p className="restaurant-card-desc">{description}</p>
      </div>
    </div>
  );
} 