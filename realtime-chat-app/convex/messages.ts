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

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId: currentUser._id,
      content: body,
      createdAt: now,
      deleted: false,
      seenBy: [currentUser._id],
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

