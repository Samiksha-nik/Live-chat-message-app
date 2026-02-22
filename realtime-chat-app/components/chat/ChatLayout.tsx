"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "./Sidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

export type MockMessage = {
  id: string;
  content: string;
  isSender: boolean;
};

export type ChatLayoutProps = {
  messages?: MockMessage[];
  currentUser: { name: string; avatar?: string };
};

const PLACEHOLDER_MESSAGES: MockMessage[] = [];

export function ChatLayout({
  messages = PLACEHOLDER_MESSAGES,
  currentUser,
}: ChatLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const conversations = useQuery(api.conversations.getUserConversations);
  const selectedConversation = selectedConversationId
    ? (conversations ?? []).find((c) => c._id === selectedConversationId)
    : null;

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("list");
  };

  const showSidebarOnMobile = !selectedConversation || mobileView === "list";
  const showChatOnMobile = selectedConversation && mobileView === "chat";

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <div
        className={`h-full shrink-0 transition-all duration-200 ${
          showSidebarOnMobile ? "flex" : "hidden md:flex"
        }`}
      >
        <Sidebar
          selectedId={selectedConversationId}
          currentUser={currentUser}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col transition-all duration-200 ${
          showChatOnMobile ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedConversation ? (
          <>
            <ChatHeader
              name={selectedConversation.otherUser.name}
              avatar={selectedConversation.otherUser.imageUrl}
              isOnline={selectedConversation.otherUser.isOnline}
              onBack={handleBack}
              showBackButton={true}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      content={msg.content}
                      isSender={msg.isSender}
                    />
                  ))}
                </div>
              </div>

              <ChatInput />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-base font-medium text-muted-foreground">
              Start chatting by selecting a conversation
            </p>
            <p className="mt-1 text-sm text-muted-foreground/80">
              Choose from the list or start a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
