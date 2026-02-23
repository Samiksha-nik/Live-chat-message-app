import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Upsert presence record for the current authenticated user.
 * lastSeen is stored as a millisecond timestamp.
 */
export const updatePresence = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Resolve the Convex user for the current identity.
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("Current user not found in Convex");
    }

    // Ensure the provided userId matches the authenticated Convex user.
    if (currentUser._id !== userId) {
      throw new Error("Presence userId does not match authenticated user");
    }

    const now = Date.now();

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: now });
      return existing._id;
    }

    return await ctx.db.insert("presence", {
      userId,
      lastSeen: now,
    });
  },
});

/**
 * Get presence record for a given user.
 */
export const getUserPresence = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

