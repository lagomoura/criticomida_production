'use client';

import { FormEvent, useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import { updateProfile } from '@/app/lib/api/users';
import { ApiError } from '@/app/lib/api/client';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';

export default function EditProfileForm() {
  const { user, refreshUser } = useAuthContext();
  const [open, setOpen] = useState(false);

  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [handle, setHandle] = useState(user?.handle ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [location, setLocation] = useState(user?.location ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const summaryHandle = user.handle ? `@${user.handle}` : 'Sin handle definido';
  const summaryBio = user.bio ?? 'Sin bio';
  const summaryLocation = user.location ?? 'Sin ubicación';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({
        display_name: displayName.trim() || undefined,
        handle: handle.trim() ? handle.trim() : null,
        bio: bio.trim() ? bio.trim() : null,
        location: location.trim() ? location.trim() : null,
      });
      await refreshUser();
      setSuccess(true);
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : 'No pudimos guardar los cambios. Probá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-border-default bg-surface-card">
      <header className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-medium text-text-primary">Perfil público</p>
          <p className="font-sans text-xs text-text-muted">
            {summaryHandle} · {summaryLocation}
          </p>
          <p className="mt-1 line-clamp-2 font-sans text-xs text-text-muted">{summaryBio}</p>
        </div>
        {!open && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Editar perfil
          </Button>
        )}
      </header>

      {success && !open && (
        <p className="border-t border-border-default px-4 py-2 font-sans text-xs text-action-secondary">
          Cambios guardados.
        </p>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-border-default p-4" noValidate>
          <Input
            label="Nombre visible"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            minLength={1}
            maxLength={100}
            required
            disabled={submitting}
          />
          <Input
            label="Handle (usuario)"
            helpText="Letras, números y guion bajo. Entre 3 y 30 caracteres. Opcional."
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            pattern="[a-zA-Z0-9_]{3,30}"
            minLength={3}
            maxLength={30}
            placeholder="ej. micacomelona"
            disabled={submitting}
          />
          <Input
            label="Ubicación"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={200}
            placeholder="ej. Palermo, Buenos Aires"
            disabled={submitting}
          />
          <Textarea
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            valueLength={bio.length}
            rows={3}
            disabled={submitting}
          />
          {error && (
            <p className="m-0 font-sans text-sm text-action-danger" role="status" aria-live="polite">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={submitting} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Guardar cambios
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
