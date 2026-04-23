import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import {
  db,
  shootsTable,
  equipmentTable,
  teamMembersTable,
  activityLogsTable,
} from "@workspace/db";

const router = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const [allShoots, allEquipment, allMembers, recentActivityRaw, todayShootsRaw] = await Promise.all([
    db.select().from(shootsTable),
    db.select().from(equipmentTable),
    db.select().from(teamMembersTable),
    db
      .select()
      .from(activityLogsTable)
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(10),
    db.select().from(shootsTable).where(eq(shootsTable.date, today)),
  ]);

  const openShoots = allShoots.filter((s) =>
    !["closed"].includes(s.status)
  ).length;

  const equipmentInUse = allEquipment.filter((e) => e.status === "in_use").length;
  const equipmentPendingReturn = allEquipment.filter((e) => e.status === "pending_return").length;
  const equipmentInMaintenance = allEquipment.filter((e) => e.status === "maintenance").length;
  const activeTeamMembers = allMembers.filter((m) => m.status === "active").length;

  res.json({
    todayShoots: todayShootsRaw.length,
    openShoots,
    equipmentInUse,
    equipmentPendingReturn,
    equipmentInMaintenance,
    activeTeamMembers,
    recentActivity: recentActivityRaw.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    todayShootsList: todayShootsRaw.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  });
});

export default router;
