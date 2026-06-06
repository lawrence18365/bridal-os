// Secure token generation for bride portal links.
//
// Portal links are unauthenticated (anyone with the link can view a bride's
// timeline, documents, and payment schedule), so the token is the only thing
// protecting that data. Math.random() is predictable and must never be used
// here. crypto.randomUUID() is backed by a CSPRNG and is available in the
// Convex runtime.
//
// We concatenate two UUIDs (hyphens stripped) to produce a 64-char,
// URL-safe, high-entropy token that is infeasible to guess or enumerate.
export function generatePortalToken(): string {
  return (
    crypto.randomUUID().replace(/-/g, "") +
    crypto.randomUUID().replace(/-/g, "")
  );
}
