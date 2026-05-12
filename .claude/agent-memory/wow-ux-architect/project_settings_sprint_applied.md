---
name: Sprint settings aplicado
description: Cambios implementados el 2026-05-08 en /settings, EditProfileForm, ThemeToggle y Button
type: project
---

Sprint completo de /settings aplicado 2026-05-08. Pendiente de commit por el usuario.

**Archivos modificados:**
- `app/[locale]/settings/page.tsx` — token drift corregido (Avatar, role badge, H1 con font-display, email text-text-muted), SettingsSkeleton reemplaza spinner, logout inline confirmation (sin modal), ThemeToggle variant="pill", copy DMMT ("Ver guardados"/"Editar gustos", "Iniciar sesión" en anon state)
- `app/[locale]/profile/components/EditProfileForm.tsx` — toast.success reemplaza inline `<p>` de success; `success` state eliminado; useToast integrado
- `app/components/ThemeToggle.tsx` — prop `variant?: 'icon' | 'pill'`; icon default (no rompe navbar), pill = two-zone sliding ball, motion-safe, aria-pressed + aria-label dinámico con estado actual; tap target icon bumpeado a h-11 w-11
- `app/components/ui/Button.tsx` — variante `danger` agregada (bg-action-danger / Páprika)
- `app/components/ui/SkeletonPresets.tsx` — `SettingsSkeleton` exportada
- `messages/{es,en,pt}.json` — nuevas keys: `settings.savedAction`, `settings.preferencesAction`, `settings.goHome` (→ "Iniciar sesión"), `settings.anonMessage`, `settings.logoutConfirm`, `settings.logoutConfirmAction`, `settings.logoutCancel`, `settings.logoutError`, `settings.editForm.savedTitle`, `settings.editForm.savedDescription`, `themeToggle.currentLight`, `themeToggle.currentDark`

**Why:** Sprint aprobado con scope completo (Críticos + Altos + Medios + 5 WOW). El usuario revisará y commiteará el diff.

**How to apply:** No re-auditar estos hallazgos en próximas sesiones a menos que el usuario reporte regresión. El audit mobile quedó pendiente de lanzar desde la conversación principal (sandbox bloquea invocación directa).
