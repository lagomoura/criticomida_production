'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { reviewCategoryFilterOptions } from '@/app/data/review-categories';
import RestaurantCard from './RestaurantCard';
import { Category } from '@/app/lib/types';

interface ReviewItem {
  category: string;
  img: string;
  alt: string;
  title: string;
  label: string;
  description: string;
  reviewCount: number;
}

function categoryToReviewItem(cat: Category): ReviewItem {
  const slug = cat.slug;
  return {
    category: slug,
    img: cat.image_url || `/img/${slug}.jpg`,
    alt: cat.name,
    title: `reseñas de ${cat.name.toLowerCase()}`,
    label: cat.name,
    description: cat.description || `Reseñas de ${cat.name.toLowerCase()}`,
    reviewCount: cat.review_count ?? cat.reviewCount ?? 0,
  };
}

const filterOptions = reviewCategoryFilterOptions;

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
  }
  if (sort === 'az') {
    return [...items].sort((a, b) => a.label.localeCompare(b.label));
  }
  if (sort === 'za') {
    return [...items].sort((a, b) => b.label.localeCompare(a.label));
  }
  return items;
}

function parseSortFromParams(params: URLSearchParams): SortType {
  const value = params.get('sort');
  if (value === 'az' || value === 'za' || value === 'most') {
    return value;
  }
  return 'most';
}

function parseFiltersFromParams(params: URLSearchParams): string[] {
  const raw = params.get('filters');
  if (!raw || raw === 'all') {
    return ['all'];
  }
  const parts = raw.split(',').map((segment) => segment.trim()).filter(Boolean);
  return parts.length > 0 ? parts : ['all'];
}

function pushReviewStateToUrl(
  router: ReturnType<typeof useRouter>,
  nextSort: SortType,
  nextFilters: string[],
) {
  const params = new URLSearchParams();
  if (nextSort !== 'most') {
    params.set('sort', nextSort);
  }
  const isOnlyAll =
    nextFilters.length === 1 && nextFilters[0] === 'all';
  if (!isOnlyAll) {
    params.set('filters', nextFilters.join(','));
  }
  const query = params.toString();
  router.replace(query ? `/?${query}` : '/', { scroll: false });
}

interface ReviewsSectionProps {
  categories: Category[];
}

export default function ReviewsSection({ categories }: ReviewsSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<SortType>('most');
  const rippleRefs = useRef<RippleRefs>({});
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  const reviewItems: ReviewItem[] = categories.map(categoryToReviewItem);

  useEffect(() => {
    const nextSort = parseSortFromParams(searchParams);
    const nextFilters = parseFiltersFromParams(searchParams);
    setSort(nextSort);
    setActiveFilters(nextFilters);
  }, [searchParams]);

  const handleFilterClick = (value: string) => {
    let next: string[];
    if (value === 'all') {
      next = ['all'];
    } else {
      const prev = activeFilters;
      const isActive = prev.includes(value);
      let draft: string[];
      if (isActive) {
        draft = prev.filter((filterValue) => filterValue !== value);
      } else {
        draft = prev.filter((filterValue) => filterValue !== 'all').concat(
          value,
        );
      }
      next = draft.length === 0 ? ['all'] : draft;
    }
    setActiveFilters(next);
    pushReviewStateToUrl(router, sort, next);
  };

  const handleClearFilters = () => {
    const next = ['all'];
    setActiveFilters(next);
    pushReviewStateToUrl(router, sort, next);
  };

  const handleSortChange = (nextSort: SortType) => {
    setSort(nextSort);
    pushReviewStateToUrl(router, nextSort, activeFilters);
  };

  const filteredItems = sortItems(
    reviewItems.filter((item: ReviewItem) => {
      const matchesFilter =
        activeFilters.includes('all') ||
        activeFilters.includes(item.category);
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.label.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    }),
    sort,
  );

  function handleCardClick(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    category: string,
  ) {
    const card = rippleRefs.current[category];
    if (!card) {
      return;
    }
    const ripple = card.querySelector('.ripple') as HTMLSpanElement | null;
    if (!ripple) {
      return;
    }
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.nativeEvent ? event.nativeEvent.offsetX : rect.width / 2;
    const y = event.nativeEvent ? event.nativeEvent.offsetY : rect.height / 2;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.classList.remove('show');
    void ripple.offsetWidth;
    ripple.classList.add('show');
  }

  function handleTooltipShow() {
    if (window.innerWidth < 768) {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
      tooltipTimeout.current = setTimeout(() => {}, 2000);
    }
  }

  return (
    <section id="reviews" className="reviews scroll-mt-24 py-5">
      <div className="cc-container">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <label htmlFor="sort-reviews" className="mr-2 font-bold">
            Ordenar por:
          </label>
          <select
            id="sort-reviews"
            name="review-sort"
            className="form-select review-sort-dropdown"
            value={sort}
            onChange={(event) =>
              handleSortChange(event.target.value as SortType)
            }
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="reviews-title-animate mx-auto max-w-md px-4 text-center sm:max-w-lg">
          <h2 className="capitalize">
            Nuestras <strong className="banner-title">reseñas</strong>
          </h2>
        </div>
        <div className="reviews-filters-animate mt-4">
          <div className="sortBtn mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2">
            {filterOptions.map((opt) => (
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
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        <br />
        <div className="reviews-search-animate">
          <div className="mx-auto max-w-md px-4 md:max-w-lg">
            <form onSubmit={(event) => event.preventDefault()}>
              <div className="input-group mb-3">
                <input
                  type="search"
                  className="form-control"
                  id="search-id"
                  name="review-search"
                  placeholder="Buscar restaurante o comida…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Buscar reseñas"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </form>
          </div>
        </div>
        <div
          className="review-items mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          id="review-items"
        >
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <h4 className="text-muted">No se encontraron reseñas.</h4>
            </div>
          )}
          {filteredItems.map((item: ReviewItem, idx: number) => (
            <div
              key={item.category}
              className="review-item review-card-animate mx-auto my-3 w-full max-w-sm"
              style={{ '--review-anim-order': idx } as React.CSSProperties}
              data-item={item.category}
            >
              <Link
                href={`/reviews/${item.category}`}
                className="gallery-link relative block overflow-hidden bg-transparent no-underline"
                ref={(element) => {
                  rippleRefs.current[item.category] = element;
                }}
                onMouseEnter={handleTooltipShow}
                onMouseLeave={handleTooltipShow}
                onTouchStart={handleTooltipShow}
                onTouchEnd={handleTooltipShow}
                onClick={(event) => handleCardClick(event, item.category)}
                tabIndex={0}
                aria-label={`Ver todas las reseñas de ${item.label}`}
              >
                <RestaurantCard
                  name={item.label}
                  image={item.img}
                  location=""
                  rating={0}
                  description={item.description}
                  reviewCount={item.reviewCount}
                  categoryLabel={item.label}
                />
                <span className="ripple" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
