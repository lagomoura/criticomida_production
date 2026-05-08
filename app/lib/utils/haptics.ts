/** Tiny haptic blip on supported devices. No-op on desktop or browsers
 * without the Vibration API. */
export function vibrateOnce(ms = 12): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(ms);
    }
  } catch {
    /* noop */
  }
}
