"use client";

import { cn } from "@/lib/utils";

export type MessageBubbleProps = {
  content: string;
  isSender: boolean;
};

export function MessageBubble({ content, isSender }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
          isSender
            ? "bg-primary text-primary-foreground"
            : "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        )}
      >
        {content}
      </div>
    </div>
  );
}
