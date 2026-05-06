'use client';

import { useRouter, usePathname } from '@/app/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

const TAB_KEYS = ['resumen', 'resenas', 'fotos', 'restaurante', 'tu-historia'] as const;
type DishTabKeyTuple = typeof TAB_KEYS;

export type DishTabKey = DishTabKeyTuple[number];

interface DishTabsProps {
  children: Partial<Record<DishTabKey, ReactNode>>;
  counts?: Partial<Record<DishTabKey, number>>;
}

const VALID_KEYS = new Set<DishTabKey>(TAB_KEYS);
/** Tabs que solo aparecen cuando `counts[key]` está definido — sirven como
 * affordance opt-in para features personalizadas (ej. "Tu historia" solo se
 * muestra a usuarios logueados con visitas previas). */
const CONDITIONAL_KEYS = new Set<DishTabKey>(['tu-historia']);

export default function DishTabs({ children, counts }: DishTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('dish.tabs');
  const queryTab = searchParams.get('tab') as DishTabKey | null;

  const TABS = useMemo(() => {
    const all: { key: DishTabKey; label: string }[] = [
      { key: 'resumen', label: t('summary') },
      { key: 'resenas', label: t('reviews') },
      { key: 'tu-historia', label: t('yourHistory') },
      { key: 'fotos', label: t('photos') },
      { key: 'restaurante', label: t('atRestaurant') },
    ];
    return all.filter(
      (tab) => !CONDITIONAL_KEYS.has(tab.key) || counts?.[tab.key] !== undefined,
    );
  }, [t, counts]);

  const initialTab: DishTabKey =
    queryTab && VALID_KEYS.has(queryTab) ? queryTab : 'resumen';

  const [activeTab, setActiveTab] = useState<DishTabKey>(initialTab);

  useEffect(() => {
    if (queryTab && VALID_KEYS.has(queryTab) && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab, activeTab]);

  const handleSelect = useCallback(
    (next: DishTabKey) => {
      setActiveTab(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === 'resumen') params.delete('tab');
      else params.set('tab', next);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const idx = TABS.findIndex((t) => t.key === activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleSelect(TABS[(idx + 1) % TABS.length].key);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleSelect(TABS[(idx - 1 + TABS.length) % TABS.length].key);
    }
  }

  return (
    <div className="mt-2">
      <div
        className="sticky top-14 z-20 -mx-4 mb-6 border-y border-[var(--color-crema-darker)] bg-[var(--color-crema)]/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        role="tablist"
        aria-label={t('label')}
        onKeyDown={handleKeyDown}
      >
        <nav className="cc-container -mx-4 flex gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            const count = counts?.[tab.key];
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                id={`tab-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleSelect(tab.key)}
                className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'text-[var(--color-azafran)]'
                    : 'text-[var(--color-carbon-soft)] hover:text-[var(--color-carbon)]'
                }`}
              >
                {tab.label}
                {typeof count === 'number' && count > 0 && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? 'bg-[var(--color-azafran-pale)] text-[var(--color-canela)]'
                        : 'bg-[var(--color-crema-dark)] text-[var(--color-carbon-soft)]'
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--color-azafran)]"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        if (!isActive) return null;
        return (
          <div
            key={tab.key}
            role="tabpanel"
            id={`panel-${tab.key}`}
            aria-labelledby={`tab-${tab.key}`}
            className="space-y-8"
          >
            {children[tab.key]}
          </div>
        );
      })}
    </div>
  );
}
