import { Router } from "express";
import { eq, ilike, and, or } from "drizzle-orm";
import { db, teamMembersTable, activityLogsTable } from "@workspace/db";
import {
  ListTeamMembersQueryParams,
  CreateTeamMemberBody,
  GetTeamMemberParams,
  UpdateTeamMemberParams,
  UpdateTeamMemberBody,
  DeleteTeamMemberParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/team", async (req, res): Promise<void> => {
  const query = ListTeamMembersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { search, status, role } = query.data;

  const conditions = [];
  if (search) conditions.push(or(
    ilike(teamMembersTable.name, `%${search}%`),
    ilike(teamMembersTable.primaryRole, `%${search}%`),
    ilike(teamMembersTable.secondaryRole, `%${search}%`)
  ));
  if (status) conditions.push(eq(teamMembersTable.status, status));
  if (role) conditions.push(eq(teamMembersTable.primaryRole, role));

  const members = await db
    .select()
    .from(teamMembersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(teamMembersTable.name);

  res.json(members.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  })));
});

router.post("/team", async (req, res): Promise<void> => {
  const parsed = CreateTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db.insert(teamMembersTable).values({
    name: parsed.data.name,
    primaryRole: parsed.data.primaryRole,
    secondaryRole: parsed.data.secondaryRole ?? null,
    phone: parsed.data.phone ?? null,
    notes: parsed.data.notes ?? null,
    avatarUrl: parsed.data.avatarUrl ?? null,
    status: parsed.data.status ?? "active",
    isFreelancer: req.body.isFreelancer === true || req.body.isFreelancer === "true" ? true : false,
  }).returning();

  await db.insert(activityLogsTable).values({
    type: "team_member_created",
    description: `Membro ${member.name} cadastrado`,
    teamMemberId: member.id,
  });

  res.status(201).json({
    ...member,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  });
});

router.get("/team/:id", async (req, res): Promise<void> => {
  const params = GetTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [member] = await db
    .select()
    .from(teamMembersTable)
    .where(eq(teamMembersTable.id, params.data.id));

  if (!member) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }

  res.json({
    ...member,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  });
});

router.patch("/team/:id", async (req, res): Promise<void> => {
  const params = UpdateTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.primaryRole !== undefined) updateData.primaryRole = parsed.data.primaryRole;
  if (parsed.data.secondaryRole !== undefined) updateData.secondaryRole = parsed.data.secondaryRole;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.avatarUrl !== undefined) updateData.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (req.body.isFreelancer !== undefined) updateData.isFreelancer = req.body.isFreelancer === true || req.body.isFreelancer === "true";

  const [member] = await db
    .update(teamMembersTable)
    .set(updateData)
    .where(eq(teamMembersTable.id, params.data.id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }

  await db.insert(activityLogsTable).values({
    type: "team_member_updated",
    description: `Membro ${member.name} atualizado`,
    teamMemberId: member.id,
  });

  res.json({
    ...member,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  });
});

router.delete("/team/:id", async (req, res): Promise<void> => {
  const params = DeleteTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [member] = await db
    .delete(teamMembersTable)
    .where(eq(teamMembersTable.id, params.data.id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
