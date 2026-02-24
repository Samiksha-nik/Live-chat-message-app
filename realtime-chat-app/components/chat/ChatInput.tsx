"use client";

import { useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Send } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export type ChatInputProps = {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
  currentUserId?: string | null;
};

export function ChatInput({
  placeholder = "Type a message...",
  onSend,
  disabled = false,
  currentUserId,
}: ChatInputProps) {
  const updateTyping = useMutation(api.typing.updateTyping);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);

  const handleTyping = () => {
    if (!currentUserId || disabled) return;

    const now = Date.now();

    // Send only if last sent more than 1500ms ago.
    if (now - lastTypingSentRef.current > 1500) {
      updateTyping({ userId: currentUserId as Id<"users"> }).catch(() => {
        // Best-effort; ignore transient errors.
      });
      lastTypingSentRef.current = now;
    }

    // Clear previous timeout.
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset local typing state after 2 seconds of inactivity.
    typingTimeoutRef.current = setTimeout(() => {
      lastTypingSentRef.current = 0;
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const value = input?.value?.trim();
    if (value && onSend) {
      onSend(value);
      input.value = "";

      // Clear typing state immediately after sending a message.
      lastTypingSentRef.current = 0;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Let parent handle the actual message text if needed.
    void e;
    handleTyping();
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-card/50 px-4 py-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 rounded-2xl border border-border/80 bg-background px-3 py-2 shadow-sm"
      >
        <input
          name="message"
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          disabled={disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
