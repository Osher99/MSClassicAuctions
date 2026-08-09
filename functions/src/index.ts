import { onRequest, Request } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import * as nodemailer from "nodemailer";
import * as admin from "firebase-admin";

admin.initializeApp();

// Define secrets
const emailUser = defineSecret("EMAIL_USER");
const emailPass = defineSecret("EMAIL_PASS");

// Caps how many requests can be in flight at once — bounds worst-case cost
// if the endpoint gets spammed or hit by a bot.
const MAX_INSTANCES = 5;

// Per-IP rate limit: max requests within a time window, keyed per endpoint.
// Backed by Firestore since function instances don't share memory.
const CONTACT_FORM_RATE_LIMIT = { maxRequests: 3, windowMs: 15 * 60 * 1000 };
const MARKETPLACE_STATS_RATE_LIMIT = { maxRequests: 30, windowMs: 5 * 60 * 1000 };

async function isRateLimited(
  endpoint: string,
  ip: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): Promise<boolean> {
  const ref = admin.firestore().collection("rateLimits").doc(`${endpoint}_${ip}`);
  const now = Date.now();

  return admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    const requests: number[] = (data?.requests ?? []).filter(
      (t: number) => now - t < windowMs
    );

    if (requests.length >= maxRequests) {
      return true;
    }

    requests.push(now);
    tx.set(ref, { requests, updatedAt: now });
    return false;
  });
}

// Cloud Run appends the real connecting client's IP to the END of any
// existing X-Forwarded-For value — the client fully controls everything
// before that, so the FIRST entry is spoofable and must not be trusted.
function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"] as string | undefined;
  return forwardedFor?.split(",").map((s) => s.trim()).filter(Boolean).pop() || req.ip || "unknown";
}

// Helper function for CORS headers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setCorsHeaders(req: Request, res: any): boolean {
  const origin = (req.headers.origin as string) || "*";
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
  ];

  if (allowedOrigins.includes(origin) || origin === "*") {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Max-Age", "3600");

  return true;
}

// 📩 Contact Form (HTTP)
export const contactForm = onRequest(
  {
    secrets: [emailUser, emailPass],
    maxInstances: MAX_INSTANCES,
  },
  async (req, res) => {
    // Handle preflight request
    if (req.method === "OPTIONS") {
      setCorsHeaders(req, res);
      res.status(204).send("");
      return;
    }

    // Set CORS headers for all requests
    setCorsHeaders(req, res);

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: "Missing fields: name, email, message" });
      return;
    }

    const ip = getClientIp(req);

    try {
      if (await isRateLimited("contactForm", ip, CONTACT_FORM_RATE_LIMIT)) {
        res.status(429).json({
          error: "Too many messages sent. Please try again later.",
        });
        return;
      }
    } catch (error) {
      console.error("Rate limit check failed:", error);
      // Fail open — don't block legitimate users if Firestore has a hiccup.
    }

    try {
      const from = emailUser.value();
      const pass = emailPass.value();

      if (!from || !pass) {
        console.error("Email credentials not configured");
        res.status(500).json({
          error: "Email service not configured. Please contact administrator.",
        });
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: from,
          pass,
        },
      });

      await transporter.sendMail({
        from,
        to: from,
        subject: "Contact Form Submission",
        text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
      });

      res.status(200).json({ message: "Message sent successfully!" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({
        error: "Failed to send message. Please try again later.",
      });
    }
  }
);

// 📊 Marketplace Stats (HTTP) — public counts for the homepage stats section
export const getMarketplaceStats = onRequest(
  { maxInstances: MAX_INSTANCES },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      setCorsHeaders(req, res);
      res.status(204).send("");
      return;
    }
    setCorsHeaders(req, res);

    const ip = getClientIp(req);

    try {
      if (await isRateLimited("getMarketplaceStats", ip, MARKETPLACE_STATS_RATE_LIMIT)) {
        res.status(429).json({ error: "Too many requests. Please try again later." });
        return;
      }
    } catch (error) {
      console.error("Rate limit check failed:", error);
      // Fail open — don't block legitimate users if Firestore has a hiccup.
    }

    try {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();
      const [usersCount, totalListingsCount, activeListingsCount] = await Promise.all([
        db.collection("users").count().get(),
        db.collection("listings").count().get(),
        db.collection("listings")
          .where("isActive", "==", true)
          .where("expiresAt", ">", now)
          .count()
          .get(),
      ]);

      res.status(200).json({
        users: usersCount.data().count,
        totalListings: totalListingsCount.data().count,
        activeListings: activeListingsCount.data().count,
      });
    } catch (error) {
      console.error("getMarketplaceStats error:", error);
      res.status(500).json({ error: "Failed to load stats" });
    }
  }
);

// 👤 New User Trigger (sends welcome email when user signs up)
// Fires on Firestore user-profile creation instead of the Auth event —
// v2 blocking auth triggers (beforeUserCreated) require upgrading the
// project to Google Cloud Identity Platform, which this project doesn't use.
export const notifyOnUserCreate = onDocumentCreated(
  {
    document: "users/{userId}",
    secrets: [emailUser, emailPass],
    maxInstances: MAX_INSTANCES,
  },
  async (event) => {
    try {
      const profile = event.data?.data();
      if (!profile) return;

      const from = emailUser.value();
      const pass = emailPass.value();

      if (!from || !pass) {
        console.error("Email credentials not configured");
        return;
      }

      const userEmail = profile.email as string | undefined;
      const userId = event.params.userId;

      console.log("📧 Sending welcome emails for user:", userEmail ?? "unknown");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: from,
          pass,
        },
      });

      // 📩 Admin notification
      await transporter.sendMail({
        from,
        to: from,
        subject: "👤 New user registered",
        text: `A new user has registered.\n\nEmail: ${userEmail ?? "N/A"}\nUID: ${userId}`,
      });

      // 📩 User welcome email
      if (userEmail) {
        await transporter.sendMail({
          from,
          to: userEmail,
          subject: "Welcome to MS Classic Auctions 🎉",
          html: `
<h2>Welcome to MS Classic Auctions 🎉</h2>
<p>Hi ${userEmail},</p>
<p>Your account has been created successfully!</p>
<p>We're happy to have you on our platform.</p>
<p>Start exploring and bid on amazing items!</p>
<p>Best regards,<br/>MS Classic Auctions Team</p>
          `,
        });
      }

      console.log("✓ Emails sent successfully for:", userEmail ?? "unknown user");
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  }
);
