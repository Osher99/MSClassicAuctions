import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Some browsers/networks (privacy extensions, strict third-party-cookie
// partitioning, corporate proxies) block Firestore's default streaming
// transport, surfacing as "unavailable"/"Connection failed" errors on
// aggregation queries and writes. Auto-detecting long-polling falls back
// to a transport that works everywhere without forcing it (and its extra
// latency) on connections that don't need it.
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
export const storage = getStorage(app);
