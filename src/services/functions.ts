/**
 * Get the base URL for Cloud Functions
 * - In production with Firebase Hosting: uses relative path /contactForm
 * - In development: uses environment variable pointing to emulator or deployed function
 */
export function getFunctionsURL(functionName: string): string {
  if (import.meta.env.DEV) {
    // Development mode - use environment variable or default to relative path
    const baseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || "";
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "local-project";
    const region = "us-central1";

    if (baseUrl) {
      return `${baseUrl}/${projectId}/${region}/${functionName}`;
    }

    // Fallback to relative path (works with Firebase emulator and hosting rewrites)
    return `/${functionName}`;
  }

  // Production mode - use relative path with Firebase Hosting rewrites
  return `/${functionName}`;
}
