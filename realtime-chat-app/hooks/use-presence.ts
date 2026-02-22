"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";

const OFFLINE_DEBOUNCE_MS = 2000;

/**
 * Syncs user to Convex and manages presence (isOnline, lastSeen).
 * - Mount: syncUser (create/update)
 * - Tab visible: setOnline
 * - Tab hidden: debounced setOffline
 * - beforeunload: setOffline (best-effort)
 */
export function usePresence() {
  const { isLoaded, isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const setOnline = useMutation(api.users.setOnline);
  const setOffline = useMutation(api.users.setOffline);
  const offlineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVisible = useCallback(() => {
    if (offlineTimeoutRef.current) {
      clearTimeout(offlineTimeoutRef.current);
      offlineTimeoutRef.current = null;
    }
    setOnline();
  }, [setOnline]);

  const handleHidden = useCallback(() => {
    if (offlineTimeoutRef.current) return;
    offlineTimeoutRef.current = setTimeout(() => {
      offlineTimeoutRef.current = null;
      setOffline();
    }, OFFLINE_DEBOUNCE_MS);
  }, [setOffline]);

  const handleBeforeUnload = useCallback(() => {
    setOffline();
  }, [setOffline]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    syncUser();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleVisible();
      } else {
        handleHidden();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
        offlineTimeoutRef.current = null;
      }
    };
  }, [isLoaded, isSignedIn, syncUser, handleVisible, handleHidden, handleBeforeUnload]);
}
