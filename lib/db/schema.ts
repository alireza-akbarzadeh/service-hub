import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
