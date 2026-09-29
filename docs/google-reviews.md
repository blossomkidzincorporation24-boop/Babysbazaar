# Google Reviews Integration Guide

This guide details how real Google customer reviews are integrated into the Baby's Bazaar website using Google Places API.

---

## 1. Overview & Architecture

Baby's Bazaar displays authentic customer reviews fetched directly from the business's Google Business Profile.

### Key Architectural Principles
* **Real Data Only:** No hardcoded or fake reviews. If no reviews are configured or the API is unreachable, the section gracefully hides without breaking the page layout.
* **Server-Side Security:** `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` are **server-only** environment variables. They are never prefixed with `NEXT_PUBLIC_` and are never bundled or exposed in client JavaScript.
* **Edge / Server Caching:** Reviews are cached on the server for **1 hour** (`next: { revalidate: 3600 }`). This minimizes Google Cloud API billing, reduces page load latency, and adheres to Google Places API caching guidelines.
* **Dual Endpoint Resilience:** Supports both the modern **Places API (New)** (`https://places.googleapis.com/v1/places/{id}`) and the standard **Places Details API** (`https://maps.googleapis.com/maps/api/place/details/json`).

---

## 2. Google Cloud Setup

Follow these steps to obtain your API key and enable Places API:

### Step 1: Create or Select a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select an existing project or create a new one (e.g. `babys-bazaar-prod`).
3. Ensure billing is enabled for the project (Google provides a monthly free tier credit of \$200 for Google Maps Platform APIs).

### Step 2: Enable the Places API
1. In the Google Cloud Console, navigate to **APIs & Services > Library**.
2. Search for **Places API (New)** and click **Enable**.
3. (Recommended) Also search for and enable **Places API** (legacy) as a fallback.

### Step 3: Create an API Key
1. In the Google Cloud Console, go to **APIs & Services > Credentials**.
2. Click **Create Credentials** > **API Key**.
3. Copy your newly created API key.

### Step 4: Secure and Restrict Your API Key (Important!)
1. In the Credentials list, click on your new API key to edit its settings.
2. Under **API restrictions**:
   * Select **Restrict key**.
   * Check **Places API (New)** and **Places API**.
   * Click **Save**.
3. Under **Application restrictions**:
   * Because this API key is queried strictly from your Next.js backend server (not user browsers), you can restrict by **IP addresses** (if your server has dedicated static IPs), or leave application restrictions to None while strictly maintaining API restrictions.

---

## 3. Finding Your Google Place ID

To link reviews to Baby's Bazaar, you need the unique `place_id` for your physical store.

### Method A: Use Google's Place ID Finder Tool (Quickest)
1. Visit the [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
2. Enter the store address:
   ```text
   Baby's Bazaar, 60, Perundurai Rd, near Sudha Hospital, Edayankattuvalasu, Erode, Tamil Nadu 638011
   ```
3. Click on the store pin.
4. Copy the **Place ID** string displayed in the tooltip (e.g. `ChIJ...`).

### Method B: Via Google Maps URL
1. Search for `Baby's Bazaar Erode` on [Google Maps](https://maps.google.com).
2. Look at the URL or inspect the page source for `data-pid` or `!1s...` identifier.

---

## 4. Configuring Environment Variables

Add the following environment variables to your deployment environment and your local `.env.local` file:

```env
# Google Places API (Server-side only — never expose to client)
GOOGLE_PLACES_API_KEY=AIzaSy...your_google_api_key_here
GOOGLE_PLACE_ID=ChIJ...your_place_id_here
```

### Production Deployment (e.g., Vercel, Coolify, VPS)
1. Go to your hosting dashboard (e.g., Vercel Project Settings > Environment Variables).
2. Add `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`.
3. Redeploy your production build.

---

## 5. Behavior & Graceful Fallback

* **When variables are not set or blank:** The server logs a single informational message in development mode (`[GoogleReviews] GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID is not configured...`). The `<GoogleReviews />` component safely returns `null`, meaning no reviews section is rendered and the website functions normally.
* **When API key is invalid or quota exceeded:** The server catches the issue cleanly and returns `null`. The page continues to render with zero crashes.
* **When real reviews are retrieved:**
  * Real store rating (e.g. `4.8★`) and total review count are displayed.
  * Real customer reviews with authentic names, star ratings, relative timestamps, and review text are displayed in a responsive carousel.
  * Google "G" branding badge is rendered complying with Google Maps attribution policies.
  * Links allow customers to view the business and write reviews directly on Google Maps.

---

## 6. Testing & Verification

1. **Verify missing keys behavior:**
   Start the application without `GOOGLE_PLACES_API_KEY`. Browse `http://localhost:3000/` and `http://localhost:3000/categories`. Confirm no error banners appear and the layout is seamless.
2. **Verify live integration:**
   Add valid `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` to `.env.local`. Restart `npm run dev` and navigate to the homepage. The "Rating And Reviews" section will render real customer reviews fetched directly from Google.
