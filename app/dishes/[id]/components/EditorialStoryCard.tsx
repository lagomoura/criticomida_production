interface EditorialStoryCardProps {
  blurb: string;
  source?: string | null;
  dishName: string;
  restaurantName: string;
}

const SOURCE_LABEL: Record<string, string> = {
  claude: 'Resumen editorial generado con Claude',
  google: 'Resumen editorial vía Google',
  manual: 'Resumen editorial de CritiComida',
};

export default function EditorialStoryCard({
  blurb,
  source,
  dishName,
  restaurantName,
}: EditorialStoryCardProps) {
  if (!blurb) return null;
  const attribution = source ? SOURCE_LABEL[source] ?? 'Resumen editorial' : 'Resumen editorial';
  return (
    <section
      aria-label={`Historia de ${dishName} en ${restaurantName}`}
      className="relative overflow-hidden rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] p-6 sm:p-8"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-[var(--color-azafran)]"
      />
      <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.2em] text-[var(--color-canela)]">
        La historia de este plato
      </p>
      <blockquote className="mt-3 font-[family-name:var(--font-display)] text-xl italic leading-relaxed text-[var(--color-carbon)] sm:text-2xl">
        “{blurb}”
      </blockquote>
      <p className="mt-3 text-xs text-[var(--color-carbon-soft)]">{attribution}</p>
    </section>
  );
}
