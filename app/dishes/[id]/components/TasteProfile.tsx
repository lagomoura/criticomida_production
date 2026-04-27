import type { DishAggregates } from '@/app/lib/types/social';

interface TasteProfileProps {
  aggregates: DishAggregates;
}

export default function TasteProfile({ aggregates }: TasteProfileProps) {
  const { tagsTop, prosTop, consTop } = aggregates;
  const hasTags = tagsTop.length > 0;
  const hasPros = prosTop.length > 0;
  const hasCons = consTop.length > 0;
  if (!hasTags && !hasPros && !hasCons) return null;

  const maxTagCount = Math.max(1, ...tagsTop.map((t) => t.count));

  return (
    <section className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 sm:p-8">
      <header className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--color-carbon)]">
          Lo que dicen del plato
        </h2>
        <p className="mt-1 text-sm text-[var(--color-carbon-soft)]">
          Etiquetas y atributos extraídos de las reseñas.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-carbon-soft)]">
            Cómo lo describen
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {hasTags ? (
              tagsTop.slice(0, 12).map((t) => {
                const intensity = 0.4 + (0.6 * t.count) / maxTagCount;
                return (
                  <span
                    key={t.tag}
                    className="rounded-full border border-[var(--color-azafran-pale)] bg-[var(--color-azafran-pale)] px-3 py-1 text-xs font-semibold text-[var(--color-canela)]"
                    style={{ opacity: intensity }}
                  >
                    {t.tag}
                    <span className="ml-1.5 text-[10px] text-[var(--color-canela)]/70">
                      {t.count}
                    </span>
                  </span>
                );
              })
            ) : (
              <p className="rounded-2xl border border-dashed border-[var(--color-crema-darker)] px-4 py-3 text-xs text-[var(--color-carbon-soft)]">
                Aún no hay etiquetas suficientes.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-albahaca)]">
              ✓ Pros más repetidos
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {hasPros ? (
                prosTop.slice(0, 6).map((p) => (
                  <li
                    key={p.text}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--color-albahaca)]/30 bg-[var(--color-albahaca)]/10 px-3 py-1 text-xs text-[var(--color-albahaca)]"
                  >
                    {p.text}
                    <span className="rounded-full bg-[var(--color-albahaca)]/20 px-1.5 py-0.5 text-[10px] font-semibold">
                      {p.count}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-[var(--color-carbon-soft)]">Sin pros aún.</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-paprika)]">
              ✕ Contras más repetidos
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {hasCons ? (
                consTop.slice(0, 6).map((c) => (
                  <li
                    key={c.text}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--color-paprika)]/30 bg-[var(--color-paprika)]/10 px-3 py-1 text-xs text-[var(--color-paprika)]"
                  >
                    {c.text}
                    <span className="rounded-full bg-[var(--color-paprika)]/20 px-1.5 py-0.5 text-[10px] font-semibold">
                      {c.count}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-[var(--color-carbon-soft)]">Sin contras señalados.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
