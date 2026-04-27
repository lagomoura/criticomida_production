import { RestaurantDetail } from '@/app/lib/types';
import OpenStatus from './OpenStatus';

interface InfoPanelProps {
  restaurant: RestaurantDetail;
}

const DAY_INDEX_BY_KEY: Record<string, number> = {
  domingo: 0, sunday: 0,
  lunes: 1, monday: 1,
  martes: 2, tuesday: 2,
  'miércoles': 3, miercoles: 3, wednesday: 3,
  jueves: 4, thursday: 4,
  viernes: 5, friday: 5,
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
  const today = todayDayIndex();
  const hours = restaurant.opening_hours;

  return (
    <section className="grid gap-6 rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 shadow-sm sm:p-8 md:grid-cols-2">
      <div>
        <header className="mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)] sm:text-3xl">
            Información
          </h2>
        </header>
        <dl className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span aria-hidden className="mt-0.5">📍</span>
            <div>
              <dt className="font-semibold text-[var(--color-carbon)]">Dirección</dt>
              <dd className="text-[var(--color-carbon-mid)]">{restaurant.location_name}</dd>
            </div>
          </div>
          {restaurant.phone_number && (
            <div className="flex items-start gap-3">
              <span aria-hidden className="mt-0.5">📞</span>
              <div>
                <dt className="font-semibold text-[var(--color-carbon)]">Teléfono</dt>
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
              <span aria-hidden className="mt-0.5">🌐</span>
              <div>
                <dt className="font-semibold text-[var(--color-carbon)]">Web</dt>
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
              <span aria-hidden className="mt-0.5">🗺️</span>
              <div>
                <dt className="font-semibold text-[var(--color-carbon)]">Google Maps</dt>
                <dd>
                  <a
                    href={restaurant.google_maps_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[var(--color-azafran)] no-underline hover:underline"
                  >
                    Cómo llegar
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
            Horarios
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
            Horarios no disponibles.
          </p>
        )}
      </div>
    </section>
  );
}
