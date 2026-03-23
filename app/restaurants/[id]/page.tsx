"use client";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import { Plate, Dish, DishReview } from '@/app/lib/types';
import {
  RestaurantHeader,
  ProsCons,
  DiaryEntry,
  PlateGallery,
  AddPlateModal,
  AddMenuModal,
  MenuSection,
  PhotoGallery,
  Lightbox,
  LocationMap,
} from './components';
import { getRestaurant } from '@/app/lib/api/restaurants';
import { getDishes } from '@/app/lib/api/dishes';
import { getReviews } from '@/app/lib/api/reviews';
import { RestaurantDetail } from '@/app/lib/types';

// ----- Data mapping helpers -----

function dishAndReviewsToPlate(dish: Dish, reviews: DishReview[]): Plate {
  const firstReview = reviews[0];
  const pros = firstReview
    ? firstReview.pros_cons.filter((pc) => pc.type === 'pro').map((pc) => pc.text)
    : [];
  const cons = firstReview
    ? firstReview.pros_cons.filter((pc) => pc.type === 'con').map((pc) => pc.text)
    : [];
  const images =
    firstReview && firstReview.images.length > 0
      ? firstReview.images
          .sort((a, b) => a.display_order - b.display_order)
          .map((img) => img.url)
      : [dish.cover_image_url || '/img/food-fallback.jpg'];

  return {
    name: dish.name,
    date: firstReview ? firstReview.date_tasted : dish.created_at.slice(0, 10),
    time: firstReview?.time_tasted ?? undefined,
    note: firstReview?.note ?? dish.description ?? '',
    pros,
    cons,
    image: images[0],
    images,
    rating: firstReview ? firstReview.rating : dish.computed_rating,
    price: dish.price_tier ?? '$$',
    portion: firstReview?.portion_size ?? 'medium',
    wouldOrderAgain: firstReview?.would_order_again ?? true,
    tags: firstReview ? firstReview.tags.map((t) => t.tag) : [],
    visitedWith: firstReview?.visited_with ?? '',
  };
}

// ----- Loading / not found states -----

function LoadingState() {
  return (
    <main id="main-content" className="cc-container py-5">
      <div className="text-center py-12">
        <div className="spinner-border text-primary" role="status" aria-hidden />
        <p className="mt-3 text-neutral-600">Cargando restaurante…</p>
      </div>
    </main>
  );
}

function NotFoundState() {
  return (
    <main id="main-content" className="cc-container py-5">
      <div className="text-center">
        <h2>No encontrado</h2>
        <p>No se encontró información para este restaurante.</p>
        <Link href="/" className="btn btn-primary mt-3">Volver al inicio</Link>
      </div>
    </main>
  );
}

