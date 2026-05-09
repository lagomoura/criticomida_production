'use client';

import { useState, useCallback } from 'react';

interface UseDirtyCloseGuardOptions {
  isDirty: () => boolean;
  onClose: () => void;
}

interface UseDirtyCloseGuardReturn {
  /** true mientras se muestra la confirmación de descarte. */
  confirmingDiscard: boolean;
  /** Llamar en lugar de onClose directo — evalúa dirty antes de cerrar. */
  requestClose: () => void;
  /** El usuario confirmó descartar: cierra el modal de verdad. */
  confirmDiscard: () => void;
  /** El usuario canceló el descarte: vuelve al estado normal. */
  cancelDiscard: () => void;
}

/**
 * Guard de cierre para modales con datos sin guardar.
 *
 * Uso:
 *   const { confirmingDiscard, requestClose, confirmDiscard, cancelDiscard } =
 *     useDirtyCloseGuard({ isDirty: () => note.trim().length >= 3, onClose });
 *
 * - Pasá `requestClose` como handler de X, overlay y Escape.
 * - Cuando `confirmingDiscard` es true, mostrá el banner de confirmación inline.
 * - `confirmDiscard` cierra el modal; `cancelDiscard` lo mantiene abierto.
 */
export function useDirtyCloseGuard({
  isDirty,
  onClose,
}: UseDirtyCloseGuardOptions): UseDirtyCloseGuardReturn {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const requestClose = useCallback(() => {
    if (isDirty()) {
      setConfirmingDiscard(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const confirmDiscard = useCallback(() => {
    setConfirmingDiscard(false);
    onClose();
  }, [onClose]);

  const cancelDiscard = useCallback(() => {
    setConfirmingDiscard(false);
  }, []);

  return { confirmingDiscard, requestClose, confirmDiscard, cancelDiscard };
}
