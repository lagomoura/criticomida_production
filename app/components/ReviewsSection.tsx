"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import RestaurantCard from './RestaurantCard';

interface ReviewItem {
  category: string;
  img: string;
  alt: string;
  title: string;
  label: string;
  description: string;
  reviewCount: number;
}

const reviewItems: ReviewItem[] = [
  { category: 'dulces', img: '/img/dulces.jpg', alt: 'postres Criticomida', title: 'reseñas de dulces', label: 'Dulces', description: '¡Descubrí los mejores postres y dulces de la ciudad!', reviewCount: 128 },
  { category: 'brunchs', img: '/img/brunch.jpg', alt: 'brunch Criticomida', title: 'reseñas de brunchs', label: 'Brunchs', description: 'Los mejores lugares para brunchear con amigos.', reviewCount: 87 },
  { category: 'desayunos', img: '/img/breakfast.jpg', alt: 'Desayunos Criticomida', title: 'reseñas de desayunos', label: 'Desayunos', description: 'Arrancá el día con los desayunos más ricos.', reviewCount: 102 },
  { category: 'mexico-food', img: '/img/mexfood2.jpg', alt: 'mex-food Criticomida', title: 'reseñas mex-food', label: 'Mexicana', description: 'Comida mexicana picante y llena de sabor.', reviewCount: 95 },
  { category: 'japan-food', img: '/img/japanfood.jpg', alt: 'japanfood Criticomida', title: 'reseñas japan-food', label: 'Japonesa', description: 'Sushi, ramen y mucho más de Japón.', reviewCount: 76 },
  { category: 'arabic-food', img: '/img/arabicfood.jpg', alt: 'Comida arabe Criticomida', title: 'reseñas Arabic-food', label: 'Árabe', description: 'Sabores y delicias de Medio Oriente.', reviewCount: 54 },
  { category: 'israelfood', img: '/img/israelfood.jpg', alt: 'comida israeli criticomida', title: 'reseñas comida Israeli', label: 'Israelí', description: 'Platos únicos y tradicionales de Israel.', reviewCount: 33 },
  { category: 'thaifood', img: '/img/thaifood.jpg', alt: 'comida thai Criticomida', title: 'reseñas comida Thai', label: 'Tailandesa', description: 'Comida tailandesa exótica y picante.', reviewCount: 61 },
  { category: 'koreanfood', img: '/img/koreanfood.jpg', alt: 'Korean food Criticomida', title: 'reseñas comida Koreana', label: 'Coreana', description: 'BBQ coreano, kimchi y más.', reviewCount: 44 },
  { category: 'chinafood', img: '/img/chinafood.jpg', alt: 'comida china Criticomida', title: 'reseñas comida china', label: 'China', description: 'Dim sum, fideos y clásicos chinos.', reviewCount: 70 },
  { category: 'parrillas', img: '/img/parrilla.jpg', alt: 'parrilas Criticomida', title: 'reseñas parrilas', label: 'Parrilla', description: 'Las mejores parrillas y carnes asadas.', reviewCount: 58 },
  { category: 'brazilfood', img: '/img/brazilfood.jpg', alt: 'Comida brasilena Criticomida', title: 'reseñas Comida Brasileira', label: 'Brasileña', description: 'Churrasquerías y sabores de Brasil.', reviewCount: 39 },
  { category: 'burguers', img: '/img/burguers.jpg', alt: 'habuerguesas Criticomida', title: 'reseñas Burguers', label: 'Hamburguesas', description: 'Las hamburguesas más jugosas y sabrosas.', reviewCount: 110 },
  { category: 'helados', img: '/img/helados.jpg', alt: 'helados Criticomida', title: 'reseñas helados', label: 'Helados', description: 'Refrescate con los mejores helados.', reviewCount: 73 },
  { category: 'peru-food', img: '/img/perufood.jpg', alt: 'Comida peruana Criticomida', title: 'reseña comida peruana', label: 'Peruana', description: 'Ceviche y delicias peruanas.', reviewCount: 29 },
];

const filterOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Dulces', value: 'dulces' },
  { label: 'Brunchs', value: 'brunchs' },
  { label: 'Desayunos', value: 'desayunos' },
  { label: 'Mexicana', value: 'mexico-food' },
  { label: 'Japonesa', value: 'japan-food' },
  { label: 'Árabe', value: 'arabic-food' },
  { label: 'Israelí', value: 'israelfood' },
  { label: 'Tailandesa', value: 'thaifood' },
  { label: 'Coreana', value: 'koreanfood' },
  { label: 'China', value: 'chinafood' },
  { label: 'Parrilla', value: 'parrillas' },
  { label: 'Brasileña', value: 'brazilfood' },
  { label: 'Hamburguesas', value: 'burguers' },
  { label: 'Helados', value: 'helados' },
  { label: 'Peruana', value: 'peru-food' },
];

const sortOptions = [
  { label: 'Más reseñas', value: 'most' },
  { label: 'A-Z', value: 'az' },
  { label: 'Z-A', value: 'za' },
];

type SortType = 'most' | 'az' | 'za';

type RippleRefs = {
  [category: string]: HTMLAnchorElement | null;
};

