import Link from 'next/link';

interface ClaimPromptFooterProps {
  restaurantSlug: string;
  isClaimed: boolean;
}

export default function ClaimPromptFooter({
  restaurantSlug,
  isClaimed,
}: ClaimPromptFooterProps) {
  if (isClaimed) {
    // El owner ya está verificado: no hace falta invitar a reclamar.
    return null;
  }

  return (
    <aside
      className="mt-8 flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[var(--color-crema-darker)] bg-[var(--color-white)] px-4 py-5 text-center"
      aria-labelledby="claim-prompt-title"
    >
      <p
        id="claim-prompt-title"
        className="font-sans text-sm text-text-muted"
      >
        ¿Sos dueño o gerente de este lugar?
      </p>
      <Link
        href={`/restaurants/${restaurantSlug}/claim`}
        className="font-sans text-sm font-semibold text-[var(--color-canela)] no-underline hover:underline"
      >
        Reclamá tu ficha →
      </Link>
    </aside>
  );
}
