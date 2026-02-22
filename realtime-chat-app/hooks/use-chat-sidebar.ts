"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type SidebarItem =
  | {
      type: "conversation";
      id: Id<"conversations">;
      name: string;
      avatar?: string;
      lastMessage: string;
      isOnline: boolean;
      unread?: number;
    }
  | {
      type: "user";
      id: Id<"users">;
      name: string;
      avatar?: string;
      lastMessage: string;
      isOnline: boolean;
    };

export function useChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const users = useQuery(api.users.getUsers);
  const conversations = useQuery(api.conversations.getUserConversations);
  const getOrCreateConversation = useMutation(
    api.conversations.getOrCreateConversation
  );

  const conversationUserIds = useMemo(() => {
    if (!conversations) return new Set<string>();
    return new Set(conversations.map((c) => c.otherUser._id));
  }, [conversations]);

  const filteredItems = useMemo((): SidebarItem[] => {
    const query = searchQuery.trim().toLowerCase();
    const match = (name: string) =>
      !query || name.toLowerCase().includes(query);

    const convItems: SidebarItem[] = (conversations ?? [])
      .filter((c) => match(c.otherUser.name))
      .map((c) => ({
        type: "conversation" as const,
        id: c._id,
        name: c.otherUser.name,
        avatar: c.otherUser.imageUrl,
        lastMessage: "No messages yet",
        isOnline: c.otherUser.isOnline,
        unread: 0,
      }));

    const userItems: SidebarItem[] = (users ?? [])
      .filter((u) => !conversationUserIds.has(u._id) && match(u.name))
      .map((u) => ({
        type: "user" as const,
        id: u._id,
        name: u.name,
        avatar: u.imageUrl,
        lastMessage: "Click to start chatting",
        isOnline: u.isOnline,
      }));

    return [...convItems, ...userItems];
  }, [conversations, users, conversationUserIds, searchQuery]);

  return {
    items: filteredItems,
    searchQuery,
    setSearchQuery,
    getOrCreateConversation,
    isLoading: users === undefined || conversations === undefined,
  };
}
