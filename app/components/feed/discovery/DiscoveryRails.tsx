'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import Button from '@/app/components/ui/Button';
import { useUserLocation } from '@/app/lib/hooks/useUserLocation';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import NearYouRail from './NearYouRail';
import BestExecutionRail from './BestExecutionRail';
import DishDuelRail from './DishDuelRail';
import TrendingRail from './TrendingRail';

/**
 * 'Para ti' del feed: rails curados.
 *
 * - Si el usuario activó la geolocalización: NearYou + BestExecution (radio 5km)
 *   + DishDuel (radio 5km) + Trending (ciudad detectada o nacional).
 * - Si no: CTA para activar + BestExecution (sin radio) + DishDuel + Trending.
 *
 * Cada rail decide individualmente si auto-oculta cuando devuelve 0 resultados,
 * así que en condiciones de pocos datos el feed colapsa de forma natural.
 */
export default function DiscoveryRails() {
  const { user } = useAuthContext();
  const { location, status, request } = useUserLocation();

  const enableWishlist = Boolean(user);
  const lat = location?.latitude;
  const lng = location?.longitude;

  return (
    <div className="flex flex-col gap-8">
      {/* Geo gate. No bloqueamos los rails siguientes — el usuario puede
          igualmente consumir BestExecution sin radio + Trending por ciudad.
          Mientras `status === 'checking'` (Permissions API en vuelo) no
          mostramos nada para evitar flash en cada refresh. */}
      {status !== 'granted' && status !== 'checking' && (
        <GeoCTA status={status} onRequest={request} />
      )}

      {status === 'granted' && lat !== undefined && lng !== undefined && (
        <NearYouRail
          lat={lat}
          lng={lng}
          radiusKm={3}
          enableWishlist={enableWishlist}
        />
      )}

      <BestExecutionRail
        lat={lat}
        lng={lng}
        radiusKm={lat !== undefined ? 5 : undefined}
        enableWishlist={enableWishlist}
      />

      <DishDuelRail
        lat={lat}
        lng={lng}
        radiusKm={lat !== undefined ? 5 : undefined}
        enableWishlist={enableWishlist}
      />

      <TrendingRail />
    </div>
  );
}

interface GeoCTAProps {
  status: ReturnType<typeof useUserLocation>['status'];
  onRequest: () => void;
}

function GeoCTA({ status, onRequest }: GeoCTAProps) {
  if (status === 'unsupported') {
    // Sin permiso disponible, no mostramos CTA — el resto del feed funciona.
    return null;
  }

  const headline =
    status === 'denied'
      ? 'Activá tu ubicación desde el navegador'
      : 'Mostrame platos cerca tuyo';

  const body =
    status === 'denied'
      ? 'La rechazaste antes. Tenés que habilitarla manualmente desde la barra del navegador.'
      : 'Para que te recomendemos qué pedir según donde estás, sin enviarla a nadie más.';

  return (
    <section className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--color-azafran-pale)] bg-[var(--color-crema)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <FontAwesomeIcon
          icon={faLocationCrosshairs}
          className="mt-1 h-5 w-5 text-[var(--color-azafran)]"
          aria-hidden
        />
        <div>
          <h3 className="font-display text-base font-semibold text-text-primary">
            {headline}
          </h3>
          <p className="mt-0.5 font-sans text-sm text-text-muted">{body}</p>
        </div>
      </div>
      {status !== 'denied' && (
        <Button
          variant="primary"
          size="sm"
          loading={status === 'requesting'}
          onClick={onRequest}
        >
          Activar ubicación
        </Button>
      )}
    </section>
  );
}
