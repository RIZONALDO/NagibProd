import { Router } from "express";
import { eq, and, gte, lte, ilike, or, inArray } from "drizzle-orm";
import {
  db,
  shootsTable,
  shootTeamTable,
  teamMembersTable,
  shootEquipmentTable,
  checkoutsTable,
  returnsTable,
} from "@workspace/db";

const router = Router();

router.get("/calendar", async (req, res): Promise<void> => {
  const { start, end, producer, status, priority, location, teamMemberId, clientProject, search } = req.query;

  const conditions: ReturnType<typeof eq>[] = [];

  if (start && typeof start === "string") {
    conditions.push(gte(shootsTable.date, start));
  }
  if (end && typeof end === "string") {
    conditions.push(lte(shootsTable.date, end));
  }
  if (status && typeof status === "string") {
    conditions.push(eq(shootsTable.status, status));
  }
  if (priority && typeof priority === "string") {
    conditions.push(eq(shootsTable.priority, priority));
  }
  if (producer && typeof producer === "string") {
    conditions.push(ilike(shootsTable.producerName, `%${producer}%`));
  }
  if (location && typeof location === "string") {
    conditions.push(ilike(shootsTable.location, `%${location}%`));
  }
  if (clientProject && typeof clientProject === "string") {
    conditions.push(ilike(shootsTable.clientProject, `%${clientProject}%`));
  }
  if (search && typeof search === "string") {
    conditions.push(
      or(
        ilike(shootsTable.location, `%${search}%`),
        ilike(shootsTable.producerName, `%${search}%`),
        ilike(shootsTable.clientProject, `%${search}%`),
        ilike(shootsTable.whatsappSummary, `%${search}%`),
      )!
    );
  }

  let shoots = await db
    .select()
    .from(shootsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(shootsTable.date, shootsTable.time);

  // If filtering by team member, filter shoot IDs after fetching team assignments
  if (teamMemberId && typeof teamMemberId === "string") {
    const memberId = parseInt(teamMemberId, 10);
    if (!isNaN(memberId)) {
      const teamAssignments = await db
        .select({ shootId: shootTeamTable.shootId })
        .from(shootTeamTable)
        .where(eq(shootTeamTable.teamMemberId, memberId));
      const shootIds = teamAssignments.map((t) => t.shootId);
      shoots = shoots.filter((s) => shootIds.includes(s.id));
    }
  }

  if (shoots.length === 0) {
    res.json([]);
    return;
  }

  const shootIds = shoots.map((s) => s.id);

  // Batch load team assignments for all shoots
  const teamAssignments = await db
    .select({
      shootId: shootTeamTable.shootId,
      role: shootTeamTable.role,
      confirmed: shootTeamTable.confirmed,
      memberId: teamMembersTable.id,
      memberName: teamMembersTable.name,
    })
    .from(shootTeamTable)
    .innerJoin(teamMembersTable, eq(shootTeamTable.teamMemberId, teamMembersTable.id))
    .where(inArray(shootTeamTable.shootId, shootIds));

  // Batch load equipment counts for all shoots
  const equipmentRows = await db
    .select({
      shootId: shootEquipmentTable.shootId,
      quantity: shootEquipmentTable.quantity,
    })
    .from(shootEquipmentTable)
    .where(inArray(shootEquipmentTable.shootId, shootIds));

  // Batch load checkouts for all shoots
  const checkouts = await db
    .select({ shootId: checkoutsTable.shootId })
    .from(checkoutsTable)
    .where(inArray(checkoutsTable.shootId, shootIds));

  // Batch load returns for all shoots
  const returns = await db
    .select({ shootId: returnsTable.shootId, hasPendencies: returnsTable.hasPendencies })
    .from(returnsTable)
    .where(inArray(returnsTable.shootId, shootIds));

  const checkoutShootIds = new Set(checkouts.map((c) => c.shootId));
  const returnShootIds = new Set(returns.map((r) => r.shootId));

  // Group assignments by shoot
  const teamByShoot = new Map<number, typeof teamAssignments>();
  for (const row of teamAssignments) {
    if (!teamByShoot.has(row.shootId)) teamByShoot.set(row.shootId, []);
    teamByShoot.get(row.shootId)!.push(row);
  }

  // Group equipment by shoot
  const equipmentByShoot = new Map<number, number>();
  for (const row of equipmentRows) {
    equipmentByShoot.set(row.shootId, (equipmentByShoot.get(row.shootId) ?? 0) + (row.quantity ?? 1));
  }

  const ROLE_PRIORITY = [
    "Diretor de Fotografia",
    "Direção de Fotografia",
    "Director of Photography",
    "DP",
    "Produtor",
    "Produtora",
    "Produção",
    "Producer",
    "Cinegrafista",
    "Câmera A",
    "Câmera B",
    "Assistente de Câmera",
    "Assistente",
    "Assistente 1",
    "Assistente 2",
    "Iluminador",
    "Captador de Áudio",
    "Drone Operator",
  ];

  function sortTeam(members: typeof teamAssignments) {
    return [...members].sort((a, b) => {
      const ai = ROLE_PRIORITY.findIndex((r) => a.role.toLowerCase().includes(r.toLowerCase()));
      const bi = ROLE_PRIORITY.findIndex((r) => b.role.toLowerCase().includes(r.toLowerCase()));
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }

  const result = shoots.map((shoot) => {
    const team = teamByShoot.get(shoot.id) ?? [];
    const sortedTeam = sortTeam(team);
    const equipmentCount = equipmentByShoot.get(shoot.id) ?? 0;
    const checkoutDone = checkoutShootIds.has(shoot.id);
    const returnDone = returnShootIds.has(shoot.id);
    const allConfirmed = team.length > 0 && team.every((t) => t.confirmed);

    return {
      id: shoot.id,
      date: shoot.date,
      time: shoot.time,
      location: shoot.location,
      briefing: shoot.briefing,
      whatsappSummary: shoot.whatsappSummary,
      producerName: shoot.producerName,
      clientProject: shoot.clientProject,
      priority: shoot.priority,
      status: shoot.status,
      createdAt: shoot.createdAt.toISOString(),
      updatedAt: shoot.updatedAt.toISOString(),
      teamCount: team.length,
      teamConfirmed: allConfirmed,
      teamSummary: sortedTeam.map((t) => ({
        id: t.memberId,
        name: t.memberName,
        role: t.role,
        confirmed: t.confirmed,
      })),
      equipmentCount,
      checkoutDone,
      returnDone,
      returnPending: shoot.status === "return_pending" || (checkoutDone && !returnDone && shoot.status !== "closed"),
    };
  });

  res.json(result);
});

export default router;
