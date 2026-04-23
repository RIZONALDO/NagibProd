import { Router } from "express";
import { eq, ilike, and, desc, gte, lte } from "drizzle-orm";
import {
  db,
  shootsTable,
  shootTeamTable,
  teamMembersTable,
  shootEquipmentTable,
  equipmentTable,
  checkoutsTable,
  checkoutItemsTable,
  returnsTable,
  returnItemsTable,
  activityLogsTable,
} from "@workspace/db";
import {
  ListShootsQueryParams,
  CreateShootBody,
  GetShootParams,
  UpdateShootParams,
  UpdateShootBody,
  DeleteShootParams,
  GetShootTeamParams,
  AddShootTeamMemberParams,
  AddShootTeamMemberBody,
  UpdateShootTeamMemberParams,
  UpdateShootTeamMemberBody,
  RemoveShootTeamMemberParams,
  GetShootEquipmentParams,
  AddShootEquipmentParams,
  AddShootEquipmentBody,
  UpdateShootEquipmentParams,
  UpdateShootEquipmentBody,
  RemoveShootEquipmentParams,
  CheckoutEquipmentParams,
  CheckoutEquipmentBody,
  ReturnEquipmentParams,
  ReturnEquipmentBody,
  GetShootCheckoutParams,
  GetShootReturnParams,
} from "@workspace/api-zod";

const router = Router();

