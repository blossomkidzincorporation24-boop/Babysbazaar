# Baby's Bazaar — Hosting Migration Backup & Safety Log

**Date:** October 1, 2026  
**Action:** Transitioning from Vercel to Hostinger  
**Canonical Domain:** `https://babysbazaar.shop`  

---

## 1. Source Code & Git Status

- **Repository:** `https://github.com/blossomkidzincorporation24-boop/Babysbazaar.git`
- **Active Branch:** `main`
- **Pre-Migration Commit:** `f106d28`
- **Safety Status:** All working code is safely version-controlled and pushed to GitHub.

---

## 2. Infrastructure Inventory (Unchanged & Persistent)

### A. Database (Supabase PostgreSQL)
- **Status:** ACTIVE & UNCHANGED
- **Project Ref:** `pyopqnrubhfknxsmuqkc`
- **Host:** `https://pyopqnrubhfknxsmuqkc.supabase.co`
- **Role:** Source of truth for products, categories, banners, delivery features, reels, and admin auth.

### B. Media Storage (Cloudflare R2 Bucket)
- **Status:** ACTIVE & UNCHANGED
- **Account ID:** `c30bd96199895eb1d72f36d07e09fb80`
- **Bucket Name:** `babys-bazaar-media`
- **Public CDN URL:** `https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev`
- **Assets:** 70 active images/videos serving with HTTP 200.

---

## 3. Environment Variable Schema (Backup Template)

The application requires the following environment variables on the production host (Hostinger):

```env
NEXT_PUBLIC_SITE_URL=https://babysbazaar.shop
NEXT_PUBLIC_SUPABASE_URL=https://pyopqnrubhfknxsmuqkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NODE_OPTIONS=--use-system-ca

# Cloudflare R2 Media Storage
R2_ACCOUNT_ID=c30bd96199895eb1d72f36d07e09fb80
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=babys-bazaar-media
R2_PUBLIC_URL=https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev
```

*(Note: Actual secrets are stored in secure local `.env.local` and must be entered directly in the Hostinger environment manager).*
