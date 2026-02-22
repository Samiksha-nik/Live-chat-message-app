"use client";

import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { PresenceSync } from "@/components/providers/presence-sync";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConvexClientProvider>
        <PresenceSync />
        {children}
      </ConvexClientProvider>
    </ThemeProvider>
  );
}
