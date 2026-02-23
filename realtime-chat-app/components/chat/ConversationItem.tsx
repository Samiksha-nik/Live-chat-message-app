"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export type ConversationItemProps = {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  unread?: number;
  isActive?: boolean;
  onClick?: () => void;
};

export function ConversationItem({
  userId,
  name,
  avatar,
  lastMessage,
  unread = 0,
  isActive = false,
  onClick,
}: ConversationItemProps) {
  const presence = useQuery(
    api.presence.getUserPresence,
    userId ? { userId } : "skip"
  );

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const isOnline =
    presence != null && now - presence.lastSeen < 60_000;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200",
        "hover:bg-muted/80",
        isActive && "bg-primary/10 hover:bg-primary/15"
      )}
    >
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
            isOnline ? "bg-green-500" : "bg-zinc-400 dark:bg-zinc-500"
          )}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm font-medium",
              isActive ? "text-primary" : "text-foreground"
            )}
          >
            {name}
          </span>
          {unread > 0 && (
            <span className="shrink-0 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{lastMessage}</p>
      </div>
    </button>
  );
}