function sortItems(items: ReviewItem[], sort: SortType): ReviewItem[] {
  if (sort === 'most') {
    return [...items].sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === 'az') {
    return [...items].sort((a, b) => a.label.localeCompare(b.label));
  } else if (sort === 'za') {
    return [...items].sort((a, b) => b.label.localeCompare(a.label));
  }
  return items;
}

export default function ReviewsSection() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<SortType>('most');
  const rippleRefs = useRef<RippleRefs>({});
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  // Multi-select filter logic
  function handleFilterClick(value: string) {
    if (value === 'all') {
      setActiveFilters(['all']);
    } else {
      setActiveFilters(prev => {
        const isActive = prev.includes(value);
        let next;
        if (isActive) {
          next = prev.filter(f => f !== value);
        } else {
          next = prev.filter(f => f !== 'all').concat(value);
        }
        return next.length === 0 ? ['all'] : next;
      });
    }
  }

  const filteredItems = sortItems(
    reviewItems.filter((item: ReviewItem) => {
      const matchesFilter = activeFilters.includes('all') || activeFilters.includes(item.category);
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.label.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    }),
    sort
  );

  // Ripple effect handler
  function handleCardClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, category: string) {
    const card = rippleRefs.current[category];
    if (!card) return;
    const ripple = card.querySelector('.ripple') as HTMLSpanElement | null;
    if (!ripple) return;
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.nativeEvent ? e.nativeEvent.offsetX : rect.width / 2;
    const y = e.nativeEvent ? e.nativeEvent.offsetY : rect.height / 2;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.classList.remove('show');
    // force reflow
    void ripple.offsetWidth;
    ripple.classList.add('show');
  }

  // Tooltip auto-dismiss for mobile
  function handleTooltipShow() {
    if (window.innerWidth < 768) {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = setTimeout(() => {}, 2000);
    }
  }

  return (
    <section id="reviews" className="reviews py-5">
      <div className="container">
        {/* Sorting Dropdown */}
        <div className="row mb-3">
          <div className="col-12 text-end">
            <label htmlFor="sort-reviews" className="me-2 fw-bold">Ordenar por:</label>
            <select
              id="sort-reviews"
              className="form-select d-inline-block w-auto review-sort-dropdown"
              value={sort}
              onChange={e => setSort(e.target.value as SortType)}
              style={{maxWidth: 180, display: 'inline-block'}}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        {/* section title */}
        <div className="row col-10 mx-auto col-sm-6 text-center reviews-title-animate">
          <h1 className="text-capitalize">
            Nuestras <strong className="banner-title">reseñas</strong>
          </h1>
        </div>
        {/* end of section title */}
        {/* filter buttons */}
        <div className="row reviews-filters-animate">
          <div className="col-lg-8 mx-auto d-flex justify-content-around sortBtn flex-wrap align-items-center">
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                className={`btn filter-btn${activeFilters.includes(opt.value) ? ' active' : ''}`}
                onClick={() => handleFilterClick(opt.value)}
                type="button"
                aria-pressed={activeFilters.includes(opt.value)}
              >
                {opt.label}
              </button>
            ))}
            {activeFilters.length > 1 && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setActiveFilters(['all'])}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        <br />
        {/* end of filter buttons */}
        {/* search box */}
        <div className="row reviews-search-animate">
          <div className="col-10 mx-auto col-md-6">
            <form onSubmit={e => e.preventDefault()}>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="search-id"
                  placeholder="Buscar restaurante o comida..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Buscar reseñas"
                />
              </div>
            </form>
          </div>
        </div>
        {/* end of search box */}
        {/* review items */}
        <div className="row review-items" id="review-items">
          {filteredItems.length === 0 && (
            <div className="col-12 text-center py-5">
              <h4 className="text-muted">No se encontraron reseñas.</h4>
            </div>
          )}
          {filteredItems.map((item: ReviewItem, idx: number) => (
            <div
              key={item.category}
              className={`col-10 col-sm-6 col-lg-4 mx-auto my-3 review-item review-card-animate`}
              style={{ '--review-anim-order': idx } as React.CSSProperties}
              data-item={item.category}
            >
              <Link
                href={`/reviews/${item.category}`}
                className="gallery-link text-decoration-none"
                style={{display: 'block', position: 'relative', overflow: 'hidden', background: 'transparent'}}
                ref={(el) => { rippleRefs.current[item.category] = el; }}
                onMouseEnter={handleTooltipShow}
                onMouseLeave={handleTooltipShow}
                onTouchStart={handleTooltipShow}
                onTouchEnd={handleTooltipShow}
                onClick={(e) => handleCardClick(e, item.category)}
                tabIndex={0}
                aria-label={`Ver todas las reseñas de ${item.label}`}
              >
                <RestaurantCard
                  name={item.label}
                  image={item.img}
                  location={''}
                  rating={0}
                  description={item.description}
                  reviewCount={item.reviewCount}
                  categoryLabel={item.label}
                />
                {/* Ripple effect */}
                <span className="ripple" />
              </Link>
            </div>
          ))}
        </div>
        {/* end of review items */}
      </div>
    </section>
  );
} 