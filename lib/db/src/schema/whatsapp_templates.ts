import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const whatsappTemplatesTable = pgTable("whatsapp_templates", {
  id: serial("id").primaryKey(),
  templateKey: text("template_key").notNull().unique(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type WhatsappTemplate = typeof whatsappTemplatesTable.$inferSelect;
