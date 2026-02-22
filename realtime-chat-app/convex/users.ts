import { mutation, query } from "./_generated/server";

/**
 * Sync Clerk user to Convex. Create or update with full profile.
 * Call once on login/mount.
 */
export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const userData = {
      clerkId: identity.subject,
      name: (identity.name ?? identity.email ?? "Unknown") as string,
      email: (identity.email ?? "") as string,
      imageUrl: typeof identity.picture === "string" ? identity.picture : undefined,
      isOnline: true,
      lastSeen: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, userData);
      return existing._id;
    }

    return await ctx.db.insert("users", userData);
  },
});

/**
 * Set user online. Patch only — minimal write.
 * Call when tab becomes visible.
 */
export const setOnline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!existing) return null;

    await ctx.db.patch(existing._id, {
      isOnline: true,
      lastSeen: Date.now(),
    });

    return existing._id;
  },
});

/**
 * Set user offline. Patch only — minimal write.
 * Call when tab hidden (debounced) or beforeunload.
 */
export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!existing) return null;

    await ctx.db.patch(existing._id, {
      isOnline: false,
      lastSeen: Date.now(),
    });

    return existing._id;
  },
});

/**
 * Get current user by Clerk ID.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

/**
 * Get all users except the current user (by Clerk identity).
 */
export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const current = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!current) return [];

    const all = await ctx.db.query("users").collect();
    return all.filter((u) => u._id !== current._id);
  },
});
