'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Cropper, { type Area } from 'react-easy-crop';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import { getCroppedAvatarFile } from '@/app/lib/utils/cropAvatar';

interface Props {
  /** Archivo original elegido en el file picker. */
  file: File;
  open: boolean;
  /** Llamado con el File 512×512 ya recortado. */
  onConfirm: (croppedFile: File) => void;
  /** Cancelar/cerrar sin aplicar el crop. */
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.01;

/**
 * Modal interactivo de crop circular para foto de perfil. Drag para
 * reposicionar, pinch o slider para zoom; al confirmar entrega un
 * File JPEG 512×512 que continúa por el pipeline normal de upload.
 *
 * UX:
 * - Aspect 1:1 con `cropShape="round"` — el usuario ve exactamente
 *   cómo se va a renderizar en el avatar circular (sin sorpresas).
 * - Bottom-sheet en mobile (gracias al Modal del design system),
 *   centrado en sm+. El pinch-to-zoom de touch funciona out-of-the-box.
 * - Sin grilla (`showGrid={false}`): la región de interés (la cara)
 *   suele ser más chica que un tercio de la imagen, así que la grilla
 *   solo ensucia.
 */
export default function AvatarCropModal({ file, open, onConfirm, onClose }: Props) {
  const t = useTranslations('settings.avatar.crop');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  // Cada vez que cambia el archivo (o se vuelve a abrir el modal con uno
  // nuevo), regeneramos el objectURL y reseteamos crop+zoom.
  useEffect(() => {
    if (!open) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAreaPixels(null);
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [file, open]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!imageUrl || !areaPixels) return;
    setBusy(true);
    try {
      const cropped = await getCroppedAvatarFile(imageUrl, areaPixels, file.name);
      onConfirm(cropped);
    } catch {
      // Si el canvas falla, no podemos continuar — el padre maneja el toast.
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('title')}
      description={t('description')}
      size="md"
      position="bottom-sheet"
      busy={busy}
      footer={
        <>
          <Button type="button" variant="ghost" size="md" disabled={busy} onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={busy}
            disabled={!areaPixels}
            onClick={handleConfirm}
          >
            {t('done')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative h-[60vw] max-h-[360px] w-full overflow-hidden rounded-xl bg-color-espresso/90">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          )}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-xs font-medium text-text-secondary">
            {t('zoom')}
          </span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={busy}
            aria-label={t('zoom')}
            className="h-2 w-full cursor-pointer accent-action-primary"
          />
        </label>
      </div>
    </Modal>
  );
}
