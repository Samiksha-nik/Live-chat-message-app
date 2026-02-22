import type { AuthConfig } from "convex/server";

/**
 * Convex auth config for Clerk.
 * - Create a "convex" JWT template in Clerk (use the Convex preset, not Empty).
 * - Set CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard = your Clerk Issuer URL (no trailing slash).
 * Issuer must match the JWT "iss" claim exactly; we normalize to avoid slash mismatches.
 */
function getClerkIssuerDomain(): string {
  const raw = process.env.CLERK_JWT_ISSUER_DOMAIN ?? "";
  return raw.trim().replace(/\/+$/, "");
}

export default {
  providers: [
    {
      domain: getClerkIssuerDomain(),
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
