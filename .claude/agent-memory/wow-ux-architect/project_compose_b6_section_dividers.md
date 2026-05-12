---
name: B6 form compose — agrupación en 4 bloques con SectionDivider
description: ReviewFormBody.tsx agrupado en 4 bloques semánticos con kicker-dividers i18n. Decisiones de estructura y estilo registradas.
type: project
---

ReviewFormBody.tsx ahora tiene 4 bloques semánticos con SectionDivider inline (kicker Azafrán + hairline border-subtle).

Bloques y orden:
1. "El plato" — Fotos · Ghostwriter · Rating+¿lo pedirías? · Pilares — SIN divisor superior (primer bloque)
2. "Tu opinión" — Nota · Pros · Cons — divisor antes de sección 4
3. "El contexto" — Porción · Momento · Compañía · Precio · Fecha — divisor antes de sección 7
4. "Detalles" — Tags · Anónimo — divisor antes de sección 11

**Por qué:** El form de 12 secciones no tenía ningún orientador visual. A 375px mobile el usuario no sabía cuánto faltaba ni dónde estaba. Los divisores son orientadores, no separadores funcionales — scroll lineal intacto.

**Cómo aplicar:**
- sectionDish existe en i18n pero NO se renderiza (primer bloque sin divisor superior — convención decidida).
- Si el modal de restaurante reutiliza ReviewFormBody en contexto diferente, puede insertar SectionDivider con t('sectionDish') arriba.
- Componente SectionDivider es inline en ReviewFormBody.tsx (no primitiva en ui/ porque es form-specific y no se reusa en otro lado todavía).
- Estilo: font-sans text-[10px] font-semibold uppercase tracking-[0.20em] text-color-azafran + h-px flex-1 bg-border-subtle.
- Keys i18n en restaurant.dishReviewForm: sectionDish / sectionOpinion / sectionContext / sectionDetails (×3 idiomas).
