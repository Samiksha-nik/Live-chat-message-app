"use client";

import { MessageCircle, Search, Settings } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { useChatSidebar } from "@/hooks/use-chat-sidebar";
import { cn } from "@/lib/utils";

export type SidebarProps = {
  selectedId: string | null;
  currentUser: { name: string; avatar?: string };
  onSelectConversation: (conversationId: string) => void;
};

export function Sidebar({
  selectedId,
  currentUser,
  onSelectConversation,
}: SidebarProps) {
  const {
    items,
    searchQuery,
    setSearchQuery,
    getOrCreateConversation,
    isLoading,
  } = useChatSidebar();

  const handleItemClick = async (item: (typeof items)[0]) => {
    if (item.type === "conversation") {
      onSelectConversation(item.id);
      return;
    }
    try {
      const conversationId = await getOrCreateConversation({ otherUserId: item.id });
      onSelectConversation(conversationId);
    } catch {
      // Error already surfaced by Convex
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-border/60 bg-card/50",
        "md:w-[300px] md:shrink-0"
      )}
    >
      {/* Top section */}
      <div className="shrink-0 space-y-4 border-b border-border/60 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            <MessageCircle className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            ConvoFlow
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-background/80 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-3 text-xs text-muted-foreground">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No conversations yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Search for someone to start a conversation
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {items.map((item) => (
              <ConversationItem
                key={item.type + item.id}
                id={item.id}
                userId={item.userId}
                name={item.name}
                avatar={item.avatar}
                lastMessage={item.lastMessage}
                unread={item.unread}
                isActive={selectedId === item.id}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User profile section */}
      <div className="shrink-0 border-t border-border/60 p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-sm font-medium text-primary">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{currentUser.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{currentUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">Online</p>
          </div>
          <button
            type="button"
            aria-label="Settings"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
