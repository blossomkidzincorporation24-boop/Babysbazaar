# Baby's Bazaar — Maintenance Guide

This document outlines the routine maintenance tasks to ensure the admin panel and customer website remain fast, secure, and fully functional.

## Daily Tasks (Shop Owner)
- **Log into the Admin Panel:** Ensure you can log in without issues.
- **Review Dashboard:** Check the "Recent Activity" feed for any unexpected changes (e.g., a product deleted that shouldn't have been).
- **Process New Products:** Upload any new items via the "Products" tab, ensuring you select "Active" so they appear on the live site.

## Weekly Tasks (Shop Owner)
- **Audit Website:** Visit the customer-facing website (`https://yourdomain.com`).
  - Click on "New Arrivals".
  - Open a product page.
  - Click the "Enquire on WhatsApp" button to ensure it opens the correct chat with the right product message.
- **Review Categories:** Ensure no categories are empty. Hide categories that have no active products to keep the website clean.

## Monthly Tasks (Developer / Technical Admin)
- **Storage Cleanup:**
  - When products are deleted, their images remain in the Storage bucket. Once a month, review the Supabase Storage buckets for orphaned images and delete them to save on hosting costs.
- **Verify Backups:**
  - Ensure the scheduled database and storage backups are actually running and producing valid, restorable files (see `BACKUP.md`).
- **Check Next.js/Vercel Logs:**
  - Look for unusual error rates, 500 server errors, or repeated 404s (e.g., customers trying to access old deleted product links).

## Quarterly Tasks (Developer)
- **Dependency Updates:**
  - Run `npm outdated` to check for security patches.
  - Update `@supabase/supabase-js`, `@supabase/ssr`, and Next.js minor versions carefully.
- **Database Health:**
  - Check the size of the database.
  - Monitor the `activity_logs` table. If it becomes too large (e.g., >50,000 rows), export older logs to a CSV and delete them from the active table to maintain database speed.
- **Test Full Restore:**
  - On a local development machine or a staging Supabase project, attempt a full database and storage restore using your backup files to prove that your backup strategy actually works in an emergency.
