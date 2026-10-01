# Hostinger Production Deployment Guide

**Application:** Baby's Bazaar  
**Framework:** Next.js 15 (App Router, Server Actions, Standalone Output)  
**Database:** Supabase PostgreSQL (`pyopqnrubhfknxsmuqkc`)  
**Storage:** Cloudflare R2 (`babys-bazaar-media`)  
**Production Domain:** `https://babysbazaar.shop`  

---

## Deployment Architecture

```text
User / Browser
      │
      ▼
https://babysbazaar.shop (Hostinger DNS + SSL)
      │
      ▼
Hostinger (Nginx Reverse Proxy / Port 3000)
      │
      ▼
Next.js Application (Node.js 20 LTS / PM2)
      │
      ├──▶ Supabase PostgreSQL (Auth, Products, Categories, Banners)
      └──▶ Cloudflare R2 CDN (Product Images, Videos, Public Media)
```

---

## Method A: Deploying via Hostinger VPS (Recommended for Best Performance)

### 1. Server Prerequisites
On your Hostinger Ubuntu VPS:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### 2. Clone and Setup Repository
```bash
# Clone the repository
cd /var/www
sudo git clone https://github.com/blossomkidzincorporation24-boop/Babysbazaar.git babysbazaar
cd babysbazaar

# Install dependencies
npm install

# Create production environment file
sudo nano .env
# (Paste the environment variables from 03_ENVIRONMENT_VARIABLES.md)
```

### 3. Build the Application
```bash
npm run build
```

### 4. Start Application with PM2
```bash
# Start with PM2
pm2 start npm --name "babysbazaar" -- start

# Save PM2 process list and configure auto-restart on server reboot
pm2 save
pm2 startup
```

### 5. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/babysbazaar.shop`:
```nginx
server {
    server_name babysbazaar.shop www.babysbazaar.shop;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and obtain SSL with Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/babysbazaar.shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install free Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d babysbazaar.shop -d www.babysbazaar.shop
```

---

## Method B: Deploying via Hostinger hPanel Node.js Application Manager

If your Hostinger plan includes the **Node.js Selector / Application Manager**:

1. In **hPanel**, go to **Advanced** → **Node.js**.
2. Click **Create Application**:
   - **Node.js Version:** `20.x` (or `18.x`)
   - **Application Mode:** `Production`
   - **Application Root:** `public_html/babysbazaar` (or `babysbazaar`)
   - **Application Startup File:** `node_modules/next/dist/bin/next` (or standalone server)
   - **Application URL:** `babysbazaar.shop`
3. Upload/Git clone your project files.
4. Add Environment Variables under the **Environment Variables** tab.
5. In the terminal / hPanel console, run:
   ```bash
   npm install
   npm run build
   ```
6. Click **Restart Application**.

---

## Updating & Redeploying
Whenever new code is pushed to `main`:
```bash
cd /var/www/babysbazaar
git pull origin main
npm install
npm run build
pm2 restart babysbazaar
```
