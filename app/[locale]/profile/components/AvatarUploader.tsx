'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Avatar from '@/app/components/ui/Avatar';
import Button from '@/app/components/ui/Button';
import { useToast } from '@/app/components/ui/Toast';
import { ApiError } from '@/app/lib/api/client';
import { uploadUserAvatar } from '@/app/lib/api/images';
import { updateProfile } from '@/app/lib/api/users';
import { useAuthContext } from '@/app/lib/contexts/AuthContext';
import { cn } from '@/app/lib/utils/cn';
import type { User } from '@/app/lib/types/user';
import AvatarCropModal from './AvatarCropModal';

const MAX_BYTES = 8 * 1024 * 1024; // mismo cap que el backend
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const AVATAR_PX = 56; // alineado con Avatar size="lg"

interface Props {
  user: User;
}

/**
 * Avatar tappeable en /settings. El avatar mismo dispara el file picker;
 * "Cambiar foto" debajo refuerza la affordance (DMMT). Si el usuario ya
 * tiene foto, aparece "Quitar foto" con confirmación inline (mismo
 * patrón que el confirm de logout en SettingsPage — sin modal extra).
 *
 * Flujo de subida:
 * 1. Validación cliente (tamaño + MIME) → error temprano sin red.
 * 2. Modal de crop circular: el usuario decide qué parte del bitmap
 *    queda como avatar. Devuelve un File 512×512 JPEG.
 * 3. Preview optimista local (objectURL del crop) durante el upload.
 * 4. uploadUserAvatar → PATCH /users/me con avatar_url → refreshUser.
 *    El refresh propaga la nueva URL al árbol entero (navbar, bottomnav,
 *    comments, perfil público) sin recargar.
 * 5. Si algo falla, descartamos el preview y volvemos al avatar previo.
 */
export default function AvatarUploader({ user }: Props) {
  const { refreshUser } = useAuthContext();
  const t = useTranslations('settings.avatar');
  const toast = useToast();

  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [optimisticPreview, setOptimisticPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<'uploading' | 'removing' | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Liberar el ObjectURL si el componente se desmonta o si reemplazamos
  // el preview por uno nuevo. Evita leak en sesiones largas.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const isUploading = busy === 'uploading';
  const isRemoving = busy === 'removing';
  const disabled = busy !== null;
  const displaySrc = optimisticPreview ?? user.avatar_url;

  function clearOptimisticPreview() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setOptimisticPreview(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reseteamos el value para que volver a elegir el mismo archivo dispare onChange.
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_MIME.has(file.type)) {
      toast.error(t('errorBadFormat'));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t('errorTooLarge'));
      return;
    }

    setConfirmRemove(false);
    setPendingFile(file);
  }

  async function handleCropConfirm(croppedFile: File) {
    setPendingFile(null);
    setBusy('uploading');

    // Preview optimista — el usuario ve el crop en el avatar antes que
    // la red lo confirme. El crop ya es 512×512, no hace falta volver
    // a pasarlo por compressImage.
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const previewUrl = URL.createObjectURL(croppedFile);
    objectUrlRef.current = previewUrl;
    setOptimisticPreview(previewUrl);

    try {
      const url = await uploadUserAvatar(croppedFile, user.id);
      await updateProfile({ avatar_url: url });
      await refreshUser();
      toast.success(t('savedTitle'));
    } catch (err) {
      clearOptimisticPreview();
      const detail =
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : t('errorUpload');
      toast.error(detail);
    } finally {
      setBusy(null);
      // Una vez aplicado el avatar real (refreshUser actualizó user.avatar_url),
      // el siguiente render usa la URL del backend.
      clearOptimisticPreview();
    }
  }

  async function handleRemove() {
    setBusy('removing');
    try {
      await updateProfile({ avatar_url: null });
      await refreshUser();
      toast.success(t('removedTitle'));
    } catch (err) {
      const detail =
        err instanceof ApiError && typeof err.detail === 'string'
          ? err.detail
          : t('errorUpload');
      toast.error(detail);
    } finally {
      setBusy(null);
      setConfirmRemove(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <label
        className={cn(
          'group relative inline-flex cursor-pointer items-center justify-center rounded-full',
          'focus-within:outline-none focus-within:[box-shadow:var(--focus-ring)]',
          disabled && 'cursor-wait opacity-90',
        )}
        aria-label={t('change')}
        style={{ width: AVATAR_PX, height: AVATAR_PX }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
        />
        {optimisticPreview ? (
          // Preview local: blob: URL no pasa por next/image optimizer; un <img> plano es lo correcto.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimisticPreview}
            alt={user.display_name}
            width={AVATAR_PX}
            height={AVATAR_PX}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <Avatar
            name={user.display_name}
            src={displaySrc}
            size="lg"
            className="bg-action-primary/10 text-action-primary"
          />
        )}
        {/* Overlay de hover: indica que el avatar es interactivo. */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors',
            !disabled && 'group-hover:bg-black/30 group-focus-within:bg-black/30',
          )}
        />
        {isUploading && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40"
          >
            <FontAwesomeIcon
              icon={faSpinner}
              className="h-4 w-4 animate-spin text-white"
            />
          </span>
        )}
      </label>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          className="font-sans text-xs font-medium text-action-primary underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {isUploading ? t('uploading') : t('change')}
        </button>

        {user.avatar_url && !confirmRemove && (
          <button
            type="button"
            className="font-sans text-xs text-text-muted underline-offset-2 hover:underline hover:text-text-primary disabled:pointer-events-none disabled:opacity-60"
            onClick={() => setConfirmRemove(true)}
            disabled={disabled}
          >
            {t('remove')}
          </button>
        )}

        {confirmRemove && (
          <span
            className="flex flex-wrap items-center gap-2"
            role="alert"
            aria-live="polite"
          >
            <span className="font-sans text-xs text-text-primary">
              {t('removeConfirm')}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isRemoving}
              onClick={() => setConfirmRemove(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={isRemoving}
              onClick={handleRemove}
            >
              {t('removeAction')}
            </Button>
          </span>
        )}
      </div>

      {pendingFile && (
        <AvatarCropModal
          file={pendingFile}
          open={pendingFile !== null}
          onConfirm={handleCropConfirm}
          onClose={() => setPendingFile(null)}
        />
      )}
    </div>
  );
}
