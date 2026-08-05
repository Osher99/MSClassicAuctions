# Cloud Functions Setup Guide

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
# Navigate to functions directory
cd functions

# Set the email address
firebase functions:config:set email.user="your-email@gmail.com"

# Set the app password
firebase functions:config:set email.pass="your-16-character-app-password"

# Or using Firebase Secrets (v2 runtime - recommended):
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASS
```

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

### Development (.env.local)

```env
VITE_FUNCTIONS_BASE_URL=http://localhost:5001
```

### Production

The frontend uses Firebase Hosting rewrites to call `/contactForm`, which gets routed to the Cloud Function.

## 🐛 Troubleshooting

### 403 Forbidden Error
- Secrets are not deployed or not accessible
- Solution: Run `firebase functions:secrets:set` again and redeploy

### CORS Error
- Origin not in allowed list
- Solution: Add your origin to `allowedOrigins` in functions/src/index.ts

### Emails Not Sending
- Gmail credentials incorrect
- Gmail account has security restrictions
- Solution: 
  1. Create a new Gmail account or use an existing one
  2. Enable 2-factor authentication
  3. Create an app password (not your Gmail password)
  4. Update the secrets with correct credentials

### Function Timeout
- Email service is slow or not responding
- Solution: Check internet connection and Gmail service status

## 📚 Resources

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Secrets Documentation](https://firebase.google.com/docs/functions/config-env)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail Guide](https://nodemailer.com/smtp/gmail/)
