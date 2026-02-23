"use client";

import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/format-time";

export type MessageBubbleProps = {
  content: string;
  isSender: boolean;
  createdAt: number;
};

export function MessageBubble({
  content,
  isSender,
  createdAt,
}: MessageBubbleProps) {
  const timestamp = formatMessageTime(createdAt);

  return (
    <div
      className={cn(
        "flex w-full",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm animate-in fade-in-0 duration-150",
          isSender
            ? "bg-primary text-primary-foreground"
            : "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        )}
      >
        <div>{content}</div>
        <div className="mt-1 text-[10px] text-muted-foreground text-right">
          {timestamp}
        </div>
      </div>
    </div>
  );
}


