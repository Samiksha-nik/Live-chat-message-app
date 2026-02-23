import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Update the typing timestamp for the current user.
 * The userId must match the authenticated Convex user.
 */
export const updateTyping = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
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

    if (currentUser._id !== userId) {
      throw new Error("Typing userId does not match authenticated user");
    }

    await ctx.db.patch(userId, {
      typing: Date.now(),
    });
  },
});

