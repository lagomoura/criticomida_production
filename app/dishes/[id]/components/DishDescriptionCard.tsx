interface DishDescriptionCardProps {
  description: string;
}

export default function DishDescriptionCard({ description }: DishDescriptionCardProps) {
  if (!description.trim()) return null;
  return (
    <section className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-white)] p-6 sm:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.2em] text-[var(--color-canela)]">
        Sobre el plato
      </h2>
      <p className="mt-3 font-[family-name:var(--font-display)] text-lg leading-relaxed text-[var(--color-carbon)] sm:text-xl">
        {description}
      </p>
    </section>
  );
}
