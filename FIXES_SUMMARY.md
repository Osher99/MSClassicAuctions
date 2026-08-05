# Firebase Cloud Functions - Fix Summary

## 🔧 Issues Fixed

### 1. CORS Errors (403 Forbidden)
**Problem**: The `contactForm` function had `cors: true` which doesn't work properly in Firebase Functions v2.

**Solution**:
- Created `setCorsHeaders()` helper function
- Added proper CORS headers for preflight and actual requests
- Handles OPTIONS method for CORS preflight
- Allows requests from localhost:5173, 5001, 3000

### 2. Email Credentials Not Working
**Problem**: Secrets weren't being properly validated and error messages were unclear.

**Solution**:
- Added explicit error handling for missing credentials
- Improved logging and debug messages
- Better error responses with JSON format

### 3. Development vs Production Endpoint Mismatch
**Problem**: Frontend was hardcoding `/contactForm` which only works in production with Firebase Hosting rewrites.

**Solution**:
- Created `src/services/functions.ts` utility with `getFunctionsURL()` function
- Supports both development (with env variable) and production (rewrites)
- Updated `useContactForm.ts` to use the utility

## 📁 Files Modified/Created

### Modified Files
1. **functions/src/index.ts**
   - Added CORS header helper function
   - Fixed contactForm error responses (now returns JSON)
   - Improved notifyOnUserCreate with better error handling and HTML email

2. **src/features/about/useContactForm.ts**
   - Now uses `getFunctionsURL()` utility
   - Better error handling and user feedback
   - Added error message display

3. **.env.example**
   - Added `VITE_FUNCTIONS_BASE_URL` for development

### Created Files
1. **src/services/functions.ts** - New utility for function URL resolution
2. **SETUP_FUNCTIONS.md** - Complete setup guide for deployment

## 🚀 Deployment Steps

### Step 1: Set Email Secrets
```bash
cd functions
firebase functions:secrets:set EMAIL_USER
# Paste your Gmail address

firebase functions:secrets:set EMAIL_PASS
# Paste your Gmail app password (16 characters)
```

### Step 2: Deploy Functions
```bash
firebase deploy --only functions
```

### Step 3: Build and Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

## ⚙️ Local Development Setup

1. Create `.env.local` in the project root:
```env
VITE_FUNCTIONS_BASE_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Start Firebase Emulator:
```bash
firebase emulators:start
```

3. Start Vite dev server (in another terminal):
```bash
npm run dev
```

## 🔍 Key Changes Explained

### CORS Configuration
```typescript
function setCorsHeaders(req, res) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
  ];
  // Set appropriate headers for each request
}
```

### Function URL Resolution
```typescript
export function getFunctionsURL(functionName: string): string {
  if (import.meta.env.DEV) {
    const baseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || "";
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "local-project";
    
    if (baseUrl) {
      return `${baseUrl}/${projectId}/us-central1/${functionName}`;
    }
  }
  return `/${functionName}`;
}
```

### Contact Form Error Handling
```typescript
const data = await res.json();
if (res.ok) {
  setStatus("✓ Message sent successfully!");
} else {
  setStatus(`❌ ${data.error || "Failed to send message."}`);
}
```

## ✅ Testing Checklist

- [ ] Firebase secrets are set
- [ ] Functions are deployed
- [ ] Frontend is built (npm run build)
- [ ] Contact form submission works locally
- [ ] Contact form submission works in production
- [ ] User registration welcome email is sent
- [ ] No CORS errors in browser console
- [ ] No 403 errors in function logs

## 📚 Troubleshooting

If you get **403 Forbidden**:
1. Check if secrets are deployed: `firebase functions:secrets:list`
2. Verify secrets are correct
3. Redeploy: `firebase deploy --only functions`

If you get **CORS errors**:
1. Check your localhost port matches one of the allowed origins
2. Verify request has proper Content-Type header
3. Check browser console for exact error message

If **emails don't send**:
1. Verify Gmail app password (must be 16 characters)
2. Check Gmail account has 2-factor authentication enabled
3. Review function logs: `firebase functions:log`

## 📖 Additional Resources

- See `SETUP_FUNCTIONS.md` for detailed Gmail setup instructions
- See `README.md` for project overview
- See `.env.example` for all environment variables
