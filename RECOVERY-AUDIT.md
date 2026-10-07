# Personal catalog vertical slice — 2026-09-30

The current task supersedes the earlier broad recovery plan. The authoritative phase object is the individual owned garment. No discovery, social, AI, editorial or outfit feature expansion was performed.

## Existing foundations preserved
Vinext/React, existing global visual language, reusable Radix dialogs/selects/checkboxes, D1 records, R2 photographs, seed graph and legacy exploration surfaces. The old homepage is at /explore; My closet is the primary route. Legacy add/edit controls now route to the personal catalog.

## Data contract
Owned.catalogData contains authoritative instance metadata including nullable purchasePrice and arrays. Existing relational links remain for compatibility; a private provisional model/variant is created internally without asking the user to identify a canonical product. Existing owned scalar columns are compatibility projections. Never compute core cost per wear from those legacy price columns, since their original NOT NULL constraint requires a zero fallback.

Actual wears remain rows in wears; notes added in migration 0002. Count, last date and cost per wear are derived on read/render. Repeated requests with the same event identifier are idempotent. Schema changes are append-only. Seed items o1–o8 remain available under Include sample wardrobe, off by default. No test garments are seeded into hosted storage.

Photos are persisted in R2, records/events in D1; no browser localStorage database. Images over 700 KB are resized to at most 1600 px and JPEG-compressed before upload. Supported source formats JPG, PNG, WebP, maximum source size 15 MB, eight photos per garment. The resulting image, rather than an archival full-resolution original, is retained.

## Verification
- TypeScript compile; existing domain integration suite; new check-closet integration suite.
- New suite uses actual route handlers, real SQLite migrations/database, simulated R2 adapter: five records covering minimal/deep/multiple arrays/no price/free item, edits, three dates, notes, CPW, idempotent retry, invalid input, database close/reopen and photo read-back.
- Browser against managed preview with actual local D1 and R2: three created garments; photo+category only saved without name or price; optional three-stage details; every metadata field; skip/finish flow; edit; today default; backdated wear and optional notes; four events with $120/3=$40 then $120/4=$30; reload retained image, metadata, edited name and wear history. Search olive linen plus Olive color filter returned the matching item. A no-price garment with a wear retained an unavailable CPW.
- Found and fixed: insecure preview randomUUID unavailability (uses getRandomValues); large-image request failure (resizing); date input event persistence (onInput plus onChange). Retested each corrected path.

## Limits
Single private owner workspace using existing me actor; not multi-tenant. USD only. No wear correction/deletion, garment deletion/export, offline queue or image orphan cleanup. Mobile CSS is implemented but a physical-phone camera/browser was not exercised. Hosted deployment verification is native deployment status; UI interaction tests ran on managed preview, not production. Legacy exploration remains a labeled prototype with demo community/inventory and heuristic styling/identification. No live integrations were added.

## Next pass
Wear-event correction/deletion with undo, garment archive/export, mobile-camera QA, and explicit per-user authorization before expanding audience. Keep the catalog as the authoritative core.
