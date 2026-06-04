# 🎂 Lincoln's 6th Birthday RSVP Website
## Complete Setup & Deployment Guide

---

## 📁 Project Structure

```
lincoln-birthday/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout + SEO metadata
│   │   ├── page.tsx            ← Home page (invitation + RSVP)
│   │   ├── admin/page.tsx      ← Protected admin dashboard
│   │   ├── globals.css         ← Global styles + animations
│   │   └── api/rsvp/route.ts   ← Next.js API proxy to Google Sheets
│   ├── components/
│   │   ├── BirthdaySite.tsx    ← Main site layout
│   │   ├── Countdown.tsx       ← Live countdown timer
│   │   ├── RSVPForm.tsx        ← RSVP form with validation
│   │   ├── SuccessModal.tsx    ← Confetti success modal
│   │   └── AdminDashboard.tsx  ← Admin panel
│   └── lib/
│       └── types.ts            ← Shared TypeScript types
├── google-apps-script.gs       ← Google Sheets backend
├── .env.example                ← Environment variable template
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Step 1 — Google Sheets Setup

### A. Create your Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **Lincoln RSVP 2026**
4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`YOUR_SHEET_ID`**`/edit`

### B. Deploy the Apps Script

1. Inside the spreadsheet: **Extensions → Apps Script**
2. Delete the default `myFunction()` code
3. Paste the entire contents of `google-apps-script.gs`
4. Click **Save** (💾)
5. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** and **Authorize** when prompted
7. Copy the **Web App URL** — it looks like:
   `https://script.google.com/macros/s/AKfycbxXXXXXX/exec`

---

## ⚙️ Step 2 — Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Edit .env.local and add your Apps Script URL
#    NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

### Admin Dashboard
- URL: `http://localhost:3000/admin`
- Default password: `lincoln2026`
- Change the password in `.env.local`:
  `NEXT_PUBLIC_ADMIN_PASSWORD=your_new_password`

---

## 🌐 Step 3 — Deploy to Vercel

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts, then add environment variables:
vercel env add NEXT_PUBLIC_APPS_SCRIPT_URL
vercel env add NEXT_PUBLIC_ADMIN_PASSWORD

# Redeploy with env vars
vercel --prod
```

### Option B: Vercel Dashboard

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_APPS_SCRIPT_URL` | Your Apps Script URL |
   | `NEXT_PUBLIC_ADMIN_PASSWORD` | Your admin password |
5. Click **Deploy**

---

## 🔒 Security Notes

- The admin password is stored as an env variable — change it before going live
- The Google Apps Script sanitizes all inputs to prevent formula injection
- Set `NEXT_PUBLIC_APPS_SCRIPT_URL` in Vercel environment variables, never in code
- Consider restricting Apps Script access to your domain in production

---

## 🧪 Testing the Google Sheets Connection

After deploying the Apps Script, test it with this curl command:

```bash
curl -X POST "YOUR_APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "parentName": "Test Parent",
    "phone": "+254 700 000 000",
    "email": "test@test.com",
    "childName": "Test Child",
    "adults": 2,
    "children": 1,
    "attendance": "attending",
    "notes": "Test submission"
  }'
```

You should see a new row appear in your Google Sheet within seconds.

---

## 🔄 Updating the Apps Script

If you redeploy the Apps Script (e.g. after code changes), you'll get a **new URL**.
Make sure to update `NEXT_PUBLIC_APPS_SCRIPT_URL` in your `.env.local` and Vercel.

---

## 🎨 Customisation

| What to change | Where |
|----------------|-------|
| Event date/time | `src/components/Countdown.tsx` line 9 |
| Admin password | `.env.local` → `NEXT_PUBLIC_ADMIN_PASSWORD` |
| Google Maps embed | `src/components/BirthdaySite.tsx` → iframe src |
| Live stats numbers | `src/components/BirthdaySite.tsx` → StatCard values |
| SEO metadata | `src/app/layout.tsx` |

---

Made with ❤️ for Lincoln's 6th Birthday 🎂
