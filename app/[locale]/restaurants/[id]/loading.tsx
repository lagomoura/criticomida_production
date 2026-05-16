export default function Loading() {
  return (
    <main id="main-content" className="cc-container px-4 pb-16 sm:px-6 lg:px-8">
      {/* Hero skeleton — matches HeroV2 (rounded card) */}
      <section className="mb-10">
        <div className="relative h-[28rem] w-full overflow-hidden rounded-3xl border border-border-default motion-safe:animate-pulse bg-[var(--color-crema-dark)] sm:h-[32rem] md:h-[34rem]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-espresso)]/20" />
          {/* Simulated breadcrumb + verified badge */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
            <div className="h-4 w-32 rounded-full bg-white/20" />
            <div className="h-6 w-24 rounded-full bg-white/20" />
          </div>
          {/* Simulated frosted info card */}
          <div className="absolute inset-x-0 bottom-0 px-3 pb-3 sm:px-5 sm:pb-5">
            <div className="rounded-2xl bg-white/10 px-5 py-5 sm:px-7 sm:py-6">
              <div className="h-3 w-24 rounded-full bg-white/15" />
              <div className="mt-3 h-10 w-2/3 rounded-lg bg-white/20 sm:w-1/2" />
              <div className="mt-3 h-4 w-48 rounded-full bg-white/15" />
              <div className="my-5 h-px w-full bg-white/15" />
              <div className="flex gap-3">
                <div className="h-4 w-28 rounded-full bg-white/15" />
                <div className="h-4 w-20 rounded-full bg-white/15" />
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-6 w-14 rounded-full bg-white/15" />
                <div className="h-6 w-20 rounded-full bg-white/15" />
              </div>
            </div>
          </div>
        </div>
        {/* Actions bar skeleton */}
        <div className="relative mt-4 mb-2">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] px-3 py-2 shadow-sm motion-safe:animate-pulse">
            <div className="h-9 w-28 rounded-full bg-[var(--color-crema-dark)]" />
            <div className="h-9 w-24 rounded-full bg-[var(--color-crema-dark)]" />
            <div className="h-9 w-20 rounded-full bg-[var(--color-crema-dark)]" />
            <div className="h-9 w-20 rounded-full bg-[var(--color-crema-dark)]" />
          </div>
        </div>
      </section>

      {/* Tabs skeleton */}
      <div className="sticky top-14 z-20 -mx-4 mb-6 border-y border-[var(--color-crema-darker)] bg-[var(--color-crema)]/95 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-2 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 motion-safe:animate-pulse rounded-full bg-[var(--color-crema-dark)]"
            />
          ))}
        </div>
      </div>

      {/* Content cards skeleton — matches editorial summary + ratings + diary structure */}
      <div className="space-y-8">
        {/* Editorial summary */}
        <div className="h-32 motion-safe:animate-pulse rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)]" />
        {/* Dish checklist header + 3 items */}
        <div className="space-y-3">
          <div className="h-7 w-48 motion-safe:animate-pulse rounded-lg bg-[var(--color-crema-dark)]" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 overflow-hidden rounded-xl border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] p-3 motion-safe:animate-pulse sm:p-4"
            >
              <div className="h-16 w-16 shrink-0 rounded-lg bg-[var(--color-crema-dark)] sm:h-20 sm:w-20" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/5 rounded bg-[var(--color-crema-dark)]" />
                <div className="h-3 w-2/5 rounded bg-[var(--color-crema-darker)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
