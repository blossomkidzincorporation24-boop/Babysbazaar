# Baby's Bazaar — Final Hostinger Production Checklist

**Application:** Baby's Bazaar  
**Canonical Production URL:** [https://babysbazaar.shop](https://babysbazaar.shop)  
**Hosting Target:** Hostinger  

---

## 1. Pre-Deployment Verification

| Check | Item | Status | Verification Note |
|:---:|:---|:---:|:---|
| ✅ | **Git Repository** | PASS | All code pushed to `main` (`blossomkidzincorporation24-boop/Babysbazaar`). |
| ✅ | **Zero Vercel References** | PASS | No customer-facing `.vercel.app` or `76.76.21.21` references in codebase. |
| ✅ | **Next.js Standalone Build** | PASS | `output: 'standalone'` enabled in `next.config.ts`. |
| ✅ | **Supabase Connectivity** | PASS | `pyopqnrubhfknxsmuqkc.supabase.co` active with all 12 tables and admin credentials. |
| ✅ | **Cloudflare R2 CDN** | PASS | `pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev` serving 70 assets with HTTP 200. |

---

## 2. Hostinger Server Checklist

| Step | Task | How to Verify |
|:---:|:---|:---|
| 1️⃣ | **Node.js Runtime** | Node 20 LTS installed (`node -v` returns `v20.x.x` or `v18.x.x`). |
| 2️⃣ | **Environment Variables** | All 10 environment variables from `03_ENVIRONMENT_VARIABLES.md` populated in Hostinger. |
| 3️⃣ | **Build & Start** | `npm run build` completed, and process managed with PM2 (`pm2 status`). |
| 4️⃣ | **DNS Pointing** | Domain `babysbazaar.shop` `A` record points to Hostinger Server IP (no Vercel IPs). |
| 5️⃣ | **SSL Certificate** | Let's Encrypt / Hostinger SSL active with Force HTTPS enabled. |
| 6️⃣ | **Reverse Proxy** | Nginx or OpenLiteSpeed forwarding port 80/443 to internal port 3000. |

---

## 3. Post-Deployment User Journey Tests

- [ ] **Homepage (`/`):** Hero slider, category cards, new arrivals, reels, and reviews load smoothly.
- [ ] **Toys Landing (`/toys`):** 11 toy subcategory cards and toy catalogue render properly.
- [ ] **Product Detail View (`/product/[slug]`):** Image gallery, price, size variants, and description load.
- [ ] **WhatsApp Enquiry Button:** Opens WhatsApp pre-filled with `https://babysbazaar.shop/product/[slug]`.
- [ ] **Admin Login (`/admin`):** Secure login via Supabase auth, allowing product and banner management.
- [ ] **Search & Filters:** Real-time search and price/age filtering execute without errors.
- [ ] **XML Sitemap (`/sitemap.xml`):** Resolves dynamically with canonical `babysbazaar.shop` URLs.
