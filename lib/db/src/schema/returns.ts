import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { shootsTable } from "./shoots";
import { equipmentTable } from "./equipment";

export const returnsTable = pgTable("returns", {
  id: serial("id").primaryKey(),
  shootId: integer("shoot_id").notNull().references(() => shootsTable.id, { onDelete: "cascade" }),
  returnedBy: text("returned_by").notNull(),
  reviewedBy: text("reviewed_by").notNull(),
  receivedBy: text("received_by").notNull(),
  hasPendencies: boolean("has_pendencies").notNull().default(false),
  returnAt: timestamp("return_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const returnItemsTable = pgTable("return_items", {
  id: serial("id").primaryKey(),
  returnId: integer("return_id").notNull().references(() => returnsTable.id, { onDelete: "cascade" }),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id),
  quantitySent: integer("quantity_sent").notNull(),
  quantityReturned: integer("quantity_returned").notNull(),
  conditionReturn: text("condition_return"),
  notes: text("notes"),
  hasDamage: boolean("has_damage").notNull().default(false),
});

export const insertReturnSchema = createInsertSchema(returnsTable).omit({ id: true, createdAt: true, returnAt: true });
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type Return = typeof returnsTable.$inferSelect;
