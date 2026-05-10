import { useTranslations } from 'next-intl';

interface EditorialSummaryCardProps {
  summary: string | null;
  lang: string | null;
}

export default function EditorialSummaryCard({ summary, lang }: EditorialSummaryCardProps) {
  const t = useTranslations('restaurant.editorial');
  if (!summary) return null;

  return (
    <section
      lang={lang ?? undefined}
      className="rounded-3xl border border-[var(--color-crema-darker)] bg-[var(--color-crema)] p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="mt-1 hidden h-10 w-1 rounded-full bg-[var(--color-terracota)] sm:block"
        />
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl italic leading-relaxed text-[var(--color-espresso-mid)] sm:text-2xl">
            “{summary}”
          </p>
          <p className="mt-3 text-xs uppercase tracking-wide text-[var(--color-espresso-soft)]">
            {t('footer')}
          </p>
        </div>
      </div>
    </section>
  );
}
