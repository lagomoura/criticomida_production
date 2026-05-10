'use client';

import { useEffect } from 'react';
import { useRouter } from '@/app/lib/i18n/navigation';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <main id="main-content" className="cc-container py-16 flex justify-center">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-terracota)] border-t-transparent" />
    </main>
  );
}
