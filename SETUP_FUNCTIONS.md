# Cloud Functions Setup Guide

> For current deployment status, secrets, and known gotchas, see
> [`STATE.md`](STATE.md) — this file is a setup walkthrough, not a
> live status page.

This guide explains how to configure and deploy the Firebase Cloud Functions for email notifications.

## 📧 Email Functions

There are two main email functions:

1. **contactForm**: HTTP endpoint for contact form submissions
2. **notifyOnUserCreate**: Trigger that sends welcome emails when users sign up

## 🔧 Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Gmail account with an app password (Gmail doesn't allow regular password for apps)
- Firebase project configured

## 🚀 Setup Steps

### 1. Generate Gmail App Password

Follow Google's guide to create an App Password:
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Navigate to **Security** → **App passwords**
3. Select "Mail" and "Windows Computer"
4. Generate an app password
5. Copy the generated 16-character password

### 2. Set Firebase Secrets

Deploy the secrets to Firebase Cloud Functions:

```bash
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASS
```
(`firebase functions:config:set` is the old v1 config API — this
project's functions are v2 and only read secrets via `defineSecret`,
so `functions:config:set` has no effect here. Don't use it.)

When prompted, paste:
- **EMAIL_USER**: Your Gmail address (e.g., `noreply@yourdomain.com`)
- **EMAIL_PASS**: The 16-character app password from Gmail

### 3. Verify Secrets Are Set

```bash
# List all secrets
firebase functions:secrets:list
```

### 4. Deploy Functions

```bash
# Deploy only functions
firebase deploy --only functions

# Or deploy everything
firebase deploy
```

### 5. Verify Deployment

```bash
# View function logs
firebase functions:log

# Test the contactForm function
curl -X POST https://[REGION]-[PROJECT_ID].cloudfunctions.net/contactForm \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

## 🧪 Local Development

To test locally with Firebase Emulator:

```bash
# Start Firebase Emulator Suite
firebase emulators:start

# In another terminal, deploy secrets locally
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASS
```

Then the functions will be available at:
- Contact Form: `http://localhost:5001/[PROJECT_ID]/us-central1/contactForm`
- Relative path: `/contactForm` (with Firebase Hosting emulator)

## 🔒 CORS Configuration

The functions have CORS enabled for:
- `http://localhost:5173` (Vite dev)
- `http://localhost:4173` (Vite preview)
- `http://localhost:3000` (Common dev port)

To add more origins, edit `functions/src/index.ts` in the `allowedOrigins` array.

## 📝 Frontend Configuration

### Development (.env.development.local)

```env
VITE_FUNCTIONS_BASE_URL=http://localhost:5001
```

Use `.env.development.local`, not `.env.local` — Vite loads `.env.local`
in production builds too, which would bake dev/placeholder values into
what you deploy.

### Production

The frontend uses Firebase Hosting rewrites to call `/contactForm`, which gets routed to the Cloud Function.

## 🐛 Troubleshooting

### 403 Forbidden Error
Usually means the request never reached the function at all — check
in this order:
1. Billing enabled on the project? (`gcloud billing projects describe <project-id>`)
2. Public invoker permission present? (`gcloud functions get-iam-policy <fn> --region=us-central1` — empty bindings means `allUsers` isn't granted; billing outages strip this and it isn't auto-restored)
3. Only then: secrets not deployed/accessible — `firebase functions:secrets:set` again and redeploy

### CORS Error
- Origin not in allowed list
- Solution: Add your origin to `allowedOrigins` in functions/src/index.ts

### Emails Not Sending (SMTP `Invalid login` / 535 error)
- The app password must belong to the **exact** Gmail account in
  `EMAIL_USER` — generating it while logged into a different Google
  account (e.g. your personal one) produces a password that
  authenticates fine but gets rejected for this account
- That account needs 2-Step Verification turned on before
  `myaccount.google.com/apppasswords` is even reachable — if it says
  "The setting you are looking for is not available for your account",
  that's why
- After rotating the secret, you must redeploy
  (`firebase deploy --only functions`) — functions keep running on the
  secret *version* they were deployed with, they don't pick up a new
  value automatically

### Function Timeout
- Email service is slow or not responding
- Solution: Check internet connection and Gmail service status

## 📚 Resources

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Secrets Documentation](https://firebase.google.com/docs/functions/config-env)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail Guide](https://nodemailer.com/smtp/gmail/)
