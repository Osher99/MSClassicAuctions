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

// Per-IP rate limit for contactForm: max REQUESTS within WINDOW_MS.
// Backed by Firestore since function instances don't share memory.
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

async function isRateLimited(ip: string): Promise<boolean> {
  const ref = admin.firestore().collection("rateLimits").doc(`contactForm_${ip}`);
  const now = Date.now();

  return admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    const requests: number[] = (data?.requests ?? []).filter(
      (t: number) => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
      return true;
    }

    requests.push(now);
    tx.set(ref, { requests, updatedAt: now });
    return false;
  });
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

    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";

    try {
      if (await isRateLimited(ip)) {
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
