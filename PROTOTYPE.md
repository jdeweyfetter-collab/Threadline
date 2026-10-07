# Threadline prototype

## Implemented vertical slice
- D1 graph: brand → garment model → variant → owned item/listing; outfits join variants and owned items; wear records are separate events.
- Persisted wardrobe additions/edits, manual personal records, images, wear logs, collections, follows, reactions, comments, suggestions and outfit posts.
- R2 uploads for JPEG, PNG, WebP, MP4, WebM, limited to 15 MB per upload.
- Browse modes, mixed-type search, synonyms, secondhand filters, exact variant matching, local stores, and a curated original editorial.
- Outfit composition with independent layer slots, locks, rule-based swaps, comparison, and a schematic tucked/untucked view.
- Automatic wear logging occurs in the same database batch as the outfit and tag creation. Duplicate selected owned IDs are deduplicated.
- Analytics derive counts and cost per wear from actual wear events, including month distributions.

## Deliberate boundaries
This is an owner-private, single-workspace prototype. The current actor is `me`. Seed profiles and posts are fictional, not real accounts or engagement. App-owned authentication, authorization per user, friendship visibility enforcement and moderation must precede widening access. Visibility is metadata only in this private version.

Canonical records are staff-controlled. Manual entry creates a separate `scope=personal` provisional record, not a verified canonical authority. Linking and deduplication tools for staff are future work. Seed records and generated illustrations are not verified product specifications.

Marketplace adapters are not connected. Listings are demonstration asking prices, with no seller outbound purchase links, sold history, availability guarantees, price estimates, reservation, payments or fulfillment. Search performs keyword/synonym matching and simple price/size extraction, not general language understanding. Structured filters refine results. Local distances and store hours are fictional examples.

The style provider in `lib/style.ts` is deterministic and replaceable; photo identification is an explicitly labeled sample response with no actual visual analysis or fabricated confidence. Flat-lay transformations are not virtual try-on.

## Replacing demo boundaries
1. Add user identity and server-side ownership checks to all records and uploads before any sharing expansion.
2. Replace `seed.listings` with licensed marketplace adapters mapped to variant IDs; store source URL, observation time, seller verification and expiration. Separate asking from sold prices.
3. Implement identification provider backed by a multimodal service with evidence-based candidate ranking and unknown fields; require user confirmation.
4. Replace the style provider with a server-side service, preserving slot locks and returning explanations plus structured item IDs.
5. Add editorial rights metadata and licensed archives. Existing original essay links to the manufacturer and avoids a definitive release-date claim.
6. Add moderation/review workflows for suggestions, duplicate resolution and authority editing; canonical writes remain unavailable to the user API.

## Assets and rights
Generated illustrative product studies: black tassel loafers, moss crewneck, tobacco suede jacket. They depict no exact branded product.
Unsplash photography (Unsplash License):
- Happy Face Emoji: https://unsplash.com/photos/man-in-brown-coat-and-blue-denim-jeans-rFJA4nqaePQ
- Sirio: https://unsplash.com/photos/man-wearing-brown-coat-yLewA-ACaCM
- Vanessa Rauer: https://unsplash.com/photos/hanging-white-shirt-WfEoXGtlQ6E
- Jason Leung: https://unsplash.com/photos/blue-denim-jeans-on-brown-clothes-hanger-EtOMMg1nSR8
Images illustrate mood/category and do not authenticate seeded records. People pictured do not represent fictional named users.

## Verification
TypeScript check and production Worker build. Local D1 migrations applied successfully. Route-handler checks against an isolated SQLite adapter and an in-memory object-store adapter cover graph seeding, edits, manual intake, atomic outfit/wear changes, collection/follow actions, upload contract roundtrip, database read-back and invalid input rejection. The supervised preview was reported running but could not be reached. Browser interaction/visual QA and WebMCP runtime validation were unavailable because the required control-browser skill is not installed. The optional read-only WebMCP tool is feature-detected.
