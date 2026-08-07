# 🚀 Quick Start - Deploy Your Fixed Functions

> For current deployment status, secrets, and known gotchas, see
> [`STATE.md`](STATE.md) — this file is a setup walkthrough, not a
> live status page.

## What Was Fixed ✅

1. **CORS Errors (403)** - Fixed improper CORS header handling
2. **Missing Secrets** - Added validation and clear error messages  
3. **Development/Production URL Mismatch** - Created flexible endpoint routing
4. **Email Welcome System** - `notifyOnUserCreate` now fires on the
   `users/{userId}` Firestore write instead of a v2 blocking auth
   trigger (which needs Google Cloud Identity Platform — see `STATE.md`)

---

## ⚡ 3-Minute Setup

### 1️⃣ Get Gmail App Password

Visit: https://myaccount.google.com/apppasswords
- Select "Mail" and "Windows Computer"
- Copy the 16-character password

### 2️⃣ Deploy Secrets to Firebase

```bash
cd functions
firebase functions:secrets:set EMAIL_USER
# Paste your Gmail address (e.g., noreply@yourcompany.com)

firebase functions:secrets:set EMAIL_PASS  
# Paste the 16-character app password
```

### 3️⃣ Deploy Functions

```bash
firebase deploy --only functions
```

### 4️⃣ Build & Deploy Frontend

```bash
npm run build
firebase deploy --only hosting
```

---

## 🧪 Test It Locally

1. Create `.env.development.local` in your project root (NOT `.env.local`
   — Vite loads `.env.local` in production builds too, so dev-only
   placeholder values belong in the mode-scoped file):
```env
VITE_FUNCTIONS_BASE_URL=http://localhost:5001
```

2. Start Firebase Emulator:
```bash
firebase emulators:start
```

3. In another terminal, start Vite:
```bash
npm run dev
```

4. Visit http://localhost:5173/about and test the contact form!

---

## 📋 Changed Files Summary

| File | Change |
|------|--------|
| `functions/src/index.ts` | ✅ Fixed CORS, improved error handling |
| `src/features/about/useContactForm.ts` | ✅ Updated to use dynamic endpoint |
| `src/services/functions.ts` | ✅ NEW - URL resolution utility |
| `.env.example` | ✅ Added VITE_FUNCTIONS_BASE_URL |
| `SETUP_FUNCTIONS.md` | ✅ NEW - Complete setup guide |
| `FIXES_SUMMARY.md` | ✅ NEW - Detailed technical summary |

---

## 🔗 How It Works Now

```
Frontend (React)
    ↓
useContactForm.ts → getFunctionsURL("contactForm")
    ↓
Development: http://localhost:5001/[PROJECT_ID]/us-central1/contactForm
Production: /contactForm (Firebase Hosting rewrite)
    ↓
Cloud Function with proper CORS headers
    ↓
Gmail via Nodemailer
```

---

## ❓ Common Issues & Solutions

### "403 Forbidden" Error
This is usually **not** a secrets or CORS problem — it means the
request never reached your code. Two real causes we've hit:

1. **Billing disabled on the project.** Cloud Functions stop serving
   entirely (503, then 403) if the Blaze plan billing account gets
   disconnected. Check: `gcloud billing projects describe <project-id>`.
2. **Missing public invoker permission.** When billing gets re-enabled
   after being disabled, Google does NOT automatically restore the
   `allUsers` invoker role on HTTP functions. Check:
   `gcloud functions get-iam-policy contactForm --region=us-central1`
   — if bindings are empty, restore with:
   `gcloud functions add-invoker-policy-binding contactForm --region=us-central1 --member=allUsers`

Only after ruling those out is it worth checking secrets:
```bash
firebase functions:secrets:list
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASS
firebase deploy --only functions
```

### "CORS Error" in Browser
- Check your localhost port is in `allowedOrigins` (5173, 5001, 3000)
- If using different port, edit `functions/src/index.ts` line 15-19

### "Email Not Sending"
1. Verify Gmail has 2-factor authentication enabled
2. Verify app password is 16 characters
3. Check function logs: `firebase functions:log`

---

## 📚 Documentation

- **Quick Reference**: This file
- **Setup Guide**: See `SETUP_FUNCTIONS.md`
- **Technical Details**: See `FIXES_SUMMARY.md`
- **Environment Example**: See `.env.example`

---

## ✨ Next Steps

1. Follow the 3-minute setup above
2. Test locally with Firebase Emulator
3. Test production deployment
4. Monitor function logs for any issues: `firebase functions:log`

Questions? Check the documentation files or see the `notifyOnUserCreate` and `contactForm` functions in `functions/src/index.ts`!
