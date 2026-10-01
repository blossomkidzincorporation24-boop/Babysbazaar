# Hostinger Environment Variables Specification

**Project:** Baby's Bazaar  
**Application Runtime:** Next.js 15 (Node.js on Hostinger)  
**Canonical Domain:** `https://babysbazaar.shop`  

---

## Environment Variables Matrix

| Variable Name | Purpose | Scope | Where to Configure in Hostinger |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sets the canonical base URL for SEO, metadata, sitemaps, and WhatsApp product links. | **Public** (Browser & Server) | Hostinger Node.js App Manager / `.env` file |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint for the production Supabase PostgreSQL instance. | **Public** (Browser & Server) | Hostinger Node.js App Manager / `.env` file |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous public API key for browser client authentication. | **Public** (Browser & Server) | Hostinger Node.js App Manager / `.env` file |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged secret key for server-side administrative operations. | **Server-Only (SECRET)** | Hostinger Node.js App Manager / `.env` file |
| `NODE_OPTIONS` | Enforces standard system certificate authority trust (`--use-system-ca`). | **Server-Only** | Hostinger Node.js App Manager / `.env` file |
| `R2_ACCOUNT_ID` | Cloudflare Account ID for R2 object storage. | **Server-Only** | Hostinger Node.js App Manager / `.env` file |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 S3-compatible Access Key for media uploads. | **Server-Only (SECRET)** | Hostinger Node.js App Manager / `.env` file |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 S3-compatible Secret Key for media uploads. | **Server-Only (SECRET)** | Hostinger Node.js App Manager / `.env` file |
| `R2_BUCKET_NAME` | Name of the media storage bucket (`babys-bazaar-media`). | **Server-Only** | Hostinger Node.js App Manager / `.env` file |
| `R2_PUBLIC_URL` | Public CDN URL for serving product images, banners, and reels (`https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev`). | **Public** (Browser & Server) | Hostinger Node.js App Manager / `.env` file |
| `GOOGLE_PLACES_API_KEY` | *(Optional)* Google Places API key for real-time reviews. | **Server-Only (SECRET)** | Hostinger Node.js App Manager / `.env` file |
| `GOOGLE_PLACE_ID` | *(Optional)* Google Place ID for store location. | **Server-Only** | Hostinger Node.js App Manager / `.env` file |

---

## Security Guidelines

1. **Never Commit Secrets:** Do not commit `.env` or `.env.local` to GitHub.
2. **File Permissions:** On Hostinger (Linux VPS or Node.js manager), ensure the `.env` file has restricted permissions (`chmod 600 .env`).
3. **Server-Only Protection:** `SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` are only read by Next.js server actions and API routes; they are never bundled into client-side JavaScript.
