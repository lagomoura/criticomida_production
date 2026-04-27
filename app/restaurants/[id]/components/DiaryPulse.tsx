import Link from 'next/link';
import Image from 'next/image';
import type { DiaryStats } from '@/app/lib/types/restaurant';

interface DiaryPulseProps {
  stats: DiaryStats;
}

export default function DiaryPulse({ stats }: DiaryPulseProps) {
  const hasActivity = stats.unique_visitors > 0 || stats.most_ordered_dish !== null;

  if (!hasActivity) {
    return (
      <section className="rounded-3xl bg-[var(--color-azafran-pale)] p-6 text-center sm:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)]">
          Sé el primero en visitar
        </h2>
        <p className="mt-2 text-sm text-[var(--color-canela)]">
          Cuando alguien registre su visita en el diario, aparecerá aquí.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-[var(--color-carbon)] p-6 text-white sm:p-8">
      <header className="mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium sm:text-3xl">
          Pulso del lugar
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Quién pasa por aquí y qué pide más.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Visitantes únicos" value={stats.unique_visitors} />
        <Stat label="Visitas totales" value={stats.visits_total} />
        <Stat label="Esta semana" value={stats.visits_last_7d} highlight />
      </div>

      {stats.most_ordered_dish && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 text-sm">
          <span className="text-white/70">Más reseñado:</span>
          <Link
            href={`/dishes/${stats.most_ordered_dish.id}`}
            className="font-semibold text-[var(--color-azafran-light)] no-underline hover:underline"
          >
            {stats.most_ordered_dish.name}
          </Link>
          <span className="text-white/60">
            · {stats.most_ordered_dish.review_count} reseñas
          </span>
        </div>
      )}

      {stats.recent_visitors.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
            Visitantes recientes
          </p>
          <ul className="mt-2 flex flex-wrap items-center gap-2">
            {stats.recent_visitors.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/u/${v.id}`}
                  className="block"
                  title={v.display_name}
                  aria-label={v.display_name}
                >
                  {v.avatar_url ? (
                    <Image
                      src={v.avatar_url}
                      alt={v.display_name}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full border-2 border-[var(--color-carbon)] object-cover ring-1 ring-white/30"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-carbon)] bg-[var(--color-canela)] text-sm font-semibold text-white ring-1 ring-white/30">
                      {v.display_name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-[var(--color-azafran)] text-[var(--color-carbon)]' : 'bg-white/5'}`}>
      <p className={`text-3xl font-semibold ${highlight ? '' : 'text-white'}`}>{value}</p>
      <p className={`mt-1 text-xs uppercase tracking-wide ${highlight ? 'text-[var(--color-carbon)]/70' : 'text-white/60'}`}>
        {label}
      </p>
    </div>
  );
}
