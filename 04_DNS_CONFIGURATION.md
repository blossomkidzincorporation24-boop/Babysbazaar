# Hostinger DNS & Domain Configuration Guide

**Project:** Baby's Bazaar  
**Canonical Domain:** `https://babysbazaar.shop`  
**Hosting Destination:** Hostinger  

---

## 1. Overview

To point `babysbazaar.shop` to your Hostinger hosting and completely disconnect Vercel:

1. Obtain your **Hostinger Server IP Address** from your **Hostinger hPanel**.
2. Update DNS records in your domain registrar (where `babysbazaar.shop` was purchased, e.g., Hostinger DNS, GoDaddy, Namecheap, or Cloudflare DNS).
3. Ensure old Vercel records (`76.76.21.21` and `cname.vercel-dns.com`) are removed.

---

## 2. Required DNS Records Matrix

| Type | Name / Host | Target / Value | TTL | Purpose |
|---|---|---|---|---|
| **A** | `@` | `<YOUR_HOSTINGER_SERVER_IP>` | Auto / 3600 | Points root domain (`babysbazaar.shop`) to Hostinger |
| **CNAME** | `www` | `babysbazaar.shop` (or Hostinger pointer) | Auto / 3600 | Routes `www.babysbazaar.shop` to root domain |

> ⚠️ **Important:** Replace `<YOUR_HOSTINGER_SERVER_IP>` with the exact IP shown in your Hostinger hPanel under **Hosting Details** / **VPS Dashboard**.

---

## 3. How to Find Your Hostinger Server IP

1. Log into **[Hostinger hPanel](https://hpanel.hostinger.com)**.
2. If using **Hostinger Web / Cloud Hosting**:
   - Go to **Websites** → Click **Manage** on `babysbazaar.shop`.
   - On the left sidebar, click **Hosting** → **Plan Details**.
   - Note down the **Server IP Address**.
3. If using **Hostinger VPS (Ubuntu / Debian)**:
   - Go to **VPS** → Click your server instance.
   - Note down the **Primary IPv4 Address**.

---

## 4. SSL / HTTPS Certificate on Hostinger

1. In Hostinger hPanel, go to **Security** → **SSL**.
2. Click **Install SSL / Let's Encrypt** for `babysbazaar.shop` and `www.babysbazaar.shop`.
3. Enable **Force HTTPS** toggle so all `http://` traffic automatically redirects to `https://`.

---

## 5. Old Records to Delete

Ensure the following legacy Vercel records are **DELETED** from your DNS zone:
- ❌ `A` record pointing to `76.76.21.21`
- ❌ `CNAME` record pointing to `cname.vercel-dns.com`
