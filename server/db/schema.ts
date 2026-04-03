import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  pgEnum,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["user", "moderator", "admin"]);
export const poolStatusEnum = pgEnum("pool_status", ["open", "full", "completed", "cancelled"]);
export const participantStatusEnum = pgEnum("participant_status", ["joined", "left", "no_show"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "reviewed", "resolved", "dismissed"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "activity", "reminder", "social", "pool_full", "cancelled",
  "new_pool", "payment", "review", "milestone",
]);

// ── Users ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio").default(""),
  city: varchar("city", { length: 50 }).notNull().default("Bhopal"),
  phone: varchar("phone", { length: 20 }),
  sportsPlayed: text("sports_played").array().default([]),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalGames: integer("total_games").default(0),
  showUpRate: integer("show_up_rate").default(100),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  karma: integer("karma").default(0),
  isVerified: boolean("is_verified").default(false),
  role: userRoleEnum("role").default("user"),
  isBanned: boolean("is_banned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("users_username_idx").on(t.username),
  uniqueIndex("users_email_idx").on(t.email),
  index("users_city_idx").on(t.city),
]);

// ── Pools ──────────────────────────────────────────────
export const pools = pgTable("pools", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  hostId: uuid("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  city: varchar("city", { length: 50 }).notNull(),
  area: varchar("area", { length: 100 }).notNull(),
  venue: varchar("venue", { length: 200 }).default(""),
  description: text("description").default(""),
  tags: text("tags").array().default([]),
  skillLevel: varchar("skill_level", { length: 50 }),
  scheduledTime: timestamp("scheduled_time").notNull(),
  spotsTotal: integer("spots_total").notNull(),
  spotsFilled: integer("spots_filled").default(0),
  costPerHead: integer("cost_per_head").default(0),
  isLive: boolean("is_live").default(false),
  status: poolStatusEnum("status").default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("pools_city_status_idx").on(t.city, t.status),
  index("pools_host_idx").on(t.hostId),
  index("pools_category_idx").on(t.category),
  index("pools_scheduled_time_idx").on(t.scheduledTime),
]);

// ── Pool Participants ──────────────────────────────────
export const poolParticipants = pgTable("pool_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  poolId: uuid("pool_id").notNull().references(() => pools.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: participantStatusEnum("status").default("joined"),
  hasPaid: boolean("has_paid").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("pool_participants_unique").on(t.poolId, t.userId),
  index("pool_participants_pool_idx").on(t.poolId),
  index("pool_participants_user_idx").on(t.userId),
]);

// ── Follows ────────────────────────────────────────────
export const follows = pgTable("follows", {
  followerId: uuid("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: uuid("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  primaryKey({ columns: [t.followerId, t.followingId] }),
  index("follows_following_idx").on(t.followingId),
]);

// ── Conversations ──────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }),
  isGroup: boolean("is_group").default(false),
  emoji: varchar("emoji", { length: 10 }),
  poolId: uuid("pool_id").references(() => pools.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Conversation Members ───────────────────────────────
export const conversationMembers = pgTable("conversation_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("conv_members_unique").on(t.conversationId, t.userId),
  index("conv_members_conv_idx").on(t.conversationId),
]);

// ── Messages ───────────────────────────────────────────
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").references(() => users.id, { onDelete: "set null" }),
  text: text("text").notNull(),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("messages_conv_time_idx").on(t.conversationId, t.createdAt),
]);

// ── Notifications ──────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  text: text("text").notNull(),
  linkTo: varchar("link_to", { length: 255 }),
  actionLabel: varchar("action_label", { length: 50 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("notifications_user_read_idx").on(t.userId, t.isRead),
]);

// ── Venues ─────────────────────────────────────────────
export const venues = pgTable("venues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  address: text("address"),
  area: varchar("area", { length: 100 }).notNull(),
  city: varchar("city", { length: 50 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  amenities: text("amenities").array().default([]),
  sports: text("sports").array().default([]),
  poolsThisWeek: integer("pools_this_week").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("venues_city_idx").on(t.city),
]);

// ── Reviews ────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reviewedUserId: uuid("reviewed_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  poolId: uuid("pool_id").references(() => pools.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  text: text("text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Badges ─────────────────────────────────────────────
export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  icon: varchar("icon", { length: 10 }).notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
}, (t) => [
  index("badges_user_idx").on(t.userId),
]);

// ── Reports ────────────────────────────────────────────
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: uuid("reported_user_id").references(() => users.id, { onDelete: "set null" }),
  reportedPoolId: uuid("reported_pool_id").references(() => pools.id, { onDelete: "set null" }),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// ── Blocked Users ──────────────────────────────────────
export const blockedUsers = pgTable("blocked_users", {
  blockerId: uuid("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: uuid("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  primaryKey({ columns: [t.blockerId, t.blockedId] }),
]);

// ── Refresh Tokens ─────────────────────────────────────
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("refresh_tokens_user_idx").on(t.userId),
  index("refresh_tokens_token_idx").on(t.token),
]);

// ── Relations ──────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  hostedPools: many(pools),
  poolParticipations: many(poolParticipants),
  sentMessages: many(messages),
  notifications: many(notifications),
  badges: many(badges),
  givenReviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "reviewed" }),
}));

export const poolsRelations = relations(pools, ({ one, many }) => ({
  host: one(users, { fields: [pools.hostId], references: [users.id] }),
  participants: many(poolParticipants),
  conversation: one(conversations, { fields: [pools.id], references: [conversations.poolId] }),
}));

export const poolParticipantsRelations = relations(poolParticipants, ({ one }) => ({
  pool: one(pools, { fields: [poolParticipants.poolId], references: [pools.id] }),
  user: one(users, { fields: [poolParticipants.userId], references: [users.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  pool: one(pools, { fields: [conversations.poolId], references: [pools.id] }),
  members: many(conversationMembers),
  messages: many(messages),
}));

export const conversationMembersRelations = relations(conversationMembers, ({ one }) => ({
  conversation: one(conversations, { fields: [conversationMembers.conversationId], references: [conversations.id] }),
  user: one(users, { fields: [conversationMembers.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  user: one(users, { fields: [badges.userId], references: [users.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "reviewer" }),
  reviewedUser: one(users, { fields: [reviews.reviewedUserId], references: [users.id], relationName: "reviewed" }),
  pool: one(pools, { fields: [reviews.poolId], references: [pools.id] }),
}));
