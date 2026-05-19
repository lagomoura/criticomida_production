# Social Design Audit Agent — Memory Index

## Decisiones de marca y diseño confirmadas
- [Dark mode — bloque .dark existe](project_dark_mode_tokens.md) — el bloque .dark reasigna neutrales; cromáticos (Azafrán/Páprika/Albahaca) no se reasignan intencionalmente; eso está documentado en brand-identity-v2.md §13
- [Toast posicionado bottom-center en mobile, bottom-right en sm+](project_toast_position.md) — posicionamiento actual deliberado; el movimiento responsive existe en el código
- [Compose es full-page, no modal](project_compose_fullpage.md) — /compose es una ruta propia full-page; conforme con convención social

## Hallazgos descartados (falsos positivos confirmados)
- [bg-white en toggle switch del owner dashboard](fp_owner_toggle_bg_white.md) — bg-white en el thumb del toggle dentro de overlay oscuro es técnicamente correcto (contraste garantizado por el fondo oscuro del track)

## Auditorías anteriores (hallazgos por flujo)
- [Compose audit — commit 210e297](project_compose_audit_findings.md) — hallazgos del flujo compose: paridad dark OK por tokens semánticos, TechnicalPillars neutral contrast ~3.6:1 fallo, estado éxito solo toast, copy "Notas" seco, legacy rgba Azafrán en globals.css
- [Compose re-auditoría post Ola 1+2+3 — commit cb0b8b2](project_compose_reaudit_ola123.md) — 10 hallazgos cerrados, 2 abiertos (globals legacy), 1 reabierto (TechnicalPillars neutral regresión), 4 nuevos (contraste dorado 1.96:1, kickers 10px, icon size)
- [Profile stats bar + ReputationStrip — commit 397ca19](project_profile_stats_audit_397ca19.md) — HTML inválido en dl/button, skeleton no representa nueva grid, sin K/M para números grandes; identidad y paridad dark OK

## Convenciones del repo
- [Iconografía: solo FontAwesome v6](convention_icons_fontawesome.md) — única familia de iconos; brand-identity-v2.md §10 lo documenta explícitamente
- [Modal tiene position=bottom-sheet en mobile, center en desktop](convention_modal_position.md) — el componente Modal soporta ambos; AuthModal ya usa bottom-sheet correctamente
- [BottomNav se oculta en md+ (desktop)](convention_bottomnav_hidden_desktop.md) — md:hidden en BottomNav; TopNav visible solo en md+
- [Owner dashboard: no sidebar — ruta anidada bajo /restaurants/[id]/owner/](convention_owner_no_sidebar.md) — el owner dashboard NO tiene sidebar SaaS; es una página dentro del flujo público del restaurante
