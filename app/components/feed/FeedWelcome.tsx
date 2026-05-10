'use client';

import { Link } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import Button from '@/app/components/ui/Button';

export default function FeedWelcome() {
  const { user, isLoading } = useAuthContext();
  const t = useTranslations('feed.welcome');
  const tAuth = useTranslations('auth');
  if (isLoading) return null;

  const firstName = user?.display_name?.trim().split(/\s+/)[0] ?? '';
  const titleHtml = (t.raw('title') as string).replace(
    /<em>(.*?)<\/em>/,
    '<em class="not-italic text-action-primary">$1</em>',
  );

  return (
    <section
      aria-labelledby="feed-welcome-title"
      className="relative overflow-hidden rounded-3xl border border-border-default bg-surface-card"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, var(--color-terracota-light), transparent 70%)',
        }}
      />
      <div className="relative grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:items-center md:p-10">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-action-primary">
            {t('kicker')}
          </p>
          <h2
            id="feed-welcome-title"
            className="mt-3 m-0 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.05] text-text-primary"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
          {user ? (
            <p className="mt-3 max-w-prose font-sans text-sm text-text-secondary md:text-base">
              {t('greetingPrefix')}
              <span className="font-semibold text-text-primary">{firstName}</span>
              {t('greetingSuffix')}
            </p>
          ) : (
            <>
              <p className="mt-3 max-w-prose font-sans text-sm text-text-secondary md:text-base">
                {t('anonymousIntro')}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/registro" className="no-underline sm:flex-none">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    leftIcon={<FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />}
                  >
                    {tAuth('createAccount')}
                  </Button>
                </Link>
                <Link href="/login" className="no-underline sm:flex-none">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                    leftIcon={<FontAwesomeIcon icon={faRightToBracket} className="h-4 w-4" />}
                  >
                    {tAuth('signIn')}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        <ul
          aria-label={t('tipsLabel')}
          className="flex flex-col gap-2.5 border-t border-border-subtle pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0"
        >
          <Tip kicker="01" text={t('tip1')} />
          <Tip kicker="02" text={t('tip2')} />
          <Tip kicker="03" text={t('tip3')} />
        </ul>
      </div>
    </section>
  );
}

function Tip({ kicker, text }: { kicker: string; text: string }) {
  return (
    <li className="flex items-baseline gap-2.5 font-sans text-xs text-text-muted">
      <span
        aria-hidden
        className="shrink-0 font-sans text-[0.65rem] font-semibold tabular-nums text-text-muted opacity-60"
      >
        {kicker}
      </span>
      <span className="leading-relaxed">{text}</span>
    </li>
  );
}
