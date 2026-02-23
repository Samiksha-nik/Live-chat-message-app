"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

const HEARTBEAT_MS = 30_000;

/**
 * Syncs Clerk user to Convex and maintains real-time presence.
 *
 * - On mount: syncUser and immediately call updatePresence(currentUserId)
 * - Heartbeat: call updatePresence every 30s
 * - beforeunload: final updatePresence best-effort
 *
 * Presence is stored in the `presence` table; online/offline is derived
 * in the UI based on lastSeen.
 */
export function usePresence() {
  const { isLoaded, isSignedIn } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const syncUser = useMutation(api.users.syncUser);
  const updatePresence = useMutation(api.presence.updatePresence);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !convexUser?._id) return;

    const userId = convexUser._id;

    // Ensure user is synced in Convex.
    syncUser();

    const pushPresence = () => {
      updatePresence({ userId }).catch(() => {
        // Ignore transient errors; presence is best-effort.
      });
    };

    // Initial presence update.
    pushPresence();

    // Heartbeat every 30s.
    const intervalId = setInterval(pushPresence, HEARTBEAT_MS);

    const handleBeforeUnload = () => {
      pushPresence();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoaded, isSignedIn, convexUser?._id, syncUser, updatePresence]);
}

