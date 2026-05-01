'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import { getRestaurant } from '@/app/lib/api/restaurants';
import { uploadRestaurantImage } from '@/app/lib/api/images';
import {
  addOfficialPhoto,
  deleteOfficialPhoto,
  listOfficialPhotos,
  listOwnerReviews,
  type OwnerReviewItem,
} from '@/app/lib/api/owner-content';
import type { OfficialPhoto } from '@/app/lib/types/owner-content';

interface Props {
  restaurantSlug: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLocation: string;
}

type GateState =
  | { kind: 'checking' }
  | { kind: 'forbidden' }
  | { kind: 'not_signed_in' }
  | { kind: 'authorized' };

const PHOTO_CAP = 5;

export default function OwnerDashboardClient({
  restaurantSlug,
  restaurantId,
  restaurantName,
  restaurantLocation,
}: Props) {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();

  const [gate, setGate] = useState<GateState>({ kind: 'checking' });
  const [isAdminViewer, setIsAdminViewer] = useState(false);
  const [photos, setPhotos] = useState<OfficialPhoto[]>([]);
  const [reviews, setReviews] = useState<OwnerReviewItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [photosResp, reviewsResp] = await Promise.all([
        listOfficialPhotos(restaurantSlug),
        listOwnerReviews(restaurantSlug),
      ]);
      setPhotos(photosResp.items);
      setReviews(reviewsResp.items);
      setPendingCount(reviewsResp.pending_count);
    } catch {
      // Silent — el render decide qué mostrar.
    }
  }, [restaurantSlug]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setGate({ kind: 'not_signed_in' });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const detail = await getRestaurant(restaurantSlug);
        if (cancelled) return;
        const isAdmin = user.role === 'admin';
        if (!detail.viewer_is_owner && !isAdmin) {
          setGate({ kind: 'forbidden' });
          return;
        }
        setIsAdminViewer(isAdmin && !detail.viewer_is_owner);
        setGate({ kind: 'authorized' });
        await loadAll();
      } catch {
        if (!cancelled) setGate({ kind: 'forbidden' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, restaurantSlug, loadAll]);

  const handleUpload = useCallback(
    async (file: File) => {
      setPhotoError(null);
      if (photos.length >= PHOTO_CAP) {
        setPhotoError(`Máximo ${PHOTO_CAP} fotos oficiales.`);
        return;
      }
      setPhotoBusy(true);
      try {
        const url = await uploadRestaurantImage(file, restaurantId);
        const created = await addOfficialPhoto(restaurantSlug, {
          url,
          alt_text: file.name.replace(/\.[^/.]+$/, '').slice(0, 80),
          display_order: photos.length,
        });
        setPhotos((prev) => [...prev, created]);
      } catch (err) {
        setPhotoError(
          err instanceof ApiError && err.status === 409
            ? `Máximo ${PHOTO_CAP} fotos oficiales.`
            : 'No se pudo subir la foto. Intentá con un archivo más chico (< 5 MB).',
        );
      } finally {
        setPhotoBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [photos.length, restaurantId, restaurantSlug],
  );

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      if (!confirm('¿Eliminar esta foto oficial?')) return;
      try {
        await deleteOfficialPhoto(restaurantSlug, photoId);
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } catch {
        setPhotoError('No se pudo eliminar la foto.');
      }
    },
    [restaurantSlug],
  );

  if (gate.kind === 'checking' || authLoading) {
    return (
      <div className="cc-container flex min-h-[40vh] items-center justify-center py-12">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (gate.kind === 'not_signed_in') {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">Iniciá sesión</h1>
        <p className="font-sans text-sm text-text-muted">
          Esta sección es para dueños verificados. Iniciá sesión con la cuenta
          que usaste para reclamar el local.
        </p>
        <div>
          <Button variant="primary" size="md" onClick={() => router.push('/')}>
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (gate.kind === 'forbidden') {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">Acceso restringido</h1>
        <p className="font-sans text-sm text-text-muted">
          Solo el dueño verificado de {restaurantName} puede ver esta sección.
          Si reclamaste la ficha hace poco, esperá a que un admin apruebe tu
          solicitud.
        </p>
        <div className="flex gap-3">
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="text-sm font-semibold text-[var(--color-canela)] no-underline hover:underline"
          >
            ← Volver al restaurante
          </Link>
          <Link
            href={`/restaurants/${restaurantSlug}/claim`}
            className="text-sm font-semibold text-text-muted no-underline hover:underline"
          >
            Reclamar este local
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-container flex flex-col gap-8 py-8">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
          Panel del dueño
        </p>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">
          {restaurantName}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {restaurantLocation}
        </p>
        {isAdminViewer && (
          <p className="mt-2 inline-flex items-center gap-2 self-start rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Estás viendo este panel como admin (soporte). Las acciones quedan
            registradas a tu cuenta.
          </p>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium">Fotos oficiales</h2>
          <span className="font-sans text-xs text-text-muted">
            {photos.length} / {PHOTO_CAP}
          </span>
        </div>
        <p className="font-sans text-sm text-text-secondary">
          Estas fotos tienen prioridad sobre las que vienen de Google y se
          muestran arriba en la página del restaurante.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100"
            >
              <Image
                src={photo.url}
                alt={photo.alt_text ?? 'Foto oficial'}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => void handleDeletePhoto(photo.id)}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
              >
                Eliminar
              </button>
            </div>
          ))}
          {photos.length < PHOTO_CAP && (
            <label
              className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border-default bg-surface-subtle text-center font-sans text-xs text-text-muted hover:bg-surface-card ${
                photoBusy ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={photoBusy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
              <span className="text-2xl" aria-hidden>+</span>
              <span>{photoBusy ? 'Subiendo…' : 'Subir foto'}</span>
            </label>
          )}
        </div>

        {photoError && (
          <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
            {photoError}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium">Reseñas</h2>
          {reviews.length > 0 && (
            <span className="font-sans text-xs text-text-muted">
              {pendingCount} sin responder · {reviews.length} en total
            </span>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-default p-6 text-center font-sans text-sm text-text-muted">
            Todavía no hay reseñas para este restaurante.
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-2 p-0">
            {reviews.map((review) => (
              <li key={review.id}>
                <Link
                  href={`/reviews/${review.id}`}
                  className="flex flex-col gap-1 rounded-2xl border border-border-default bg-surface-card p-4 no-underline transition hover:border-[var(--color-canela)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-base text-text-primary">
                      {review.dish_name}
                      <span className="ml-2 font-sans text-sm text-text-muted">
                        ★ {review.rating.toFixed(1)}
                      </span>
                    </span>
                    {review.has_owner_response ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Respondida
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Sin responder
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 font-sans text-sm text-text-secondary">
                    {review.note}
                  </p>
                  <p className="font-sans text-xs text-text-muted">
                    {review.is_anonymous
                      ? 'Anónimo'
                      : review.user_handle
                        ? `@${review.user_handle}`
                        : review.user_display_name}{' '}
                    · {new Date(review.date_tasted).toLocaleDateString('es-AR')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--color-crema-darker)] bg-surface-subtle p-4">
        <h2 className="font-display text-lg">Aplicar más cambios al perfil</h2>
        <p className="font-sans text-sm text-text-muted">
          Por ahora desde el panel solo gestionás fotos y respuestas. Si querés
          actualizar la URL de reservas o avisar de un error en los datos del
          local, escribinos a soporte y te ayudamos.
        </p>
      </section>

      <footer>
        <Link
          href={`/restaurants/${restaurantSlug}`}
          className="font-sans text-sm text-[var(--color-canela)] no-underline hover:underline"
        >
          ← Volver al perfil público
        </Link>
      </footer>
    </div>
  );
}
