import Link from 'next/link';

interface ClaimPromptFooterProps {
  restaurantSlug: string;
  isClaimed: boolean;
  viewerIsOwner?: boolean;
}

export default function ClaimPromptFooter({
  restaurantSlug,
  isClaimed,
  viewerIsOwner = false,
}: ClaimPromptFooterProps) {
  // El owner verificado ve un acceso al panel.
  if (viewerIsOwner) {
    return (
      <aside
        className="mt-8 flex flex-col items-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center"
        aria-labelledby="owner-panel-title"
      >
        <p
          id="owner-panel-title"
          className="font-sans text-sm text-emerald-800"
        >
          Sos el dueño verificado de este lugar.
        </p>
        <Link
          href={`/restaurants/${restaurantSlug}/owner`}
          className="font-sans text-sm font-semibold text-emerald-700 no-underline hover:underline"
        >
          Ir al panel del restaurante →
        </Link>
      </aside>
    );
  }

  if (isClaimed) {
    // Hay otro owner verificado: no hace falta invitar a reclamar.
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
