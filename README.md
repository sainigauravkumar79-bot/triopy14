# Triopy

## Cloudflare Pages Deployment

This app uses **Cloudflare Pages** for the frontend (built with Vite) plus
**Cloudflare Pages Functions** (in `/functions/api`) for the Gemini AI
endpoints. There is no Express server involved in production — `server.ts` is
only used for local development (`npm run dev`).

**Build settings (Cloudflare Pages dashboard):**
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (repo root)

**Environment variables to set in Cloudflare Pages > Settings > Environment variables:**
- `VITE_SUPABASE_URL` — needed at **build time** (Production + Preview)
- `VITE_SUPABASE_ANON_KEY` — needed at **build time** (Production + Preview)
- `GEMINI_API_KEY` — needed at **runtime** for the Functions in `/functions/api`.
  Add it as a Pages **secret**, not with a `VITE_` prefix (it must stay server-side).

If any of these are missing, the build will fail (Supabase vars, since
`src/lib/supabase.ts` throws if they're absent) or the `/api/*` AI features
will return 500 errors at runtime (missing `GEMINI_API_KEY`).