// ----- Main page component -----

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [plates, setPlates] = useState<Plate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    images: [''],
    note: '',
    pros: '',
    cons: '',
    rating: 5,
    price: '$$',
    portion: 'Medium',
    wouldOrderAgain: true,
    tags: '',
    visitedWith: ''
  });
  const [formError, setFormError] = useState('');

  // Gallery state
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [favorites, setFavorites] = useState<{ [idx: number]: boolean }>({});
  const [gridImgIdx, setGridImgIdx] = useState<{ [idx: number]: number }>({});

  // Menu state
  const [menu, setMenu] = useState<{image: string, uploadDate: string} | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    image: '',
    uploadDate: new Date().toISOString().split('T')[0]
  });

  // Fetch restaurant + dishes + reviews
  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const [restaurantData, dishesData] = await Promise.all([
          getRestaurant(id),
          getDishes(id).catch(() => [] as Dish[]),
        ]);
        setRestaurant(restaurantData);

        // Fetch reviews for each dish
        const dishesWithReviews = await Promise.all(
          dishesData.map(async (dish) => {
            try {
              const reviews = await getReviews(dish.id);
              return { dish, reviews };
            } catch {
              return { dish, reviews: [] as DishReview[] };
            }
          })
        );

        const mappedPlates = dishesWithReviews.map(({ dish, reviews }) =>
          dishAndReviewsToPlate(dish, reviews)
        );
        setPlates(mappedPlates);

        // Build gallery from all review images + cover image
        const allImages: string[] = [];
        if (restaurantData.cover_image_url) {
          allImages.push(restaurantData.cover_image_url);
        }
        for (const { reviews } of dishesWithReviews) {
          for (const review of reviews) {
            for (const img of review.images) {
              if (!allImages.includes(img.url)) {
                allImages.push(img.url);
              }
            }
          }
        }
        setGallery(allImages);
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  // Lightbox keyboard navigation
  const handleLightboxKey = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'ArrowLeft') setGalleryIdx(idx => (idx - 1 + gallery.length) % gallery.length);
    if (e.key === 'ArrowRight') setGalleryIdx(idx => (idx + 1) % gallery.length);
    if (e.key === 'Escape') setLightboxOpen(false);
  }, [lightboxOpen, gallery.length]);

  useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = 'hidden';
    } else {
      window.removeEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, handleLightboxKey]);

  function handleOpenModal() {
    setForm({ name: '', date: '', time: '', images: [''], note: '', pros: '', cons: '', rating: 5, price: '$$', portion: 'Medium', wouldOrderAgain: true, tags: '', visitedWith: '' });
    setFormError('');
    setShowModal(true);
  }
  function handleCloseModal() {
    setShowModal(false);
  }

  // Menu handlers
  function handleOpenMenuModal() {
    setMenuForm({
      image: menu?.image || '',
      uploadDate: menu?.uploadDate || new Date().toISOString().split('T')[0]
    });
    setShowMenuModal(true);
  }

  function handleCloseMenuModal() {
    setShowMenuModal(false);
  }

  function handleMenuFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setMenuForm({ ...menuForm, [name]: value });
  }

  function handleMenuFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!menuForm.image.trim()) {
      alert('Por favor ingresa la URL de la imagen del menú.');
      return;
    }
    setMenu({
      image: menuForm.image.trim(),
      uploadDate: menuForm.uploadDate
    });
    setShowMenuModal(false);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      if ('checked' in e.target) {
        setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
      }
    } else if (type === 'radio' && name === 'wouldOrderAgain') {
      setForm({ ...form, wouldOrderAgain: value === 'true' });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function handleImageChange(idx: number, value: string) {
    setForm(form => {
      const newImages = [...form.images];
      newImages[idx] = value;
      return { ...form, images: newImages };
    });
  }

  function handleAddImageField() {
    setForm(form => ({ ...form, images: [...form.images, ''] }));
  }

  function handleRemoveImageField(idx: number) {
    setForm(form => {
      const newImages = form.images.filter((_, i) => i !== idx);
      return { ...form, images: newImages.length ? newImages : [''] };
    });
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.date) {
      setFormError('El nombre y la fecha son obligatorios.');
      return;
    }
    const images = form.images.map(img => img.trim()).filter(Boolean);
    setPlates([
      ...plates,
      {
        name: form.name,
        date: form.date,
        time: form.time || new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        image: images.length ? images[0] : '/img/food-fallback.jpg',
        images: images.length ? images : ['/img/food-fallback.jpg'],
        note: form.note,
        pros: form.pros.split(',').map(s => s.trim()).filter(Boolean),
        cons: form.cons.split(',').map(s => s.trim()).filter(Boolean),
        rating: Number(form.rating),
        price: form.price,
        portion: form.portion,
        wouldOrderAgain: !!form.wouldOrderAgain,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        visitedWith: form.visitedWith
      }
    ]);
    setShowModal(false);
  }

  if (loading) return <LoadingState />;
  if (notFound || !restaurant) return <NotFoundState />;

  // Compute back navigation from category
  const categorySlug = restaurant.category?.slug ?? '';
  const categoryLabel = restaurant.category?.name ?? 'inicio';
  const backHref = categorySlug ? `/reviews/${categorySlug}` : '/';
  const backLabel = categoryLabel;

  return (
    <main id="main-content" className="cc-container py-5">
      <RestaurantHeader
        name={restaurant.name}
        location={restaurant.location_name}
        rating={restaurant.computed_rating}
        reviewCount={restaurant.review_count}
        description={restaurant.description ?? ''}
        backHref={backHref}
        backLabel={backLabel}
      />

      <ProsCons pros={[]} cons={[]} />

      <DiaryEntry diary={restaurant.description ?? ''} />

      <MenuSection menu={menu} onOpenMenuModal={handleOpenMenuModal} />

      <PlateGallery
        plates={plates}
        favorites={favorites}
        gridImgIdx={gridImgIdx}
        onToggleFav={(idx) => setFavorites(favs => ({ ...favs, [idx]: !favs[idx] }))}
        onChangeImgIdx={(idx, newImgIdx) => setGridImgIdx(idxObj => ({ ...idxObj, [idx]: newImgIdx }))}
        onOpenModal={handleOpenModal}
      />

      <AddPlateModal
        show={showModal}
        form={form}
        formError={formError}
        onClose={handleCloseModal}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        onAddImageField={handleAddImageField}
        onRemoveImageField={handleRemoveImageField}
        onSubmit={handleFormSubmit}
      />

      <AddMenuModal
        show={showMenuModal}
        menuForm={menuForm}
        hasExistingMenu={!!menu}
        onClose={handleCloseMenuModal}
        onFormChange={handleMenuFormChange}
        onSubmit={handleMenuFormSubmit}
      />

      <LocationMap location={restaurant.location_name} />

      <PhotoGallery
        gallery={gallery}
        galleryIdx={galleryIdx}
        onPrev={() => setGalleryIdx((galleryIdx - 1 + gallery.length) % gallery.length)}
        onNext={() => setGalleryIdx((galleryIdx + 1) % gallery.length)}
        onOpenLightbox={() => setLightboxOpen(true)}
      />

      <Lightbox
        open={lightboxOpen}
        gallery={gallery}
        galleryIdx={galleryIdx}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setGalleryIdx((galleryIdx - 1 + gallery.length) % gallery.length)}
        onNext={() => setGalleryIdx((galleryIdx + 1) % gallery.length)}
      />

      <style jsx>{`
        .card-footer-row:hover {
          background: #fffbe7;
        }
      `}</style>
    </main>
  );
}
