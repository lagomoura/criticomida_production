import { useTranslations } from 'next-intl';

interface DishDescriptionCardProps {
  description: string;
}

export default function DishDescriptionCard({ description }: DishDescriptionCardProps) {
  const t = useTranslations('dish.description');
  if (!description.trim()) return null;
  return (
    <section className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-surface-card)] p-6 sm:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.2em] text-[var(--color-terracota-deep)]">
        {t('title')}
      </h2>
      <p className="mt-3 font-[family-name:var(--font-display)] text-lg leading-relaxed text-[var(--color-espresso)] sm:text-xl">
        {description}
      </p>
    </section>
  );
}
