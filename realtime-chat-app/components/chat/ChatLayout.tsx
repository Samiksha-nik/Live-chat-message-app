"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "./Sidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

export type ChatLayoutProps = {
  currentUser: { name: string; avatar?: string };
};

export function ChatLayout({ currentUser }: ChatLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [typingNow, setTypingNow] = useState(() => Date.now());

  const conversations = useQuery(api.conversations.getUserConversations);
  const currentConvexUser = useQuery(api.users.getCurrentUser);
  const selectedConversation = selectedConversationId
    ? (conversations ?? []).find((c) => c._id === selectedConversationId)
    : null;

  const messages = useQuery(
    api.messages.getMessagesByConversation,
    selectedConversation
      ? { conversationId: selectedConversation._id }
      : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markConversationAsRead = useMutation(
    api.messages.markConversationAsRead
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingNow(Date.now());
    }, 1_000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMobileView("chat");

    if (currentConvexUser?._id) {
      markConversationAsRead({
        conversationId,
        userId: currentConvexUser._id,
      }).catch(() => {
        // Best-effort; ignore transient errors
      });
    }
  };

  const handleBack = () => {
    setMobileView("list");
  };

  const showSidebarOnMobile = !selectedConversation || mobileView === "list";
  const showChatOnMobile = selectedConversation && mobileView === "chat";

  const otherUserTypingTimestamp =
    selectedConversation?.otherUser.typing ?? undefined;
  const isTyping =
    otherUserTypingTimestamp != null &&
    typingNow - otherUserTypingTimestamp < 2_000;

  const handleSend = async (body: string) => {
    if (!selectedConversation) return;
    try {
      await sendMessage({
        conversationId: selectedConversation._id,
        body,
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

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
              userId={selectedConversation.otherUser._id}
              onBack={handleBack}
              showBackButton={true}
            />

<div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <MessageList
                messages={messages ?? []}
                currentUserId={currentConvexUser?._id ?? null}
                typingLabel={
                  isTyping
                    ? `${selectedConversation.otherUser.name} is typing...`
                    : null
                }
              />

              <ChatInput
                onSend={handleSend}
                disabled={!selectedConversation}
                currentUserId={currentConvexUser?._id ?? null}
              />
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

type MessageListProps = {
  messages: Array<{
    _id: string;
    content: string;
    createdAt: number;
    senderId: string;
  }>;
  currentUserId: string | null;
  typingLabel: string | null;
};

function MessageList({ messages, currentUserId, typingLabel }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const wasNearBottomRef = useRef(true);

  // Trigger a re-render every 60 seconds so relative timestamps stay fresh.
  useEffect(() => {
    const id = setInterval(() => {
      // State update just to force re-render; value is unused.
      setTick((t) => t + 1);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const [tick, setTick] = useState(0);

  // Auto-scroll when new messages arrive only if user was already near bottom.
  useEffect(() => {
    if (!containerRef.current) return;

    if (wasNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollButton(false);
    } else if (messages.length > 0) {
      setShowScrollButton(true);
    }
  }, [messages]);

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        onScroll={() => {
          if (!containerRef.current) return;

          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          const nearBottom = scrollHeight - scrollTop - clientHeight < 100;

          wasNearBottomRef.current = nearBottom;

          if (nearBottom) {
            setShowScrollButton(false);
          }
        }}
        className="h-full overflow-y-auto px-6 py-6"
      >
        {typingLabel && (
          <p className="mb-2 text-xs text-muted-foreground">{typingLabel}</p>
        )}
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              content={msg.content}
              createdAt={msg.createdAt}
              isSender={msg.senderId === currentUserId}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showScrollButton && (
        <button
          type="button"
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowScrollButton(false);
          }}
          className="absolute bottom-20 right-6 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg shadow-black/20 transition hover:bg-primary/90"
        >
          ↓ New Messages
        </button>
      )}
    </div>
  );
}

