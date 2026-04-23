import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { equipmentTable } from "./equipment";

export const equipmentLinksTable = pgTable("equipment_links", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id, { onDelete: "cascade" }),
  linkedEquipmentId: integer("linked_equipment_id").notNull().references(() => equipmentTable.id, { onDelete: "cascade" }),
  defaultQuantity: integer("default_quantity").notNull().default(1),
  required: boolean("required").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEquipmentLinkSchema = createInsertSchema(equipmentLinksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEquipmentLink = z.infer<typeof insertEquipmentLinkSchema>;
export type EquipmentLink = typeof equipmentLinksTable.$inferSelect;
