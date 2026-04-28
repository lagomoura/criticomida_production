# Memory Index

- [project_criticomida.md](project_criticomida.md) — CritiComida product context: dish-focused reviews, rating formula, brand identity, category model intent
- [project_db_state.md](project_db_state.md) — DB state: 83 real restaurants, schema notes, search constraints (ILIKE only), migration history, seed creds
- [project_open_issues.md](project_open_issues.md) — Completed features (chat widget, brand v2, profile, ratings), planned work, non-obvious behaviors
- [ref_brand_identity.md](ref_brand_identity.md) — Brand docs: v2 live palette Especiería (Azafrán/Páprika/Albahaca/Canela/Crema/Carbón) + Cormorant + DM Sans. Docs reconciled 2026-04-22.
- [project_social_migration.md](project_social_migration.md) — Plan editorial → red social. Phase 0 decisions locked (mock flag, /categorias/[slug] rename, /u/[userId]). Phase 1+ pending.
- [feedback_no_free_text_entities.md](feedback_no_free_text_entities.md) — Regla: restaurants/dishes/ciudad siempre vienen de Google Places. Compose actual con free text requiere refactor antes de usuarios reales.
- [project_deploy.md](project_deploy.md) — Target deploy stack: Vercel (front) + Railway (back+DB); env vars needed; Dockerfile --reload prod issue
- [project_v1_product_decisions.md](project_v1_product_decisions.md) — Decisiones v1 (2026-04-24): edit comment SÍ, reputación SÍ, guardados públicos SÍ
- [project_restaurant_profile_v2.md](project_restaurant_profile_v2.md) — Restaurant profile v2 (2026-04-27): Fases A+B+C shipped — tabs sticky, RatingsRadar/Platos firma/Pulso/Cerca; falta GOOGLE_PLACES_API_KEY
- [project_dish_profile_v2.md](project_dish_profile_v2.md) — Dish profile v2 (2026-04-27): tabs sticky, agregados, taste profile, editorial Claude vía litellm, related dishes ILIKE
