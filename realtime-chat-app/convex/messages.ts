import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Send a message in a conversation.
 * - Sender is inferred from the current authenticated Convex user.
 * - Updates conversation.lastMessageId.
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    body: v.string(),
  },
  handler: async (ctx, { conversationId, body }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!currentUser) {
      throw new Error("Current user not found in Convex");
    }

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Ensure the user is a member of the conversation.
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", conversationId).eq("userId", currentUser._id)
      )
      .unique();

    if (!membership) {
      throw new Error("You are not a member of this conversation");
    }

    // Determine the receiver (the other member in this 1-on-1 conversation).
    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();

    const otherMember = members.find((m) => m.userId !== currentUser._id);
    if (!otherMember) {
      throw new Error("Could not determine receiver for this conversation");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId: currentUser._id,
      receiverId: otherMember.userId,
      content: body,
      createdAt: now,
      deleted: false,
      seenBy: [currentUser._id],
      isRead: false,
    });

    await ctx.db.patch(conversationId, {
      lastMessageId: messageId,
      createdAt: conversation.createdAt ?? now,
    });

    return messageId;
  },
});

/**
 * Get all messages for a conversation, ordered by createdAt ascending.
 */
export const getMessagesByConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();
  },
});

/**
 * Mark all messages in a conversation as read for a given user.
 */
export const markConversationAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, { conversationId, userId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", conversationId)
      )
      .collect();

    for (const msg of messages) {
      if (msg.receiverId === userId && msg.isRead !== true) {
        await ctx.db.patch(msg._id, { isRead: true });
      }
    }
  },
});

/**
 * Get unread message counts per conversation for a user.
 */
export const getUnreadCounts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .collect();

    const counts: Record<string, number> = {};

    for (const msg of unreadMessages) {
      // Treat missing isRead (older docs) as unread.
      if (msg.isRead !== true) {
        const key = msg.conversationId as string;
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }

    return counts;
  },
});

