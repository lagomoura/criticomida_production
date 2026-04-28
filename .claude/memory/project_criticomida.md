---
name: CritiComida Product Context
description: Food review platform transitioning from prototype to production - reviews individual dishes, not just restaurants. Multi-user with critic weight.
type: project
---

CritiComida is a food review platform focused on **individual dish ratings** (not just restaurant ratings). Similar to Google Maps reviews but focused on food.

**Architecture**: MVC with Next.js frontend + FastAPI backend + PostgreSQL.

**User model**:
- Critic (platform owner, reviews have x2 weight)
- Registered users (can leave dish reviews, like Google Maps)
- Admin (full platform management)

**Rating computation**: restaurant rating = avg(dish ratings) * 0.5 + avg(dimensions like cleanliness, ambiance) * 0.5

**Why:** The product differentiates from Google Maps by focusing reviews on individual dishes, not the establishment.

**Category model:** `restaurant.category_id` is a nullable FK (made nullable ~2026-03-20 when real data was imported). A restaurant can show up in category pages via this FK, but the intended long-term design is for categories to emerge from dish-level data. Do NOT treat `Restaurant.category_id` as the source of truth.

**Brand identity:** Official name is **CritiComida** (capital C + C). Brand doc at `docs/brand-identity.md`. Logo is a mascot character (face with eyes, coral mouth, brown/green body on lavanda circle), not a text logo. Primary brand color is `--mainPink: #ef7998`. Font: Source Sans 3.

**How to apply:** All features should center around dish-level reviews. The restaurant page is an aggregation of its dishes' reviews. When designing features or suggesting schema changes, prioritize the dish as the primary entity. Backend uses FastAPI + SQLAlchemy + Alembic. Auth is JWT.
