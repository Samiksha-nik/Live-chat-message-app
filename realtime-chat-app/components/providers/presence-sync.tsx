"use client";

import { usePresence } from "@/hooks/use-presence";

/**
 * Syncs presence (isOnline, lastSeen) with Convex when user is authenticated.
 * Renders nothing; only runs the presence effect.
 */
export function PresenceSync() {
  usePresence();
  return null;
}
