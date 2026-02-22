import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Find existing 1-on-1 conversation between current user and another user.
 */
export const getConversationByMembers = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const current = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!current) return null;

    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_member", (q) => q.eq("userId", current._id))
      .collect();

    for (const mem of myMemberships) {
      const members = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation", (q) => q.eq("conversationId", mem.conversationId))
        .collect();

      if (members.length !== 2) continue;
      const otherMember = members.find((m) => m.userId !== current._id);
      if (otherMember?.userId === otherUserId) {
        return await ctx.db.get(mem.conversationId);
      }
    }

    return null;
  },
});

/**
 * Get all conversations for the current user (1-on-1: includes other member info).
 */
export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const current = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!current) return [];

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_member", (q) => q.eq("userId", current._id))
      .collect();

    const result: Array<{
      _id: string;
      otherUser: {
        _id: string;
        name: string;
        email: string;
        imageUrl?: string;
        isOnline: boolean;
      };
      lastMessageId?: string;
      createdAt: number;
    }> = [];

    for (const mem of memberships) {
      const conv = await ctx.db.get(mem.conversationId);
      if (!conv) continue;

      const members = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation", (q) => q.eq("conversationId", mem.conversationId))
        .collect();

      const otherMember = members.find((m) => m.userId !== current._id);
      if (!otherMember) continue;

      const otherUser = await ctx.db.get(otherMember.userId);
      if (!otherUser) continue;

      result.push({
        _id: conv._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          imageUrl: otherUser.imageUrl,
          isOnline: otherUser.isOnline,
        },
        lastMessageId: conv.lastMessageId,
        createdAt: conv.createdAt ?? 0,
      });
    }

    result.sort((a, b) => b.createdAt - a.createdAt);
    return result;
  },
});

/**
 * Create a new 1-on-1 conversation between current user and another user.
 */
export const createConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const current = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!current) throw new Error("Current user not found in Convex");

    const other = await ctx.db.get(otherUserId);
    if (!other) throw new Error("Other user not found");

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      createdAt: now,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: current._id,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: otherUserId,
    });

    return conversationId;
  },
});

/**
 * Get or create a 1-on-1 conversation. Returns conversation ID.
 * Use this when the user clicks on someone to chat.
 */
export const getOrCreateConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const current = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!current) throw new Error("Current user not found in Convex");
    if (current._id === otherUserId) throw new Error("Cannot create conversation with yourself");

    const myMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_member", (q) => q.eq("userId", current._id))
      .collect();

    for (const mem of myMemberships) {
      const members = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation", (q) => q.eq("conversationId", mem.conversationId))
        .collect();

      if (members.length !== 2) continue;
      const otherMember = members.find((m) => m.userId !== current._id);
      if (otherMember?.userId === otherUserId) {
        return mem.conversationId;
      }
    }

    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      createdAt: now,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: current._id,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: otherUserId,
    });

    return conversationId;
  },
});
