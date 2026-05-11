'use client';

import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import { useUserLocation } from '@/app/lib/hooks/useUserLocation';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { useToast } from '@/app/components/ui/Toast';
import NearYouRail from './NearYouRail';
import BestExecutionRail from './BestExecutionRail';
import DishDuelRail from './DishDuelRail';
import PeopleYouMayKnowRail from './PeopleYouMayKnowRail';
import TrendingRail from './TrendingRail';

export default function DiscoveryRails() {
  const { user } = useAuthContext();
  const { location, status, request } = useUserLocation();
  const toast = useToast();
  const t = useTranslations('discovery.geoCta');

  const enableWishlist = Boolean(user);
  const lat = location?.latitude;
  const lng = location?.longitude;

  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== 'granted' && status === 'granted') {
      toast.success(t('toastTitle'), t('toastBody'));
    }
    prevStatusRef.current = status;
  }, [status, toast, t]);

  return (
    <div className="flex flex-col gap-8">
      {status !== 'granted' && status !== 'checking' && (
        <GeoCTA status={status} onRequest={request} />
      )}

      {/* Bloque "descubrir" agrupado para el tour: el step `discovery_geo`
          hace spotlight sobre estos tres rails de descubrimiento juntos. */}
      <div data-tour-id="discovery_geo" className="flex flex-col gap-8">
        {status === 'granted' && lat !== undefined && lng !== undefined && (
          <NearYouRail
            lat={lat}
            lng={lng}
            radiusKm={15}
            enableWishlist={enableWishlist}
          />
        )}

        <BestExecutionRail
          lat={lat}
          lng={lng}
          radiusKm={lat !== undefined ? 5 : undefined}
          enableWishlist={enableWishlist}
        />

        <TrendingRail />
      </div>

      {/* Duelo: rail EDITORIAL, no geográfico. Los contendientes vienen del
          país entero — si filtráramos por radio del usuario, casi nunca habría
          2 restaurantes con la misma familia dentro de 5 km y el carrusel
          mostraría puros empty states. */}
      <DishDuelRail enableWishlist={enableWishlist} />

      {/* Personas para vos — solo con sesión: sin viewer no hay FoF ni
          historial de reseñas para construir candidatos. Si el endpoint
          devuelve cero, el componente no renderiza nada. */}
      {user && <PeopleYouMayKnowRail />}
    </div>
  );
}

interface GeoCTAProps {
  status: ReturnType<typeof useUserLocation>['status'];
  onRequest: () => void;
}

function GeoCTA({ status, onRequest }: GeoCTAProps) {
  const t = useTranslations('discovery.geoCta');
  if (status === 'unsupported') {
    return null;
  }

  const headline =
    status === 'denied' ? t('headlineDenied') : t('headlineRequest');

  const body =
    status === 'denied' ? t('bodyDenied') : t('bodyRequest');

  return (
    <section className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--color-terracota-pale)] bg-[var(--color-crema)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <FontAwesomeIcon
          icon={faLocationCrosshairs}
          className="mt-1 h-5 w-5 text-[var(--color-terracota)]"
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
          {t('activate')}
        </Button>
      )}
    </section>
  );
}
