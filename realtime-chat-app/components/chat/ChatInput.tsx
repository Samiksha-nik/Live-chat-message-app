"use client";

import { Send } from "lucide-react";

export type ChatInputProps = {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
};

export function ChatInput({
  placeholder = "Type a message...",
  onSend,
  disabled = false,
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const value = input?.value?.trim();
    if (value && onSend) {
      onSend(value);
      input.value = "";
    }
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
