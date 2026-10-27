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
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // "text" | "dice" | "coin" | "system"
  reactions: text("reactions").notNull().default("{}"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
