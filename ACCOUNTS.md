# Private authentication

Supabase email/password Auth provides confirmed user UUIDs. Wardrobe data stays in Cloudflare D1 and photos stay in R2. Signup and signin use the server-side Auth REST API and a publishable key. No admin/service-role key is used.

An opaque Secure, HttpOnly, SameSite=Lax cookie identifies a hashed D1 session. Supabase access/refresh tokens remain server-side; identity is validated on every protected request. Logout revokes the local session.

Garments and outfits use their existing userId columns. Wear events and outfit items are protected through their parents. Photo keys have explicit media_owners records. Reads, updates, creation, and media downloads enforce the validated owner; caller-provided owner IDs and platform headers cannot select a closet. No Supabase wardrobe tables or storage are used.

New users go directly to their empty closet. There is no profile onboarding or legacy claim action. Legacy `me` records and photos remain unchanged and inaccessible to newly created accounts. Dormant profile/legacy-claim schema from the earlier saved version is retained, without exposing or using it.

Configuration requires SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, the site URL/redirect allowlist, and working Supabase confirmation-email delivery. Keep email confirmation enabled. Configure custom SMTP for public signup; Supabase’s default sender restricts recipients.

Verification: check-accounts.mjs exercises real production handlers and SQLite with a clearly labeled Auth test double; check-closet.mjs covers garment/photo/wear persistence. These do not prove real Supabase signup or live browser behavior. Live acceptance must be completed with confirmed test accounts.
