'use client';

import { Link } from '@/app/lib/i18n/navigation';
import { useRouter } from '@/app/lib/i18n/navigation';
import { use, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import AuthForm from '@/app/components/nav/AuthForm';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

export default function RegistroClient({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ next?: string }>;
}) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('auth.registerPage');
  const params = use(searchParamsPromise);
  const next = params.next && params.next.startsWith('/') ? params.next : '/';

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(next);
    }
  }, [user, isLoading, router, next]);

  const titleHtml = t.raw('title') as string;

  return (
    <main id="main-content" className="min-h-[calc(100vh-4rem)] bg-surface-page">
      <div className="cc-container grid gap-10 py-10 md:grid-cols-2 md:py-16 lg:gap-16">
        <section className="flex flex-col justify-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-action-primary">
            {t('kicker')}
          </p>
          <h1
            className="mt-3 m-0 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.05] text-text-primary"
            dangerouslySetInnerHTML={{
              __html: titleHtml.replace(
                /<em>(.*?)<\/em>/,
                '<em class="not-italic text-action-primary">$1</em>',
              ),
            }}
          />
          <p className="mt-4 max-w-md font-sans text-base text-text-secondary">
            {t('subtitle')}
          </p>
          <ul className="mt-6 flex flex-col gap-2 font-sans text-sm text-text-secondary">
            <li className="flex items-baseline gap-2">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-action-primary" />
              {t('bullet1')}
            </li>
            <li className="flex items-baseline gap-2">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-action-primary" />
              {t('bullet2')}
            </li>
            <li className="flex items-baseline gap-2">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-action-primary" />
              {t('bullet3')}
            </li>
          </ul>
          <p className="mt-8 font-sans text-sm text-text-muted">
            {t('haveAccount')}{' '}
            <Link
              href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="font-medium text-action-primary hover:underline"
            >
              {t('login')}
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
