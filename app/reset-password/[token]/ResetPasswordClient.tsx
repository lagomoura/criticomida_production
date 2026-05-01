'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import { resetPassword } from '@/app/lib/api/auth';
import { ApiError } from '@/app/lib/api/client';

interface Props {
  token: string;
}

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

export default function ResetPasswordClient({ token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });

  const valid = password.length >= 8 && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setState({ kind: 'submitting' });
    try {
      await resetPassword(token, password);
      setState({ kind: 'success' });
      // Redirige al home después de 2 segundos para que el user logueé
      // con la nueva clave (las sesiones viejas quedaron revocadas).
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setState({
        kind: 'error',
        message:
          err instanceof ApiError && err.status === 400
            ? 'El link es inválido o ya expiró. Pedí uno nuevo desde "Olvidé mi contraseña".'
            : 'No se pudo cambiar la contraseña. Intentá de nuevo.',
      });
    }
  }

  return (
    <div className="cc-container flex flex-col gap-4 py-12 max-w-md mx-auto">
      <h1 className="font-display text-3xl font-medium">Nueva contraseña</h1>

      {state.kind === 'success' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-sans text-sm text-emerald-900">
            Listo. Tu contraseña fue actualizada. Te llevamos al inicio…
          </p>
        </div>
      ) : (
        <>
          <p className="font-sans text-sm text-text-muted">
            Escribí tu nueva contraseña dos veces. Las sesiones abiertas en
            otros dispositivos se cierran automáticamente.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-sans text-sm font-semibold">
                Nueva contraseña
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
              />
              <span className="font-sans text-xs text-text-muted">
                Mínimo 8 caracteres.
              </span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-sans text-sm font-semibold">
                Repetir contraseña
              </span>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
              />
              {confirm && password !== confirm && (
                <span className="font-sans text-xs text-action-danger">
                  No coinciden.
                </span>
              )}
            </label>

            {state.kind === 'error' && (
              <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
                {state.message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={state.kind === 'submitting'}
              disabled={!valid || state.kind === 'submitting'}
            >
              Guardar contraseña
            </Button>
          </form>
        </>
      )}

      <Link
        href="/forgot-password"
        className="font-sans text-sm text-text-muted no-underline hover:underline"
      >
        Pedir un link nuevo
      </Link>
    </div>
  );
}
