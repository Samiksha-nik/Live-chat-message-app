"use client";

import { MessageCircle } from "lucide-react";
import { SignedIn, UserButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm shadow-black/5">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              ConvoFlow
            </span>
            <span className="text-xs text-muted-foreground">
              Realtime conversations, refined.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <SignedIn>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-1.5 py-1 shadow-sm shadow-black/5">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-7 w-7",
                  },
                }}
              />
              {user ? (
                <span className="max-w-[140px] truncate text-xs font-medium text-muted-foreground">
                  {user.fullName || user.username || user.primaryEmailAddress
                    ?.emailAddress}
                </span>
              ) : null}
              <SignOutButton>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  Logout
                </Button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      </Container>
    </header>
  );
}

