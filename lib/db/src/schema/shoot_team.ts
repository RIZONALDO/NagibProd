import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { shootsTable } from "./shoots";
import { teamMembersTable } from "./team_members";

export const shootTeamTable = pgTable("shoot_team", {
  id: serial("id").primaryKey(),
  shootId: integer("shoot_id").notNull().references(() => shootsTable.id, { onDelete: "cascade" }),
  teamMemberId: integer("team_member_id").notNull().references(() => teamMembersTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  confirmed: boolean("confirmed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertShootTeamSchema = createInsertSchema(shootTeamTable).omit({ id: true, createdAt: true });
export type InsertShootTeam = z.infer<typeof insertShootTeamSchema>;
export type ShootTeam = typeof shootTeamTable.$inferSelect;
