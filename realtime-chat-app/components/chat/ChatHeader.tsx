"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatHeaderProps = {
  name: string;
  avatar?: string;
  userId?: Id<"users">;
  onBack?: () => void;
  showBackButton?: boolean;
};

export function ChatHeader({
  name,
  avatar,
  userId,
  onBack,
  showBackButton = false,
}: ChatHeaderProps) {
  const presence = useQuery(
    api.presence.getUserPresence,
    userId ? { userId } : "skip"
  );

  const isOnline =
    presence != null && Date.now() - presence.lastSeen < 60_000;

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-card/50 px-4 py-3">
      {showBackButton && onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        {isOnline && (
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500"
            aria-hidden
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold">{name}</h2>
        <p className="text-xs text-muted-foreground">
          {isOnline ? "🟢 Online" : "⚪ Offline"}
        </p>
      </div>
    </header>
  );
}
