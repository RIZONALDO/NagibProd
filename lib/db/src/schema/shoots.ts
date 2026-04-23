import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shootsTable = pgTable("shoots", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location").notNull(),
  briefing: text("briefing"),
  whatsappSummary: text("whatsapp_summary"),
  producerName: text("producer_name"),
  clientProject: text("client_project"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("planned"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertShootSchema = createInsertSchema(shootsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShoot = z.infer<typeof insertShootSchema>;
export type Shoot = typeof shootsTable.$inferSelect;
