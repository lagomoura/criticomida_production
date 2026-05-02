import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/app/lib/i18n/navigation';
import Button from '@/app/components/ui/Button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.about' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function AboutPage() {
  const t = useTranslations('about');
  const tPillars = useTranslations('about.pillars');
  return (
    <main id="main-content" className="bg-surface-page">
      <article className="cc-container relative max-w-3xl py-12 md:py-20">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-12 h-72 w-72 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, var(--color-azafran-light), transparent 70%)',
          }}
        />

        <header className="relative">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-action-primary">
            {t('kicker')}
          </p>
          <h1 className="mt-4 m-0 font-display text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[0.98] text-text-primary">
            {t('headlineLead')} <em className="not-italic text-action-primary">{t('headlineHighlight')}</em>{t('headlineComma')}
            <br />
            {t('headlineRest')}
          </h1>
          <p className="mt-6 max-w-xl font-display italic text-xl leading-relaxed text-text-secondary md:text-2xl">
            {t('tagline')}
          </p>
        </header>

        <section className="relative mt-14 grid gap-10 md:grid-cols-[auto_1fr] md:gap-x-12">
          <Pillar n="01" />
          <Stanza heading={tPillars('dishHeading')} body={tPillars('dishBody')} />

          <Pillar n="02" />
          <Stanza heading={tPillars('reviewHeading')} body={tPillars('reviewBody')} />

          <Pillar n="03" />
          <Stanza heading={tPillars('communityHeading')} body={tPillars('communityBody')} />
        </section>

        <section className="relative mt-16 rounded-3xl border-l-[3px] border-y border-r border-l-action-primary border-y-border-default border-r-border-default bg-surface-card p-6 sm:p-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-action-primary">
            {t('ruleKicker')}
          </p>
          <blockquote className="mt-3 m-0 font-display italic text-xl leading-relaxed text-text-primary sm:text-2xl">
            {t('ruleQuote')}
          </blockquote>
          <p className="mt-4 font-sans text-sm text-text-muted">
            {t('ruleBody')}
          </p>
        </section>

        <footer className="relative mt-16 flex flex-col gap-4 border-t border-border-subtle pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 font-display italic text-lg text-text-secondary">
            {t('ctaPrompt')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/registro" className="no-underline">
              <Button variant="primary" size="md">
                {t('ctaPrimary')}
              </Button>
            </Link>
            <Link href="/" className="no-underline">
              <Button variant="ghost" size="md">
                {t('ctaSecondary')}
              </Button>
            </Link>
          </div>
        </footer>

        <p className="relative mt-10 font-sans text-xs text-text-muted">
          {t('footerCredit', { year: new Date().getFullYear() })}
        </p>
      </article>
    </main>
  );
}

function Pillar({ n }: { n: string }) {
  return (
    <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1 md:pt-2">
      <span className="font-display text-3xl font-medium leading-none text-action-primary tabular-nums">
        {n}
      </span>
      <span aria-hidden className="hidden h-px w-10 bg-border-default md:block" />
    </div>
  );
}

function Stanza({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h2 className="m-0 font-display text-2xl font-medium text-text-primary sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-3 max-w-prose font-sans text-base leading-relaxed text-text-secondary">
        {body}
      </p>
    </div>
  );
}
