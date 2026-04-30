'use client';

import { useState } from 'react';
import { resendVerificationEmail } from '@/app/lib/api/auth';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

/** Banner amarillo no bloqueante: aparece cuando el user logueado todavía
 *  no confirmó el link enviado al correo. Solo se monta si user existe y
 *  email_verified === false (cuando el backend no envía el flag, asumimos
 *  verified para no spamear con falsos positivos). */
export default function EmailVerificationBanner() {
  const { user, isLoading } = useAuthContext();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !user) return null;
  // Treat undefined as verified (legacy responses sin el campo) — mejor un
  // falso negativo que un banner perpetuo en cuentas viejas.
  if (user.email_verified !== false) return null;
  if (dismissed) return null;

  async function handleResend() {
    setState('sending');
    try {
      await resendVerificationEmail();
      setState('sent');
    } catch {
      setState('error');
    }
  }

  return (
    <div
      role="status"
      className="w-full bg-amber-100 px-4 py-2 text-center font-sans text-sm text-amber-900"
    >
      <span className="mr-2">
        Confirmá tu email <strong>{user.email}</strong> para tener acceso
        completo.
      </span>
      {state === 'sent' ? (
        <span className="text-emerald-700">Te lo reenviamos.</span>
      ) : state === 'error' ? (
        <span className="text-red-700">No se pudo reenviar.</span>
      ) : (
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={state === 'sending'}
          className="font-semibold underline hover:no-underline disabled:opacity-60"
        >
          {state === 'sending' ? 'Enviando…' : 'Reenviar'}
        </button>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar"
        className="ml-3 text-amber-700/70 hover:text-amber-900"
      >
        ✕
      </button>
    </div>
  );
}