function serializeShoot(s: typeof shootsTable.$inferSelect) {
  return {
    ...s,
    scheduleChangedAt: s.scheduleChangedAt ? s.scheduleChangedAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

function serializeEquipment(e: typeof equipmentTable.$inferSelect) {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

function serializeMember(m: typeof teamMembersTable.$inferSelect) {
  return {
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

// List shoots
router.get("/shoots", async (req, res): Promise<void> => {
  const query = ListShootsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { search, status, date } = query.data;

  const conditions = [];
  if (search) conditions.push(ilike(shootsTable.location, `%${search}%`));
  if (status) conditions.push(eq(shootsTable.status, status));
  if (date) conditions.push(eq(shootsTable.date, date));

  const shoots = await db
    .select()
    .from(shootsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(shootsTable.date));

  res.json(shoots.map(serializeShoot));
});

// Create shoot
router.post("/shoots", async (req, res): Promise<void> => {
  const parsed = CreateShootBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [shoot] = await db.insert(shootsTable).values({
    date: parsed.data.date,
    endDate: (req.body.endDate && typeof req.body.endDate === "string") ? req.body.endDate : null,
    time: parsed.data.time ?? null,
    location: parsed.data.location,
    briefing: parsed.data.briefing ?? null,
    whatsappSummary: parsed.data.whatsappSummary ?? null,
    producerName: parsed.data.producerName ?? null,
    clientProject: parsed.data.clientProject ?? null,
    priority: parsed.data.priority ?? "medium",
    status: parsed.data.status ?? "planned",
  }).returning();

  await db.insert(activityLogsTable).values({
    type: "shoot_created",
    description: `Pauta em ${shoot.location} em ${shoot.date} criada`,
    shootId: shoot.id,
  });

  res.status(201).json(serializeShoot(shoot));
});

// Get shoot detail
router.get("/shoots/:id", async (req, res): Promise<void> => {
  const params = GetShootParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [shoot] = await db
    .select()
    .from(shootsTable)
    .where(eq(shootsTable.id, params.data.id));

  if (!shoot) {
    res.status(404).json({ error: "Shoot not found" });
    return;
  }

  // team
  const teamRows = await db
    .select()
    .from(shootTeamTable)
    .leftJoin(teamMembersTable, eq(shootTeamTable.teamMemberId, teamMembersTable.id))
    .where(eq(shootTeamTable.shootId, shoot.id));

  const team = teamRows.map((r) => ({
    id: r.shoot_team.id,
    shootId: r.shoot_team.shootId,
    teamMemberId: r.shoot_team.teamMemberId,
    role: r.shoot_team.role,
    confirmed: r.shoot_team.confirmed,
    travelDiarias: r.shoot_team.travelDiarias,
    teamMember: r.team_members ? serializeMember(r.team_members) : null,
  }));

  // equipment
  const equipRows = await db
    .select()
    .from(shootEquipmentTable)
    .leftJoin(equipmentTable, eq(shootEquipmentTable.equipmentId, equipmentTable.id))
    .where(eq(shootEquipmentTable.shootId, shoot.id));

  const equipmentItems = equipRows.map((r) => ({
    id: r.shoot_equipment.id,
    shootId: r.shoot_equipment.shootId,
    equipmentId: r.shoot_equipment.equipmentId,
    quantity: r.shoot_equipment.quantity,
    notes: r.shoot_equipment.notes,
    conditionOut: r.shoot_equipment.conditionOut,
    isLinkedItem: r.shoot_equipment.isLinkedItem,
    parentShootEquipmentId: r.shoot_equipment.parentShootEquipmentId,
    equipment: r.equipment ? serializeEquipment(r.equipment) : null,
  }));

  // checkout
  const [checkout] = await db
    .select()
    .from(checkoutsTable)
    .where(eq(checkoutsTable.shootId, shoot.id));

  let checkoutData = null;
  if (checkout) {
    const items = await db
      .select()
      .from(checkoutItemsTable)
      .leftJoin(equipmentTable, eq(checkoutItemsTable.equipmentId, equipmentTable.id))
      .where(eq(checkoutItemsTable.checkoutId, checkout.id));

    checkoutData = {
      ...checkout,
      checkoutAt: checkout.checkoutAt.toISOString(),
      createdAt: checkout.createdAt.toISOString(),
      items: items.map((i) => ({
        id: i.checkout_items.id,
        checkoutId: i.checkout_items.checkoutId,
        equipmentId: i.checkout_items.equipmentId,
        quantity: i.checkout_items.quantity,
        conditionOut: i.checkout_items.conditionOut,
        notes: i.checkout_items.notes,
        equipment: i.equipment ? serializeEquipment(i.equipment) : null,
      })),
    };
  }

  // return
  const [returnRecord] = await db
    .select()
    .from(returnsTable)
    .where(eq(returnsTable.shootId, shoot.id));

  let returnData = null;
  if (returnRecord) {
    const items = await db
      .select()
      .from(returnItemsTable)
      .leftJoin(equipmentTable, eq(returnItemsTable.equipmentId, equipmentTable.id))
      .where(eq(returnItemsTable.returnId, returnRecord.id));

    returnData = {
      ...returnRecord,
      returnAt: returnRecord.returnAt.toISOString(),
      createdAt: returnRecord.createdAt.toISOString(),
      items: items.map((i) => ({
        id: i.return_items.id,
        returnId: i.return_items.returnId,
        equipmentId: i.return_items.equipmentId,
        quantitySent: i.return_items.quantitySent,
        quantityReturned: i.return_items.quantityReturned,
        conditionReturn: i.return_items.conditionReturn,
        notes: i.return_items.notes,
        hasDamage: i.return_items.hasDamage,
        equipment: i.equipment ? serializeEquipment(i.equipment) : null,
      })),
    };
  }

  res.json({
    ...serializeShoot(shoot),
    team,
    equipmentItems,
    checkout: checkoutData,
    return: returnData,
  });
});

// Update shoot
router.patch("/shoots/:id", async (req, res): Promise<void> => {
  const params = UpdateShootParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateShootBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Fetch current shoot to detect schedule changes
  const [current] = await db.select().from(shootsTable).where(eq(shootsTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Shoot not found" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.date !== undefined) updateData.date = parsed.data.date;
  if (parsed.data.time !== undefined) updateData.time = parsed.data.time;
  if (parsed.data.location !== undefined) updateData.location = parsed.data.location;
  if (parsed.data.briefing !== undefined) updateData.briefing = parsed.data.briefing;
  if (parsed.data.whatsappSummary !== undefined) updateData.whatsappSummary = parsed.data.whatsappSummary;
  if (parsed.data.producerName !== undefined) updateData.producerName = parsed.data.producerName;
  if (parsed.data.clientProject !== undefined) updateData.clientProject = parsed.data.clientProject;
  if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (typeof req.body.hasTravel === "boolean") updateData.hasTravel = req.body.hasTravel;
  if (req.body.endDate !== undefined) updateData.endDate = req.body.endDate || null;
  if (parsed.data.date !== undefined) updateData.date = parsed.data.date;

  // Allow explicit dismissal of the schedule-change warning
  if (req.body.scheduleChangedAt === null) {
    updateData.scheduleChangedAt = null;
  } else {
    // Detect if date, endDate, or time changed and mark the flag
    const newDate = (updateData.date as string | undefined) ?? current.date;
    const newEndDate = (updateData.endDate as string | null | undefined) ?? current.endDate;
    const newTime = (updateData.time as string | undefined) ?? current.time;
    const scheduleChanged =
      newDate !== current.date ||
      newEndDate !== current.endDate ||
      newTime !== current.time;
    if (scheduleChanged) {
      updateData.scheduleChangedAt = new Date();
    }
  }

  const [shoot] = await db
    .update(shootsTable)
    .set(updateData)
    .where(eq(shootsTable.id, params.data.id))
    .returning();

  if (!shoot) {
    res.status(404).json({ error: "Shoot not found" });
    return;
  }

  await db.insert(activityLogsTable).values({
    type: "shoot_updated",
    description: `Pauta em ${shoot.location} atualizada`,
    shootId: shoot.id,
  });

  res.json(serializeShoot(shoot));
});

// Delete shoot
router.delete("/shoots/:id", async (req, res): Promise<void> => {
  const params = DeleteShootParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [shoot] = await db
    .delete(shootsTable)
    .where(eq(shootsTable.id, params.data.id))
    .returning();

  if (!shoot) {
    res.status(404).json({ error: "Shoot not found" });
    return;
  }

  res.sendStatus(204);
});

// ── Shoot Team ──

router.get("/shoots/:id/team", async (req, res): Promise<void> => {
  const params = GetShootTeamParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(shootTeamTable)
    .leftJoin(teamMembersTable, eq(shootTeamTable.teamMemberId, teamMembersTable.id))
    .where(eq(shootTeamTable.shootId, params.data.id));

  res.json(rows.map((r) => ({
    id: r.shoot_team.id,
    shootId: r.shoot_team.shootId,
    teamMemberId: r.shoot_team.teamMemberId,
    role: r.shoot_team.role,
    confirmed: r.shoot_team.confirmed,
    travelDiarias: r.shoot_team.travelDiarias,
    teamMember: r.team_members ? serializeMember(r.team_members) : null,
  })));
});

router.post("/shoots/:id/team", async (req, res): Promise<void> => {
  const params = AddShootTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddShootTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(shootTeamTable).values({
    shootId: params.data.id,
    teamMemberId: parsed.data.teamMemberId,
    role: parsed.data.role,
    confirmed: parsed.data.confirmed ?? false,
  }).returning();

  const [member] = await db
    .select()
    .from(teamMembersTable)
    .where(eq(teamMembersTable.id, row.teamMemberId));

  await db.insert(activityLogsTable).values({
    type: "team_added_to_shoot",
    description: `${member?.name ?? "Membro"} adicionado à pauta`,
    shootId: params.data.id,
    teamMemberId: row.teamMemberId,
  });

  res.status(201).json({
    id: row.id,
    shootId: row.shootId,
    teamMemberId: row.teamMemberId,
    role: row.role,
    confirmed: row.confirmed,
    teamMember: member ? serializeMember(member) : null,
  });
});

router.patch("/shoots/:id/team/:memberId", async (req, res): Promise<void> => {
  const params = UpdateShootTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateShootTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
  if (parsed.data.confirmed !== undefined) updateData.confirmed = parsed.data.confirmed;
  const rawTD = req.body.travelDiarias;
  if (typeof rawTD === "number" && Number.isInteger(rawTD) && rawTD >= 0) updateData.travelDiarias = rawTD;

  const [row] = await db
    .update(shootTeamTable)
    .set(updateData)
    .where(eq(shootTeamTable.id, params.data.memberId))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Shoot team member not found" });
    return;
  }

  const [member] = await db
    .select()
    .from(teamMembersTable)
    .where(eq(teamMembersTable.id, row.teamMemberId));

  res.json({
    id: row.id,
    shootId: row.shootId,
    teamMemberId: row.teamMemberId,
    role: row.role,
    confirmed: row.confirmed,
    teamMember: member ? serializeMember(member) : null,
  });
});

// Bulk apply travel diarias to all team members of a shoot
router.post("/shoots/:id/team/apply-travel", async (req, res): Promise<void> => {
  const shootId = parseInt(String(req.params.id), 10);
  if (isNaN(shootId)) { res.status(400).json({ error: "Invalid shoot id" }); return; }
  const count = req.body.count;
  if (typeof count !== "number" || !Number.isInteger(count) || count < 0) {
    res.status(400).json({ error: "count must be a non-negative integer" }); return;
  }
  await db.update(shootTeamTable).set({ travelDiarias: count }).where(eq(shootTeamTable.shootId, shootId));
  res.json({ ok: true });
});

router.delete("/shoots/:id/team/:memberId", async (req, res): Promise<void> => {
  const params = RemoveShootTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(shootTeamTable)
    .where(eq(shootTeamTable.id, params.data.memberId))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Shoot team member not found" });
    return;
  }

  res.sendStatus(204);
});

// ── Shoot Equipment ──

router.get("/shoots/:id/equipment", async (req, res): Promise<void> => {
  const params = GetShootEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select()
    .from(shootEquipmentTable)
    .leftJoin(equipmentTable, eq(shootEquipmentTable.equipmentId, equipmentTable.id))
    .where(eq(shootEquipmentTable.shootId, params.data.id));

  res.json(rows.map((r) => ({
    id: r.shoot_equipment.id,
    shootId: r.shoot_equipment.shootId,
    equipmentId: r.shoot_equipment.equipmentId,
    quantity: r.shoot_equipment.quantity,
    notes: r.shoot_equipment.notes,
    conditionOut: r.shoot_equipment.conditionOut,
    isLinkedItem: r.shoot_equipment.isLinkedItem,
    parentShootEquipmentId: r.shoot_equipment.parentShootEquipmentId,
    equipment: r.equipment ? serializeEquipment(r.equipment) : null,
  })));
});

router.post("/shoots/:id/equipment", async (req, res): Promise<void> => {
  const params = AddShootEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddShootEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [equip] = await db
    .select()
    .from(equipmentTable)
    .where(eq(equipmentTable.id, parsed.data.equipmentId));

  if (equip && equip.status === "maintenance") {
    res.status(400).json({ error: "Equipamento em manutenção não pode ser adicionado à saída" });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const isLinkedItem = Boolean(body.isLinkedItem);
  const parentShootEquipmentId = body.parentShootEquipmentId ? Number(body.parentShootEquipmentId) : null;

  const [row] = await db.insert(shootEquipmentTable).values({
    shootId: params.data.id,
    equipmentId: parsed.data.equipmentId,
    quantity: parsed.data.quantity ?? 1,
    notes: parsed.data.notes ?? null,
    conditionOut: parsed.data.conditionOut ?? null,
    isLinkedItem,
    parentShootEquipmentId,
  }).returning();

  await db.insert(activityLogsTable).values({
    type: "equipment_added_to_shoot",
    description: `${equip?.name ?? "Equipamento"} adicionado à pauta${isLinkedItem ? " (item vinculado)" : ""}`,
    shootId: params.data.id,
    equipmentId: row.equipmentId,
  });

  res.status(201).json({
    id: row.id,
    shootId: row.shootId,
    equipmentId: row.equipmentId,
    quantity: row.quantity,
    notes: row.notes,
    conditionOut: row.conditionOut,
    isLinkedItem: row.isLinkedItem,
    parentShootEquipmentId: row.parentShootEquipmentId,
    equipment: equip ? serializeEquipment(equip) : null,
  });
});

router.patch("/shoots/:id/equipment/:itemId", async (req, res): Promise<void> => {
  const params = UpdateShootEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateShootEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.quantity !== undefined) updateData.quantity = parsed.data.quantity;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.conditionOut !== undefined) updateData.conditionOut = parsed.data.conditionOut;

  const [row] = await db
    .update(shootEquipmentTable)
    .set(updateData)
    .where(eq(shootEquipmentTable.id, params.data.itemId))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Shoot equipment not found" });
    return;
  }

  const [equip] = await db
    .select()
    .from(equipmentTable)
    .where(eq(equipmentTable.id, row.equipmentId));

  res.json({
    id: row.id,
    shootId: row.shootId,
    equipmentId: row.equipmentId,
    quantity: row.quantity,
    notes: row.notes,
    conditionOut: row.conditionOut,
    equipment: equip ? serializeEquipment(equip) : null,
  });
});

router.delete("/shoots/:id/equipment/:itemId", async (req, res): Promise<void> => {
  const params = RemoveShootEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(shootEquipmentTable)
    .where(eq(shootEquipmentTable.id, params.data.itemId))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Shoot equipment not found" });
    return;
  }

  res.sendStatus(204);
});

// ── Checkout ──

router.post("/shoots/:id/checkout", async (req, res): Promise<void> => {
  const params = CheckoutEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CheckoutEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [checkout] = await db.insert(checkoutsTable).values({
    shootId: params.data.id,
    deliveredBy: parsed.data.deliveredBy,
    reviewedBy: parsed.data.reviewedBy,
    receivedBy: parsed.data.receivedBy,
    checkoutAt: parsed.data.checkoutAt ? new Date(parsed.data.checkoutAt) : new Date(),
  }).returning();

  const itemsData = parsed.data.items.map((item) => ({
    checkoutId: checkout.id,
    equipmentId: item.equipmentId,
    quantity: item.quantity,
    conditionOut: item.conditionOut ?? null,
    notes: item.notes ?? null,
  }));

  if (itemsData.length > 0) {
    await db.insert(checkoutItemsTable).values(itemsData);
  }

  // Update equipment status to in_use
  for (const item of parsed.data.items) {
    await db
      .update(equipmentTable)
      .set({ status: "in_use" })
      .where(eq(equipmentTable.id, item.equipmentId));
  }

  // Update shoot status
  await db
    .update(shootsTable)
    .set({ status: "checkout_done" })
    .where(eq(shootsTable.id, params.data.id));

  await db.insert(activityLogsTable).values({
    type: "checkout",
    description: `Saída de equipamentos registrada para pauta`,
    shootId: params.data.id,
  });

  const items = await db
    .select()
    .from(checkoutItemsTable)
    .leftJoin(equipmentTable, eq(checkoutItemsTable.equipmentId, equipmentTable.id))
    .where(eq(checkoutItemsTable.checkoutId, checkout.id));

  res.status(201).json({
    id: checkout.id,
    shootId: checkout.shootId,
    deliveredBy: checkout.deliveredBy,
    reviewedBy: checkout.reviewedBy,
    receivedBy: checkout.receivedBy,
    checkoutAt: checkout.checkoutAt.toISOString(),
    items: items.map((i) => ({
      id: i.checkout_items.id,
      checkoutId: i.checkout_items.checkoutId,
      equipmentId: i.checkout_items.equipmentId,
      quantity: i.checkout_items.quantity,
      conditionOut: i.checkout_items.conditionOut,
      notes: i.checkout_items.notes,
      equipment: i.equipment ? serializeEquipment(i.equipment) : null,
    })),
  });
});

router.get("/shoots/:id/checkout-details", async (req, res): Promise<void> => {
  const params = GetShootCheckoutParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [checkout] = await db
    .select()
    .from(checkoutsTable)
    .where(eq(checkoutsTable.shootId, params.data.id));

  if (!checkout) {
    res.status(404).json({ error: "Checkout not found" });
    return;
  }

  const items = await db
    .select()
    .from(checkoutItemsTable)
    .leftJoin(equipmentTable, eq(checkoutItemsTable.equipmentId, equipmentTable.id))
    .where(eq(checkoutItemsTable.checkoutId, checkout.id));

  res.json({
    id: checkout.id,
    shootId: checkout.shootId,
    deliveredBy: checkout.deliveredBy,
    reviewedBy: checkout.reviewedBy,
    receivedBy: checkout.receivedBy,
    checkoutAt: checkout.checkoutAt.toISOString(),
    items: items.map((i) => ({
      id: i.checkout_items.id,
      checkoutId: i.checkout_items.checkoutId,
      equipmentId: i.checkout_items.equipmentId,
      quantity: i.checkout_items.quantity,
      conditionOut: i.checkout_items.conditionOut,
      notes: i.checkout_items.notes,
      equipment: i.equipment ? serializeEquipment(i.equipment) : null,
    })),
  });
});

// ── Return ──

router.post("/shoots/:id/return", async (req, res): Promise<void> => {
  const params = ReturnEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ReturnEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const hasPendencies = parsed.data.items.some(
    (i) => i.quantityReturned < i.quantitySent || i.hasDamage
  );

  const [returnRecord] = await db.insert(returnsTable).values({
    shootId: params.data.id,
    returnedBy: parsed.data.returnedBy,
    reviewedBy: parsed.data.reviewedBy,
    receivedBy: parsed.data.receivedBy,
    hasPendencies,
    returnAt: parsed.data.returnAt ? new Date(parsed.data.returnAt) : new Date(),
  }).returning();

  const itemsData = parsed.data.items.map((item) => ({
    returnId: returnRecord.id,
    equipmentId: item.equipmentId,
    quantitySent: item.quantitySent,
    quantityReturned: item.quantityReturned,
    conditionReturn: item.conditionReturn ?? null,
    notes: item.notes ?? null,
    hasDamage: item.hasDamage ?? false,
  }));

  if (itemsData.length > 0) {
    await db.insert(returnItemsTable).values(itemsData);
  }

  // Update equipment status
  for (const item of parsed.data.items) {
    const newStatus = item.hasDamage ? "damaged" : item.quantityReturned < item.quantitySent ? "pending_return" : "available";
    await db
      .update(equipmentTable)
      .set({ status: newStatus })
      .where(eq(equipmentTable.id, item.equipmentId));
  }

  // Update shoot status
  const newShootStatus = hasPendencies ? "return_pending" : "closed";
  await db
    .update(shootsTable)
    .set({ status: newShootStatus })
    .where(eq(shootsTable.id, params.data.id));

  await db.insert(activityLogsTable).values({
    type: "return",
    description: `Devolução de equipamentos registrada${hasPendencies ? " com pendências" : ""}`,
    shootId: params.data.id,
  });

  const items = await db
    .select()
    .from(returnItemsTable)
    .leftJoin(equipmentTable, eq(returnItemsTable.equipmentId, equipmentTable.id))
    .where(eq(returnItemsTable.returnId, returnRecord.id));

  res.status(201).json({
    id: returnRecord.id,
    shootId: returnRecord.shootId,
    returnedBy: returnRecord.returnedBy,
    reviewedBy: returnRecord.reviewedBy,
    receivedBy: returnRecord.receivedBy,
    hasPendencies: returnRecord.hasPendencies,
    returnAt: returnRecord.returnAt.toISOString(),
    items: items.map((i) => ({
      id: i.return_items.id,
      returnId: i.return_items.returnId,
      equipmentId: i.return_items.equipmentId,
      quantitySent: i.return_items.quantitySent,
      quantityReturned: i.return_items.quantityReturned,
      conditionReturn: i.return_items.conditionReturn,
      notes: i.return_items.notes,
      hasDamage: i.return_items.hasDamage,
      equipment: i.equipment ? serializeEquipment(i.equipment) : null,
    })),
  });
});

router.get("/shoots/:id/return-details", async (req, res): Promise<void> => {
  const params = GetShootReturnParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [returnRecord] = await db
    .select()
    .from(returnsTable)
    .where(eq(returnsTable.shootId, params.data.id));

  if (!returnRecord) {
    res.status(404).json({ error: "Return not found" });
    return;
  }

  const items = await db
    .select()
    .from(returnItemsTable)
    .leftJoin(equipmentTable, eq(returnItemsTable.equipmentId, equipmentTable.id))
    .where(eq(returnItemsTable.returnId, returnRecord.id));

  res.json({
    id: returnRecord.id,
    shootId: returnRecord.shootId,
    returnedBy: returnRecord.returnedBy,
    reviewedBy: returnRecord.reviewedBy,
    receivedBy: returnRecord.receivedBy,
    hasPendencies: returnRecord.hasPendencies,
    returnAt: returnRecord.returnAt.toISOString(),
    items: items.map((i) => ({
      id: i.return_items.id,
      returnId: i.return_items.returnId,
      equipmentId: i.return_items.equipmentId,
      quantitySent: i.return_items.quantitySent,
      quantityReturned: i.return_items.quantityReturned,
      conditionReturn: i.return_items.conditionReturn,
      notes: i.return_items.notes,
      hasDamage: i.return_items.hasDamage,
      equipment: i.equipment ? serializeEquipment(i.equipment) : null,
    })),
  });
});

// ── Pautas Report ──
router.get("/reports/diarias", async (req, res): Promise<void> => {
  const from = String(req.query.from ?? "");
  const to = String(req.query.to ?? "");

  const conditions = [];
  if (from) conditions.push(gte(shootsTable.date, from));
  if (to) conditions.push(lte(shootsTable.date, to));

  const rows = await db
    .select({
      teamMemberId: shootTeamTable.teamMemberId,
      memberName: teamMembersTable.name,
      primaryRole: teamMembersTable.primaryRole,
      travelDiarias: shootTeamTable.travelDiarias,
      shootId: shootsTable.id,
      shootDate: shootsTable.date,
      shootLocation: shootsTable.location,
    })
    .from(shootTeamTable)
    .innerJoin(shootsTable, eq(shootTeamTable.shootId, shootsTable.id))
    .innerJoin(teamMembersTable, eq(shootTeamTable.teamMemberId, teamMembersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(teamMembersTable.name, shootsTable.date);

  // Aggregate per member
  const map = new Map<number, {
    teamMemberId: number;
    memberName: string;
    primaryRole: string;
    shoots: number;
    totalTravelDiarias: number;
    shootDetails: { id: number; date: string; location: string; travelDiarias: number }[];
  }>();

  for (const row of rows) {
    let entry = map.get(row.teamMemberId);
    if (!entry) {
      entry = {
        teamMemberId: row.teamMemberId,
        memberName: row.memberName,
        primaryRole: row.primaryRole ?? "",
        shoots: 0,
        totalTravelDiarias: 0,
        shootDetails: [],
      };
      map.set(row.teamMemberId, entry);
    }
    entry.shoots += 1;
    entry.totalTravelDiarias += row.travelDiarias ?? 0;
    entry.shootDetails.push({
      id: row.shootId,
      date: row.shootDate,
      location: row.shootLocation,
      travelDiarias: row.travelDiarias ?? 0,
    });
  }

  res.json(Array.from(map.values()));
});

export default router;
