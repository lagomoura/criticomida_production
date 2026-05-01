'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { ApiError } from '@/app/lib/api/client';
import { createClaim } from '@/app/lib/api/claims';
import type { VerificationMethod } from '@/app/lib/types/claim';

interface Props {
  restaurantSlug: string;
  restaurantName: string;
  restaurantLocation: string;
  isAlreadyClaimed: boolean;
}

const METHOD_OPTIONS: {
  value: VerificationMethod;
  label: string;
  hint: string;
}[] = [
  {
    value: 'domain_email',
    label: 'Email del dominio del local',
    hint: 'El email tiene que pertenecer al dominio del restaurant (ej. dueno@laestancia.com.ar). Te mandamos un link de verificación que aprueba el reclamo automáticamente.',
  },
  {
    value: 'google_business',
    label: 'Google Business Profile',
    hint: 'Subí un screenshot de tu dashboard de Google Business como evidencia. Un admin revisa el caso.',
  },
  {
    value: 'phone_callback',
    label: 'Llamada telefónica',
    hint: 'Te llamamos al teléfono que ya tenemos del local con un código. Un admin valida la llamada.',
  },
  {
    value: 'manual_admin',
    label: 'Otra evidencia',
    hint: 'Subí cualquier otra prueba (factura a nombre del local, foto del cartel) y un admin lo revisa manualmente.',
  },
];

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; method: VerificationMethod };

export default function ClaimFormClient({
  restaurantSlug,
  restaurantName,
  restaurantLocation,
  isAlreadyClaimed,
}: Props) {
  const { user, isLoading: authLoading } = useAuthContext();

  const [method, setMethod] = useState<VerificationMethod>('domain_email');
  const [contactEmail, setContactEmail] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState('');
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  if (isAlreadyClaimed) {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">
          Esta ficha ya está reclamada
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {restaurantName} ya tiene un dueño verificado en CritiComida. Si creés
          que hay un error, escribinos a soporte.
        </p>
        <div>
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="text-sm font-semibold text-[var(--color-canela)] no-underline hover:underline"
          >
            ← Volver a {restaurantName}
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="cc-container flex min-h-[40vh] items-center justify-center py-12">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-action-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cc-container flex flex-col gap-3 py-12">
        <h1 className="font-display text-3xl font-medium">Necesitás una cuenta</h1>
        <p className="font-sans text-sm text-text-muted">
          Para reclamar una ficha tenés que estar logueado. El claim queda
          asociado a tu usuario y nos sirve para contactarte si pedimos
          evidencia adicional.
        </p>
        <div className="flex gap-3">
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="text-sm font-semibold text-text-muted no-underline hover:underline"
          >
            ← Volver al restaurante
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: 'submitting' });

    const evidence = evidenceUrls
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await createClaim(restaurantSlug, {
        verification_method: method,
        contact_email: contactEmail.trim() || null,
        evidence_urls: evidence.length > 0 ? evidence : undefined,
      });
      setState({ kind: 'success', method });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 409
            ? 'Ya tenés un reclamo abierto para este local, o el local ya tiene dueño verificado.'
            : err.status === 400
              ? 'Faltan datos: el email del dominio es obligatorio para esa opción.'
              : err.status === 429
                ? 'Llegaste al límite de reclamos por día. Probá mañana.'
                : 'No se pudo crear el reclamo. Intentá de nuevo en unos minutos.'
          : 'No se pudo crear el reclamo. Intentá de nuevo en unos minutos.';
      setState({ kind: 'error', message });
    }
  }

  if (state.kind === 'success') {
    return (
      <div className="cc-container flex flex-col gap-4 py-12">
        <h1 className="font-display text-3xl font-medium">
          ¡Reclamo enviado!
        </h1>
        {state.method === 'domain_email' ? (
          <p className="font-sans text-sm text-text-secondary">
            Te mandamos (o enviaremos en breve) un link de verificación al email
            que indicaste. Hacé click ahí y tu ficha queda verificada al
            instante.
          </p>
        ) : (
          <p className="font-sans text-sm text-text-secondary">
            Un admin de CritiComida va a revisar tu evidencia y te avisamos por
            email cuando aprobemos o necesitemos algo más.
          </p>
        )}
        <div>
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="text-sm font-semibold text-[var(--color-canela)] no-underline hover:underline"
          >
            ← Volver al restaurante
          </Link>
        </div>
      </div>
    );
  }

  const selectedHint = METHOD_OPTIONS.find((m) => m.value === method)?.hint;
  const requiresEmail = method === 'domain_email';

  return (
    <div className="cc-container flex flex-col gap-5 py-8">
      <header className="flex flex-col gap-1">
        <p className="font-sans text-xs uppercase tracking-wider text-text-muted">
          Reclamo de ficha
        </p>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">
          {restaurantName}
        </h1>
        <p className="font-sans text-sm text-text-muted">
          {restaurantLocation}
        </p>
      </header>

      <p className="font-sans text-sm text-text-secondary">
        Si sos dueño o gerente, reclamá la ficha para responder reseñas, subir
        fotos oficiales y mantener la información al día. Solo se aprueba un
        owner por restaurante; los datos quedan registrados para auditoría.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <fieldset className="flex flex-col gap-2">
          <legend className="font-sans text-sm font-semibold text-text-primary">
            ¿Cómo querés verificar?
          </legend>
          {METHOD_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border-default bg-surface-card p-3 hover:bg-surface-subtle"
            >
              <input
                type="radio"
                name="verification_method"
                value={opt.value}
                checked={method === opt.value}
                onChange={() => setMethod(opt.value)}
                className="mt-1"
              />
              <span className="flex flex-col">
                <span className="font-sans text-sm font-semibold text-text-primary">
                  {opt.label}
                </span>
                <span className="font-sans text-xs text-text-muted">
                  {opt.hint}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {selectedHint && (
          <p className="rounded-md bg-surface-subtle px-3 py-2 font-sans text-xs text-text-secondary">
            {selectedHint}
          </p>
        )}

        <label className="flex flex-col gap-1">
          <span className="font-sans text-sm font-semibold text-text-primary">
            Email de contacto
            {requiresEmail && (
              <span className="ml-1 text-action-danger">*</span>
            )}
          </span>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required={requiresEmail}
            placeholder={
              requiresEmail
                ? 'tu-email@dominio-del-local.com'
                : 'Cómo te contactamos si pedimos más info'
            }
            className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-sans text-sm font-semibold text-text-primary">
            Evidencia (opcional)
          </span>
          <span className="font-sans text-xs text-text-muted">
            Una URL por línea: foto del cartel, factura, dashboard de Google,
            cualquier prueba que ayude al admin a validar.
          </span>
          <textarea
            rows={4}
            value={evidenceUrls}
            onChange={(e) => setEvidenceUrls(e.target.value)}
            placeholder="https://..."
            className="rounded-md border border-border-default bg-surface-default px-3 py-2 font-sans text-sm"
          />
        </label>

        {state.kind === 'error' && (
          <p className="rounded-md bg-action-danger/10 px-3 py-2 font-sans text-sm text-action-danger">
            {state.message}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/restaurants/${restaurantSlug}`}
            className="font-sans text-sm text-text-muted no-underline hover:underline"
          >
            Cancelar
          </Link>
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={state.kind === 'submitting'}
            disabled={state.kind === 'submitting'}
          >
            Enviar reclamo
          </Button>
        </div>
      </form>
    </div>
  );
}
