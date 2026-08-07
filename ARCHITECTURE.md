# Architecture & Changes Overview

> This file documents the contact-form/email architecture specifically.
> For current deployment status, secrets, and known gotchas across the
> whole project, see [`STATE.md`](STATE.md).

## 🔄 Before vs After

### BEFORE ❌
```
Frontend: fetch("/contactForm", {...})
    ↓
Firebase Dev: ??? (doesn't work, no rewrite in emulator)
Firebase Prod: /contactForm → Cloud Function (rewrite works)
    ↓
Cloud Function: 
  - cors: true (doesn't work in v2)
  - No CORS headers manually set
  - Result: CORS & 403 errors
    ↓
Gmail: Might not send if secrets are wrong
```

### AFTER ✅
```
Frontend: fetch(getFunctionsURL("contactForm"), {...})
    ↓
getFunctionsURL() helper:
  Dev: http://localhost:5001/[PROJECT_ID]/us-central1/contactForm
  Prod: /contactForm
    ↓
Cloud Function with proper CORS:
  - OPTIONS requests handled
  - Correct CORS headers set
  - Better error messages
  - Secrets validated
    ↓
Gmail: Sends successfully with app password
```

---

## 📦 Component Structure

```
src/
├── features/about/
│   ├── useContactForm.ts ← Updated to use getFunctionsURL()
│   ├── AboutPage.tsx
│   └── index.ts
├── services/
│   ├── functions.ts ← NEW: URL resolution logic
│   └── index.ts
└── ...

functions/src/
├── index.ts ← Updated with CORS helper + improved error handling
└── ...

Root:
├── .env.example ← Added VITE_FUNCTIONS_BASE_URL
├── firebase.json ← Already correct (hosting rewrite)
├── QUICK_START.md ← NEW: 3-minute setup guide
├── SETUP_FUNCTIONS.md ← NEW: Detailed setup
└── FIXES_SUMMARY.md ← NEW: Technical details
```

---

## 🔐 Secrets Flow

```
Gmail Account with 2FA
    ↓
Create App Password (16 chars)
    ↓
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASS
    ↓
Firebase Secrets Manager
    ↓
Cloud Function at runtime
    ↓
Nodemailer sends via Gmail SMTP
    ↓
Email delivered ✅
```

---

## 🌐 CORS Configuration

```
Request from Browser:
  Origin: http://localhost:5173
  Method: POST
  ↓
setCorsHeaders() function:
  - Checks if origin is in allowedOrigins
  - Sets Access-Control-Allow-Origin header
  - Sets other required CORS headers
  - Handles OPTIONS preflight
  ↓
Response with CORS headers:
  Access-Control-Allow-Origin: http://localhost:5173
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
  ↓
Browser accepts response ✅
```

---

## 📊 Function Call Flow

### Contact Form (HTTP Function)

```
User fills form → Click "Send"
    ↓
useContactForm.handleSubmit()
    ↓
fetch(getFunctionsURL("contactForm"), {
  method: "POST",
  body: {name, email, message}
})
    ↓
Cloud Function: contactForm
    ↓
1. Handle preflight (OPTIONS)
2. Set CORS headers
3. Validate input
4. Get email credentials from secrets
5. Create transporter (Gmail SMTP)
6. Send email
7. Return success/error response
```

### User Registration (Firestore Trigger)

```
User signs up (Firebase Auth) → createUserProfile() writes users/{uid}
    ↓
Triggers: onDocumentCreated("users/{userId}")
    ↓
Cloud Function: notifyOnUserCreate
    ↓
1. Read the new profile doc (email, uid)
2. Get email credentials from secrets
3. Create transporter (Gmail SMTP)
4. Send admin notification
5. Send welcome email to user
6. Log success
```

> Note: this used to be a v2 `beforeUserCreated` **blocking** auth trigger.
> That requires the Firebase project to be upgraded to Google Cloud
> Identity Platform (GCIP), which this project isn't on — deploying it
> fails with `Blocking Functions may only be configured for GCIP
> projects`. Firing off the `users/{userId}` Firestore write instead
> (which already happens right after signup) avoids that requirement
> entirely with the same effect. See `STATE.md` for the full story.

---

## 🔍 Error Handling

```
Try to send email
    ↓
Missing credentials?
├─ Yes → Return 500 with clear error message
└─ No → Continue
    ↓
SMTP error?
├─ Yes → Log error, return 500
└─ No → Return 200 success
```

---

## 📱 Request/Response Examples

### Contact Form Request
```javascript
POST /contactForm

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Great website!"
}
```

### Successful Response
```json
{
  "message": "Message sent successfully!"
}
```

### Error Response
```json
{
  "error": "Email service not configured. Please contact administrator."
}
```

---

## 🎯 Environment Variables

### Development (.env.development.local)
```env
VITE_FUNCTIONS_BASE_URL=http://localhost:5001
VITE_FIREBASE_PROJECT_ID=your-project-id
```
Vite loads `.env.local` in **every** mode, including production builds —
that's the wrong file for dev-only/dummy values. `.env.development.local`
only applies when running `vite`/`vite dev` (mode `development`), so a
plain `npm run build` can never accidentally bundle placeholder values.

### Production (Firebase)
Secrets in Firebase Functions:
- `EMAIL_USER`: Gmail address
- `EMAIL_PASS`: 16-char app password

---

## ✅ Testing Checklist

```
[ ] Firebase secrets deployed
[ ] Functions deployed
[ ] Frontend built
[ ] Vite dev server running
[ ] Contact form loads
[ ] Form submission works (no CORS error)
[ ] Response shows success message
[ ] Email received in inbox
[ ] Function logs show no errors
```

---

## 🚀 Deployment Checklist

```
[ ] Gmail account has 2FA enabled
[ ] App password generated (16 chars) — must be for the exact Gmail
    account in EMAIL_USER, not whichever Google account you're logged
    into when generating it
[ ] Secrets set: firebase functions:secrets:set EMAIL_USER
[ ] Secrets set: firebase functions:secrets:set EMAIL_PASS
[ ] Functions deployed: firebase deploy --only functions
    (firebase.json's predeploy hook now runs `npm run build` for you —
    no need to build functions/ manually first)
[ ] Frontend built: npm run build
[ ] Frontend deployed: firebase deploy --only hosting
[ ] Test contact form in production
[ ] Monitor logs: firebase functions:log
```
