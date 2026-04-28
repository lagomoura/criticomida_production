'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import AuthForm from '@/app/components/nav/AuthForm';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

export default function LoginClient({
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
            Bienvenido de nuevo
          </p>
          <h1 className="mt-3 m-0 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.05] text-text-primary">
            Tu cuenta, <em className="not-italic text-action-primary">tu plato</em>.
          </h1>
          <p className="mt-4 max-w-md font-sans text-base text-text-secondary">
            Iniciá sesión para volver a reseñar, guardar lo que querés probar y
            seguir el rastro de críticos que ya conocés.
          </p>
          <p className="mt-6 font-sans text-sm text-text-muted">
            ¿Todavía no tenés cuenta?{' '}
            <Link
              href={`/registro${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="font-medium text-action-primary hover:underline"
            >
              Registrate
            </Link>
            .
          </p>
        </section>

        <section className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-[var(--shadow-base)] md:p-8">
          <AuthForm
            initialTab="login"
            showTabs
            onSuccess={() => router.replace(next)}
          />
        </section>
      </div>
    </main>
  );
}
