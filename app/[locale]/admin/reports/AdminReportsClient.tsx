'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@/app/lib/i18n/navigation';
import { useRouter } from '@/app/lib/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faXmark,
  faTriangleExclamation,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/app/components/ui/Button';
import Skeleton from '@/app/components/ui/Skeleton';
import EmptyState from '@/app/components/ui/EmptyState';
import Tabs from '@/app/components/ui/Tabs';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import {
  listReports,
  updateReportStatus,
  type AdminReportItem,
  type ReportStatus,
} from '@/app/lib/api/reports';
import { formatRelativeTime } from '@/app/lib/utils/time';
import { cn } from '@/app/lib/utils/cn';

type TabState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: AdminReportItem[] };

export default function AdminReportsClient() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const t = useTranslations('admin.reports');

  const TABS: { value: ReportStatus; label: string }[] = useMemo(() => [
    { value: 'pending', label: t('tabPending') },
    { value: 'reviewed', label: t('tabReviewed') },
    { value: 'dismissed', label: t('tabDismissed') },
  ], [t]);

  const [activeTab, setActiveTab] = useState<ReportStatus>('pending');
  const [tabState, setTabState] = useState<TabState>({ status: 'loading' });
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (status: ReportStatus) => {
    setTabState({ status: 'loading' });
    try {
      const page = await listReports(status);
      setTabState({ status: 'ready', items: page.items });
    } catch {
      setTabState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      void load(activeTab);
    }
  }, [authLoading, user, activeTab, load]);

  const handleAction = useCallback(
    async (report: AdminReportItem, next: ReportStatus) => {
      setBusyId(report.id);
      try {
        await updateReportStatus(report.id, next);
        setTabState((prev) =>
          prev.status === 'ready'
            ? { ...prev, items: prev.items.filter((r) => r.id !== report.id) }
            : prev,
        );
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[50vh] items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="cc-container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
        <FontAwesomeIcon icon={faShieldHalved} className="h-8 w-8 text-text-muted" aria-hidden />
        <h1 className="font-display text-3xl font-medium text-text-primary">
          {t('accessRestricted')}
        </h1>
        <p className="max-w-md font-sans text-sm text-text-muted">
          {t('modOnly')}
        </p>
        <Button variant="primary" size="md" onClick={() => router.push('/')}>
          {t('backToFeed')}
        </Button>
      </div>
    );
  }

  const emptyTitle =
    activeTab === 'pending'
      ? t('emptyPending')
      : activeTab === 'reviewed'
        ? t('emptyReviewed')
        : t('emptyDismissed');

  return (
    <div className="cc-container flex flex-col gap-5 py-6">
      <header className="flex items-center gap-3">
        <FontAwesomeIcon icon={faShieldHalved} className="h-6 w-6 text-action-primary" aria-hidden />
        <div>
          <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
            {t('title')}
          </h1>
          <p className="font-sans text-sm text-text-muted">
            {t('subtitle')}
          </p>
        </div>
      </header>

      <Tabs
        ariaLabel={t('tabsAria')}
        value={activeTab}
        items={TABS}
        onChange={(v) => setActiveTab(v as ReportStatus)}
      />

      {tabState.status === 'loading' && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} shape="box" width="100%" height={110} />
          ))}
        </div>
      )}

      {tabState.status === 'error' && (
        <div className="rounded-2xl border border-border-default bg-surface-card p-6 text-center">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mb-2 h-5 w-5 text-action-danger" aria-hidden />
          <p className="mb-3 font-sans text-sm text-text-secondary">
            {t('loadError')}
          </p>
          <Button variant="outline" size="sm" onClick={() => void load(activeTab)}>
            {t('retry')}
          </Button>
        </div>
      )}

      {tabState.status === 'ready' && tabState.items.length === 0 && (
        <EmptyState
          title={emptyTitle}
          description={t('emptyDescription')}
        />
      )}

      {tabState.status === 'ready' && tabState.items.length > 0 && (
        <ul className="flex list-none flex-col gap-3 p-0">
          {tabState.items.map((report) => (
            <li key={report.id}>
              <ReportRow
                report={report}
                busy={busyId === report.id}
                activeTab={activeTab}
                onAction={handleAction}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReportRow({
  report,
  busy,
  activeTab,
  onAction,
}: {
  report: AdminReportItem;
  busy: boolean;
  activeTab: ReportStatus;
  onAction: (r: AdminReportItem, next: ReportStatus) => void;
}) {
  const t = useTranslations('admin.reports');
  const locale = useLocale();
  const reporter =
    report.reporter.displayName ??
    (report.reporter.handle ? `@${report.reporter.handle}` : t('anonReporter'));

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
            {report.entityType} · <time dateTime={report.createdAt}>{formatRelativeTime(report.createdAt, locale)}</time>
          </p>
          <p className="mt-1 font-sans text-sm text-text-primary">
            {t.rich('reportedBy', {
              reporter: () => <span className="font-medium">{reporter}</span>,
            })}
          </p>
          <blockquote className="mt-1 whitespace-pre-wrap rounded-md border-l-2 border-border-strong bg-surface-subtle px-3 py-2 font-sans text-sm text-text-secondary">
            {report.reason}
          </blockquote>
        </div>
        <TargetLink target={report.target} />
      </div>

      {activeTab === 'pending' && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onAction(report, 'dismissed')}
            leftIcon={<FontAwesomeIcon icon={faXmark} className="h-3 w-3" />}
          >
            {t('dismiss')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={busy}
            loading={busy}
            onClick={() => onAction(report, 'reviewed')}
            leftIcon={<FontAwesomeIcon icon={faCheck} className="h-3 w-3" />}
          >
            {t('markReviewed')}
          </Button>
        </div>
      )}

      {activeTab !== 'pending' && (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => onAction(report, 'pending')}
          >
            {t('reopen')}
          </Button>
        </div>
      )}
    </article>
  );
}

function TargetLink({ target }: { target: AdminReportItem['target'] }) {
  const t = useTranslations('admin.reports');
  if (target.deleted) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-surface-subtle px-3 py-1 font-sans text-xs text-text-muted',
        )}
      >
        {t('deletedTarget')}
      </span>
    );
  }

  const href =
    target.kind === 'review'
      ? `/reviews/${target.id}`
      : target.kind === 'user'
        ? `/u/${target.id}`
        : target.kind === 'comment' && target.parentId
          ? `/reviews/${target.parentId}#comments`
          : null;

  const label = target.preview ?? `${target.kind} ${target.id.slice(0, 8)}`;

  if (href) {
    return (
      <Link
        href={href}
        className="max-w-xs shrink-0 truncate rounded-full bg-surface-subtle px-3 py-1 font-sans text-xs text-action-primary hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
      >
        {label}
      </Link>
    );
  }

  return (
    <span className="max-w-xs shrink-0 truncate rounded-full bg-surface-subtle px-3 py-1 font-sans text-xs text-text-muted">
      {label}
    </span>
  );
}
