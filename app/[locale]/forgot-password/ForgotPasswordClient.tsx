'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import { forgotPassword } from '@/app/lib/api/auth';

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error' };

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState({ kind: 'sending' });
    try {
      await forgotPassword(email.trim());
      setState({ kind: 'sent' });
    } catch {
      setState({ kind: 'error' });
    }
  }

  return (
    <div className="cc-container flex flex-col gap-4 py-12 max-w-md mx-auto">
      <h1 className="font-display text-3xl font-medium">
        Recuperá tu contraseña
      </h1>
      <p className="font-sans text-sm text-text-muted">
        Pegá el email con el que te registraste. Si existe la cuenta, te
        mandamos un link para resetear la contraseña.
      </p>

      {state.kind === 'sent' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-sans text-sm text-emerald-900">
            Listo. Si <strong>{email}</strong> está registrado, te llega un
            email con el link en unos minutos. El link expira en 1 hora.
          </p>
          <p className="mt-3 font-sans text-xs text-emerald-700">
            ¿No te llegó? Revisá la carpeta de spam o probá de nuevo.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-sans text-sm font-semibold">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
            />
          </label>
          {state.kind === 'error' && (
            <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
              No se pudo procesar la solicitud. Intentá de nuevo.
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={state.kind === 'sending'}
            disabled={state.kind === 'sending'}
          >
            Enviarme el link
          </Button>
        </form>
      )}

      <Link
        href="/"
        className="font-sans text-sm text-[var(--color-canela)] no-underline hover:underline"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
