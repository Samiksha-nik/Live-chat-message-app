import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema for ConvoFlow realtime chat.
 *
 * Note: "members" for conversations is modeled via conversationMembers
 * (Convex cannot index array fields; junction table enables efficient lookups).
 */
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
    typing: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  presence: defineTable({
    userId: v.id("users"),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    lastMessageId: v.optional(v.id("messages")),
    createdAt: v.optional(v.number()),
  })
    .index("by_last_message", ["lastMessageId"]),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_member", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    deleted: v.boolean(),
    seenBy: v.array(v.id("users")),
  })
  .index("by_conversation_createdAt", ["conversationId", "createdAt"])
  .index("by_sender", ["senderId"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"]),
});
