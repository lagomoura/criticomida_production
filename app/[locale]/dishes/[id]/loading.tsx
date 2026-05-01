export default function Loading() {
  return (
    <main id="main-content" className="cc-container px-4 pb-16 sm:px-6 lg:px-8">
      <section className="-mx-4 mb-8 sm:-mx-6 lg:-mx-8">
        <div className="relative h-72 w-full animate-pulse bg-[var(--color-crema-dark)] sm:h-[22rem] md:h-[26rem]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-carbon)]/20" />
        </div>
      </section>

      <div className="sticky top-14 z-20 -mx-4 mb-6 border-y border-[var(--color-crema-darker)] bg-[var(--color-crema)]/95 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-2 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-full bg-[var(--color-crema-dark)]"
            />
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)]"
          />
        ))}
      </div>
    </main>
  );
}
