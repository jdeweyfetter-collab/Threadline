# Threadling mobile catalog pass — 2026-10-04

## Product target and present boundary
The goal is a standalone phone product with a desktop website; ChatGPT is the current development/hosting environment, not the intended consumer container. This update is a mobile web implementation in the retained React/Vinext application. It is not an iOS/Android application or a completed standalone launch.

Inspected: existing source, hosting manifest, deployed version/audience, auth helper, API data ownership, photo storage, and tests. At opening the Site was private to its owner; its audience changed externally to public during this run. The public audience was retained, and every data/media read and write now requires platform identity matching the configured owner email. All application data still belongs to the legacy `me` actor. Merely making the Site public would expose that shared wardrobe and is not a valid migration. No audience change was made by this development run. The owner email is held in a hosted secret, not client source. Missing configuration denies access. Anonymous visitors see a sign-in screen; other identities receive 403.

The current stack has no native application, native camera integration, app signing, store submission, independent identity provider, or multi-user authorization. A native-versus-web question was offered but not answered. This pass therefore improves the reusable web experience; it does not commit to a major native rebuild.

## Recommended next architecture step
Use the existing React web interface for an independent mobile/desktop web release. Keep the garment and wear-event contracts and photo identifiers. Establish independent hosting and sign-in, scope every record/media request to the authenticated owner, and migrate existing data with a verified export/import. Then decide whether to distribute a native or wrapped mobile client using the same backend. A native UI could share the TypeScript domain model and API contract, but not automatically reuse every DOM component. No App Store build is represented as complete.

## Implemented
- Photo-first full-screen mobile flow: native browser camera request or photo picker, visible preview, category, actual photo-color sampling, explicit review and optional approval, save to closet.
- Six primary categories with old category normalization and preserved additional categories.
- Stable photo asset identifiers, kind for future label/detail/worn/product photos, explicit primary identifier; legacy URL arrays remain compatible. Primary changes and removals are persisted in catalogData. The legacy image projection follows the primary photo.
- Browser photo decoding (bitmap with image fallback), orientation handled by browser decode, resizing/compression and sequential uploads. Completed uploads are retained in the draft if a later upload fails. Unsupported photos show a recoverable error.
- Separate gallery management and metadata editing. Optional metadata is grouped in expandable sections. Multi-value chips plus custom text entry.
- Image-first closet with search/category strip, filter sheet, sorting, lazy image decoding, and batches of 48 rendered cards. Wear records are indexed once for sorting instead of scanned for every comparison.
- Swipeable image gallery, primary cover used throughout, essential detail display, expandable metadata, persistent individual wear logging and history with derived CPW.
- Safe-area spacing, bottom thumb-reachable actions, 44–50px primary targets, mobile full-screen dialogs and desktop layouts, reduced-motion styles, error/success/loading states, explicit unsaved-change warning.

## Suggestions
No live AI or product-recognition connection is configured. Only coarse color suggestions are generated, by sampling actual image pixels in the browser. Center sampling cannot segment clothing or reliably separate background/lighting. UI states these limits and requires both selecting and applying suggestions. No brand, fiber, era or exact product identity is fabricated. Suggested information remains separate from confirmed draft metadata until approved. An OpenAI Developers connection was previously offered but is not confirmed; no API key or paid inference was used.

## Verification completed
- TypeScript compile.
- Existing API/domain integration suite.
- Expanded real SQLite + API-handler integration suite: minimal/deep/multiple-value/no-price/free garments; dates and notes; zero-wear/null-price/zero-price CPW; edits; database reopen; image storage adapter roundtrip; duplicate request protection; required-field rejection.
- Gallery primary selection, persisted photo kind/ID, primary deletion fallback, removal persistence, invalid primary rejection, legacy category normalization, wear events preserved through photo edits.
- Unapproved suggestions stay absent, approved subset applies and persists; deterministic blue image pixels produce a blue suggestion; empty transparent pixels produce none.
- 1,000 garments and 10,000 wear events filtered/sorted correctly in approximately 9 ms in the local test environment. This measures domain operations, not rendering, network, or phone performance.

## Verification limits
Current Sites instructions permit managed browser QA only with the control-browser capability; that capability is unavailable. Anonymous and non-owner API/media requests were also tested and rejected. No new preview was started and no replacement browser path was used. Mobile and desktop visual/interaction QA, actual iPhone camera/photo-picker behavior, HEIC decoding, background/resume behavior and deployed browser refresh remain unverified for this redesigned UI. Earlier browser QA applies to the previous design only. A successful publish establishes deployment, not completion of the standalone acceptance test.

No background removal, exact product identification, outfit/styling/social features, offline storage, native packaging or external hosting migration was implemented. R2 photos removed from a garment remain in storage; garbage collection is a future storage task. Saved garments and wear history still use server persistence; no browser-only database was introduced.
