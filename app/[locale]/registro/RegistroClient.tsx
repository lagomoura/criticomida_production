'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import AuthForm from '@/app/components/nav/AuthForm';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

export default function RegistroClient({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ next?: string }>;
}) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const params = use(searchParamsPromise);
  const next = params.next && params.next.startsWith('/') ? params.next : '/';

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(next);
    }
  }, [user, isLoading, router, next]);

  return (
    <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-surface-page">
      <div className="cc-container grid gap-10 py-10 md:grid-cols-2 md:py-16 lg:gap-16">
        <section className="flex flex-col justify-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-action-primary">
            Sumate
          </p>
          <h1 className="mt-3 m-0 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.05] text-text-primary">
            Cada plato, <em className="not-italic text-action-primary">su reseña</em>.
          </h1>
          <p className="mt-4 max-w-md font-sans text-base text-text-secondary">
            CritiComida no es de delivery: es de probar, opinar y descubrir lo
            mejor de la cocina cerca tuyo. Empezá con un plato que te haya
            volado la cabeza.
          </p>
          <ul className="mt-6 flex flex-col gap-2 font-sans text-sm text-text-secondary">
            <li className="flex items-baseline gap-2">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-action-primary" />
              Reseñá platos puntuales, no restaurantes enteros.
            </li>
            <li className="flex items-baseline gap-2">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-action-primary" />
              Guardá lo que querés probar y armá tu lista.
            </li>
            <li className="flex items-baseline gap-2">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-action-primary" />
              Seguí a críticos cuyo paladar coincida con el tuyo.
            </li>
          </ul>
          <p className="mt-8 font-sans text-sm text-text-muted">
            ¿Ya tenés cuenta?{' '}
            <Link
              href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="font-medium text-action-primary hover:underline"
            >
              Iniciá sesión
            </Link>
            .
          </p>
        </section>

        <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-[var(--shadow-base)] md:p-8">
          <AuthForm
            initialTab="register"
            showTabs
            onSuccess={() => router.replace(next)}
          />
        </section>
      </div>
    </main>
  );
}
