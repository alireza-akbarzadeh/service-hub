import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("API"),
  environment: text("environment").notNull().default("All"),
  status: text("status").notNull().default("operational"),
  url: text("url").notNull(),
  owner: text("owner").default("Platform Team"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert

export const meetings = pgTable("meetings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  tehranTime: text("tehran_time").notNull(),
  durationMins: integer("duration_mins").notNull().default(30),
  platform: text("platform").notNull().default("Google Meet"),
  meetUrl: text("meet_url").notNull(),
  agenda: text("agenda").notNull().default(""),
  attendees: text("attendees").notNull().default("Frontend Squad"),
  notifyBeforeMins: integer("notify_before_mins").notNull().default(5),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type Meeting = typeof meetings.$inferSelect
export type NewMeeting = typeof meetings.$inferInsert

export const serviceHealthLogs = pgTable("service_health_logs", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull(), // "online" | "warning" | "error" | "offline"
  httpStatus: integer("http_status"),
  latencyMs: integer("latency_ms").notNull(),
  message: text("message").default(""),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
})

export type ServiceHealthLog = typeof serviceHealthLogs.$inferSelect
export type NewServiceHealthLog = typeof serviceHealthLogs.$inferInsert

export const chatChannels = pgTable("chat_channels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull().default(""),
  topic: text("topic").notNull().default(""),
  category: text("category").notNull().default("general"),
  icon: text("icon").notNull().default("Hash"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type ChatChannel = typeof chatChannels.$inferSelect
export type NewChatChannel = typeof chatChannels.$inferInsert

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id").notNull(),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderAvatar: text("sender_avatar").notNull(),
  senderColor: text("sender_color").notNull().default("#3b82f6"),
  senderUsername: text("sender_username"),
  isAnonymous: boolean("is_anonymous").default(true),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // "text" | "dice" | "coin" | "system"
  reactions: text("reactions").notNull().default("{}"), // JSON string
  replyTo: text("reply_to"), // JSON string { id, senderName, content, senderAvatar }
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert

export const feedbackRequests = pgTable("feedback_requests", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // "feature" | "bug" | "pull_request"
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetService: text("target_service").notNull().default("General"),
  priority: text("priority").notNull().default("medium"), // "low" | "medium" | "high" | "critical"
  status: text("status").notNull().default("open"), // "open" | "under_review" | "in_progress" | "merged" | "closed"
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull().default("Coworker"),
  authorEmail: text("author_email"),
  authorAvatar: text("author_avatar"),
  severity: text("severity"),
  environment: text("environment"),
  stepsToReproduce: text("steps_to_reproduce"),
  expectedBehavior: text("expected_behavior"),
  actualBehavior: text("actual_behavior"),
  branchName: text("branch_name"),
  prUrl: text("pr_url"),
  diffContent: text("diff_content"),
  testNotes: text("test_notes"),
  assignedTo: text("assigned_to"),
  reviewNotes: text("review_notes"),
  resolutionSummary: text("resolution_summary"),
  upvotes: integer("upvotes").notNull().default(0),
  upvotedBy: text("upvoted_by").notNull().default("[]"),
  tags: text("tags").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type FeedbackRequest = typeof feedbackRequests.$inferSelect
export type NewFeedbackRequest = typeof feedbackRequests.$inferInsert

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar").notNull().default("👤"),
  role: text("role").notNull().default("developer"), // "admin" | "developer" | "viewer"
  bio: text("bio").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type AppSetting = typeof appSettings.$inferSelect
export type NewAppSetting = typeof appSettings.$inferInsert

