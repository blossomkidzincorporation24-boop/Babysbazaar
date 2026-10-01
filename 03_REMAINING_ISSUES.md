# Baby's Bazaar — Remaining Issues & Client Action Items

**Date:** October 1, 2026  
**Auditor:** Senior Full-Stack & UI/UX Production Engineer  

---

## Action Items Required by Client / Store Owner

The codebase is 100% clean, verified, and ready for production deployment. The following items require store owner input or external DNS/account actions:

### 1. Custom Domain DNS Configuration (`babysbazaar.shop` on Vercel)
- **Status:** `[REQUIRES CLIENT ACTION]`
- **Detail:** If `https://babysbazaar.shop` is pointing to the Vercel project, ensure the following DNS records are set in your domain registrar (e.g. GoDaddy, Namecheap, Cloudflare DNS):
  - **A Record:** `@` -> `76.76.21.21`
  - **CNAME Record:** `www` -> `cname.vercel-dns.com`
- **Environment Variables on Vercel:** Ensure Vercel project environment variables match `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL=https://pyopqnrubhfknxsmuqkc.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  - `NEXT_PUBLIC_SITE_URL=https://babysbazaar.shop`
  - `NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev`
  - `CLOUDFLARE_ACCOUNT_ID=c30bd96199895eb1d72f36d07e09fb80`
  - `CLOUDFLARE_R2_ACCESS_KEY_ID=...`
  - `CLOUDFLARE_R2_SECRET_ACCESS_KEY=...`
  - `CLOUDFLARE_R2_BUCKET_NAME=babys-bazaar-media`

### 2. WhatsApp Business Phone Number Verification
- **Status:** `[VERIFIED ON CODE / OWNER CONFIRMATION]`
- **Current Number:** `+91 84898 24888` (default in settings and fallback)
- **Detail:** Verify that this phone number has an active WhatsApp / WhatsApp Business account logged in to receive enquiries and respond to customers.

### 3. Google Places API Key (For Live Google Reviews)
- **Status:** `[OPTIONAL ENHANCEMENT]`
- **Detail:** If you wish to pull live real-time reviews from Google Maps for the Erode store location, provide `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` in Vercel environment variables. The fallback reviews are active and clean.

### 4. Admin Password Reset / Ongoing Admin Access
- **Status:** `[READY]`
- **Admin Email:** `admin@babysbazaar.com`
- **Access Route:** `https://babysbazaar.shop/admin`
- **Detail:** Store owner can log in to add new products, update prices, manage toy subcategories, and change banners.
