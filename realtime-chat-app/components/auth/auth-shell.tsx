import * as React from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-soft-lg backdrop-blur-md md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:p-8">
        <div className="flex flex-col justify-between gap-8 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 py-6 md:px-8 md:py-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-background/60 px-3 py-1 shadow-soft text-xs font-medium text-primary">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="h-3.5 w-3.5" />
            </span>
            <span>ConvoFlow · Realtime collaboration</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-md text-sm text-muted-foreground md:text-[0.9rem]">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="mt-auto hidden text-[0.78rem] text-muted-foreground/80 md:block">
            Designed for modern product teams. Inspired by Linear, Slack, and
            Notion.
          </div>
        </div>

        <div
          className={cn(
            "flex items-center justify-center",
            "rounded-xl bg-background/80 p-5 shadow-soft"
          )}
        >
          <div className="w-full max-w-sm space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

