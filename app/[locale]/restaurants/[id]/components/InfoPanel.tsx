import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faGlobe, faMap } from '@fortawesome/free-solid-svg-icons';
import { RestaurantDetail } from '@/app/lib/types';
import OpenStatus from './OpenStatus';

interface InfoPanelProps {
  restaurant: RestaurantDetail;
}

const DAY_INDEX_BY_KEY: Record<string, number> = {
  domingo: 0, sunday: 0, domingo_pt: 0,
  lunes: 1, monday: 1, 'segunda-feira': 1,
  martes: 2, tuesday: 2, 'terça-feira': 2, 'terca-feira': 2,
  'miércoles': 3, miercoles: 3, wednesday: 3, 'quarta-feira': 3,
  jueves: 4, thursday: 4, 'quinta-feira': 4,
  viernes: 5, friday: 5, 'sexta-feira': 5,
  'sábado': 6, sabado: 6, saturday: 6,
};

function todayDayIndex(): number {
  return new Date().getDay();
}

function isLineForToday(line: string, today: number): boolean {
  const idx = line.indexOf(':');
  if (idx === -1) return false;
  const word = line.slice(0, idx).trim().toLowerCase();
  return DAY_INDEX_BY_KEY[word] === today;
}

export default function InfoPanel({ restaurant }: InfoPanelProps) {
  const t = useTranslations('restaurant.info');
  const today = todayDayIndex();
  const hours = restaurant.opening_hours;

  return (
    <section className="grid gap-6 rounded-3xl border border-border-default bg-surface-card p-6 shadow-sm sm:p-8 md:grid-cols-2">
      <div>
        <header className="mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)] sm:text-3xl">
            {t('title')}
          </h2>
        </header>
        <dl className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            <div>
              <dt className="font-semibold text-[var(--color-carbon)]">{t('address')}</dt>
              <dd className="text-[var(--color-carbon-mid)]">{restaurant.location_name}</dd>
            </div>
          </div>
          {restaurant.phone_number && (
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faPhone} className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
              <div>
                <dt className="font-semibold text-[var(--color-carbon)]">{t('phone')}</dt>
                <dd>
                  <a
                    href={`tel:${restaurant.phone_number}`}
                    className="text-[var(--color-azafran)] no-underline hover:underline"
                  >
                    {restaurant.phone_number}
                  </a>
                </dd>
              </div>
            </div>
          )}
          {restaurant.website && (
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faGlobe} className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
              <div>
                <dt className="font-semibold text-[var(--color-carbon)]">{t('website')}</dt>
                <dd>
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-[var(--color-azafran)] no-underline hover:underline"
                  >
                    {restaurant.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </dd>
              </div>
            </div>
          )}
          {restaurant.google_maps_url && (
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faMap} className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
              <div>
                <dt className="font-semibold text-[var(--color-carbon)]">{t('googleMaps')}</dt>
                <dd>
                  <a
                    href={restaurant.google_maps_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[var(--color-azafran)] no-underline hover:underline"
                  >
                    {t('directions')}
                  </a>
                </dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      <div>
        <header className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-medium text-[var(--color-carbon)]">
            {t('hours')}
          </h3>
          <OpenStatus openingHours={hours} variant="inline" />
        </header>
        {hours && hours.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {hours.map((line, i) => {
              const isToday = isLineForToday(line, today);
              const colonIdx = line.indexOf(':');
              const day = colonIdx >= 0 ? line.slice(0, colonIdx) : line;
              const rest = colonIdx >= 0 ? line.slice(colonIdx + 1).trim() : '';
              return (
                <li
                  key={i}
                  className={`flex justify-between gap-3 rounded-lg px-3 py-1.5 ${
                    isToday
                      ? 'bg-[var(--color-azafran-pale)] font-semibold text-[var(--color-canela)]'
                      : 'text-[var(--color-carbon-mid)]'
                  }`}
                >
                  <span className="capitalize">{day}</span>
                  <span>{rest}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm italic text-[var(--color-carbon-soft)]">
            {t('noHours')}
          </p>
        )}
      </div>
    </section>
  );
}
