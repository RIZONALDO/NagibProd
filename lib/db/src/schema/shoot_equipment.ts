import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { shootsTable } from "./shoots";
import { equipmentTable } from "./equipment";

export const shootEquipmentTable = pgTable("shoot_equipment", {
  id: serial("id").primaryKey(),
  shootId: integer("shoot_id").notNull().references(() => shootsTable.id, { onDelete: "cascade" }),
  equipmentId: integer("equipment_id").notNull().references(() => equipmentTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  notes: text("notes"),
  conditionOut: text("condition_out"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertShootEquipmentSchema = createInsertSchema(shootEquipmentTable).omit({ id: true, createdAt: true });
export type InsertShootEquipment = z.infer<typeof insertShootEquipmentSchema>;
export type ShootEquipment = typeof shootEquipmentTable.$inferSelect;
