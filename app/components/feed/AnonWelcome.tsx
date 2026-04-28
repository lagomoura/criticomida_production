'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import Button from '@/app/components/ui/Button';

/**
 * Editorial welcome strip shown above the feed for anonymous viewers.
 * Authenticated users see nothing — they get straight feed.
 */
export default function AnonWelcome() {
  const { user, isLoading } = useAuthContext();
  if (isLoading || user) return null;

  return (
    <section
      aria-labelledby="anon-welcome-title"
      className="relative overflow-hidden rounded-3xl border border-border-default bg-surface-card"
    >
      {/* Decorative saffron blob — purely visual */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, var(--color-azafran-light), transparent 70%)',
        }}
      />
      <div className="relative grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:items-center md:p-10">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-action-primary">
            Cada plato, su reseña
          </p>
          <h2
            id="anon-welcome-title"
            className="mt-3 m-0 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.05] text-text-primary"
          >
            Un feed editorial de{' '}
            <em className="not-italic text-action-primary">lo que vale la pena pedir</em>.
          </h2>
          <p className="mt-3 max-w-prose font-sans text-sm text-text-secondary md:text-base">
            CritiComida no opina de restaurantes enteros: opina del plato. Entrá
            o creá cuenta para reseñar lo que probás, guardar lo que querés
            probar y seguir el paladar de gente que conoce.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/registro" className="no-underline">
              <Button
                variant="primary"
                size="md"
                leftIcon={<FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />}
              >
                Crear cuenta
              </Button>
            </Link>
            <Link href="/login" className="no-underline">
              <Button
                variant="ghost"
                size="md"
                leftIcon={<FontAwesomeIcon icon={faRightToBracket} className="h-3.5 w-3.5" />}
              >
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>

        <ul className="flex flex-col gap-3 border-t border-border-subtle pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <Tip kicker="01" text="Reseñá platos puntuales, no restaurantes enteros." />
          <Tip kicker="02" text="Guardá lo que querés probar y armá tu lista." />
          <Tip kicker="03" text="Seguí a quienes coinciden con tu paladar." />
        </ul>
      </div>
    </section>
  );
}

function Tip({ kicker, text }: { kicker: string; text: string }) {
  return (
    <li className="flex items-baseline gap-3 font-sans text-sm text-text-secondary">
      <span className="font-display text-base font-medium text-action-primary tabular-nums">
        {kicker}
      </span>
      <span>{text}</span>
    </li>
  );
}
