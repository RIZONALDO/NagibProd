import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { shootsTable } from "./shoots";
import { equipmentTable } from "./equipment";

export const checkoutsTable = pgTable("checkouts", {
  id: serial("id").primaryKey(),
  shootId: integer("shoot_id").notNull().references(() => shootsTable.id, { onDelete: "cascade" }),
  deliveredBy: text("delivered_by").notNull(),
  reviewedBy: text("reviewed_by").notNull(),
  receivedBy: text("received_by").notNull(),
  checkoutAt: timestamp("checkout_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const checkoutItemsTable = pgTable("checkout_items", {
  id: serial("id").primaryKey(),
  checkoutId: integer("checkout_id").notNull().references(() => checkoutsTable.id, { onDelete: "cascade" }),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id),
  quantity: integer("quantity").notNull(),
  conditionOut: text("condition_out"),
  notes: text("notes"),
});

export const insertCheckoutSchema = createInsertSchema(checkoutsTable).omit({ id: true, createdAt: true, checkoutAt: true });
export type InsertCheckout = z.infer<typeof insertCheckoutSchema>;
export type Checkout = typeof checkoutsTable.$inferSelect;
