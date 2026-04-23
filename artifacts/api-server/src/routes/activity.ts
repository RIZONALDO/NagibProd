import { Router } from "express";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db, activityLogsTable } from "@workspace/db";
import { ListActivityQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/activity", async (req, res): Promise<void> => {
  const query = ListActivityQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { shootId, equipmentId, teamMemberId, type, dateFrom, dateTo, limit } = query.data;

  const conditions = [];
  if (shootId) conditions.push(eq(activityLogsTable.shootId, shootId));
  if (equipmentId) conditions.push(eq(activityLogsTable.equipmentId, equipmentId));
  if (teamMemberId) conditions.push(eq(activityLogsTable.teamMemberId, teamMemberId));
  if (type) conditions.push(eq(activityLogsTable.type, type));
  if (dateFrom) conditions.push(gte(activityLogsTable.createdAt, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(activityLogsTable.createdAt, new Date(dateTo)));

  const logs = await db
    .select()
    .from(activityLogsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(limit ?? 100);

  res.json(logs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  })));
});

export default router;
