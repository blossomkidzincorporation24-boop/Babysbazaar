# Baby's Bazaar — Backup Strategy & Recovery Plan

This document explains how to back up and restore both the database and the files (images/videos) for Baby's Bazaar.

> **CRITICAL WARNING:**
> Supabase automated database backups **DO NOT** include your uploaded files (Storage). You must manage Storage backups separately.

---

## 1. Database Backup

Supabase handles relational data (Products, Categories, Profiles, etc.).

### Automated Backups (Pro Plan)
If you are on the Supabase Pro Plan ($25/mo), Point-in-Time Recovery (PITR) is automatically enabled.
- Go to **Supabase Dashboard** -> **Database** -> **Backups**.
- You can restore your database to any specific minute within the last 7 to 30 days.

### Manual Backups (Free/Basic Plan)
If you are on the Free plan, you must manually export your database.
1. Install the Supabase CLI: `npm i -g supabase`
2. Login: `supabase login`
3. Export your data:
   ```bash
   supabase db dump --data-only -f backup_data.sql
   supabase db dump -f backup_schema.sql
   ```
4. Save these SQL files safely on an external hard drive or cloud storage.

---

## 2. Storage Backup (Images, Reels, Banners)

Supabase Storage files (S3 buckets) are not backed up by database backups.

### How to backup Storage:
1. **Using Rclone (Recommended):**
   - Install [Rclone](https://rclone.org/).
   - Configure a new remote for `s3` compatible storage using your Supabase project's S3 credentials (found in Dashboard -> Project Settings -> Storage).
   - Sync buckets to your local drive:
     ```bash
     rclone sync supabase_s3:products /path/to/local/backup/products
     rclone sync supabase_s3:categories /path/to/local/backup/categories
     rclone sync supabase_s3:banners /path/to/local/backup/banners
     rclone sync supabase_s3:photos /path/to/local/backup/photos
     ```

2. **Manual Download:**
   - Go to Supabase Dashboard -> **Storage**.
   - Select your bucket.
   - Select files and download them. (Note: Only feasible for a small number of files).

---

## 3. Restore Process

### Restoring the Database
1. Go to Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of your `backup_schema.sql` (if restoring to a new project) and run it.
3. Paste the contents of your `backup_data.sql` and run it.
*Note: Run schema first, then data.*

### Restoring Storage
1. Ensure your buckets (`products`, `categories`, etc.) exist.
2. Use Rclone to sync back:
   ```bash
   rclone sync /path/to/local/backup/products supabase_s3:products
   ```
3. Because the database contains the exact URL paths to these files, as long as the file names remain the same, they will automatically relink in your application.

---

## 4. Environment Recovery

If you ever need to rebuild the project on a new server or computer:
1. Clone the project code.
2. Ensure you have the `.env.local` file with the exact keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Run `npm install`.
4. Run `npm run build` and `npm start`.
