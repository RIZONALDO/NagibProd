import { Router } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, equipmentTable, activityLogsTable, equipmentLinksTable } from "@workspace/db";
import {
  ListEquipmentQueryParams,
  CreateEquipmentBody,
  GetEquipmentParams,
  UpdateEquipmentParams,
  UpdateEquipmentBody,
  DeleteEquipmentParams,
} from "@workspace/api-zod";

function parseId(val: unknown): number | null {
  const n = Number(val);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const router = Router();

router.get("/equipment", async (req, res): Promise<void> => {
  const query = ListEquipmentQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { search, category, status } = query.data;

  const conditions = [];
  if (search) conditions.push(ilike(equipmentTable.name, `%${search}%`));
  if (category) conditions.push(eq(equipmentTable.category, category));
  if (status) conditions.push(eq(equipmentTable.status, status));

  const items = await db
    .select()
    .from(equipmentTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(equipmentTable.name);

  res.json(items.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  })));
});

router.post("/equipment", async (req, res): Promise<void> => {
  const parsed = CreateEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(equipmentTable).values({
    name: parsed.data.name,
    category: parsed.data.category,
    internalCode: parsed.data.internalCode ?? null,
    totalQuantity: parsed.data.totalQuantity ?? 1,
    availableQuantity: parsed.data.availableQuantity ?? parsed.data.totalQuantity ?? 1,
    status: parsed.data.status ?? "available",
    storageLocation: parsed.data.storageLocation ?? null,
    notes: parsed.data.notes ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    active: parsed.data.active ?? true,
  }).returning();

  await db.insert(activityLogsTable).values({
    type: "equipment_created",
    description: `Equipamento ${item.name} cadastrado`,
    equipmentId: item.id,
  });

  res.status(201).json({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.get("/equipment/:id", async (req, res): Promise<void> => {
  const params = GetEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select()
    .from(equipmentTable)
    .where(eq(equipmentTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Equipment not found" });
    return;
  }

  res.json({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.patch("/equipment/:id", async (req, res): Promise<void> => {
  const params = UpdateEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.internalCode !== undefined) updateData.internalCode = parsed.data.internalCode;
  if (parsed.data.totalQuantity !== undefined) updateData.totalQuantity = parsed.data.totalQuantity;
  if (parsed.data.availableQuantity !== undefined) updateData.availableQuantity = parsed.data.availableQuantity;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.storageLocation !== undefined) updateData.storageLocation = parsed.data.storageLocation;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.active !== undefined) updateData.active = parsed.data.active;

  const [item] = await db
    .update(equipmentTable)
    .set(updateData)
    .where(eq(equipmentTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Equipment not found" });
    return;
  }

  await db.insert(activityLogsTable).values({
    type: "equipment_updated",
    description: `Equipamento ${item.name} atualizado`,
    equipmentId: item.id,
  });

  res.json({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.delete("/equipment/:id", async (req, res): Promise<void> => {
  const params = DeleteEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(equipmentTable)
    .where(eq(equipmentTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Equipment not found" });
    return;
  }

  res.sendStatus(204);
});

// ─── Equipment Links ─────────────────────────────────────────────────────────

router.get("/equipment/:id/links", async (req, res): Promise<void> => {
  const equipId = parseId(req.params.id);
  if (!equipId) { res.status(400).json({ error: "ID inválido" }); return; }

  const links = await db
    .select({
      id: equipmentLinksTable.id,
      equipmentId: equipmentLinksTable.equipmentId,
      linkedEquipmentId: equipmentLinksTable.linkedEquipmentId,
      defaultQuantity: equipmentLinksTable.defaultQuantity,
      required: equipmentLinksTable.required,
      notes: equipmentLinksTable.notes,
      createdAt: equipmentLinksTable.createdAt,
      linkedEquipment: {
        id: equipmentTable.id,
        name: equipmentTable.name,
        category: equipmentTable.category,
        availableQuantity: equipmentTable.availableQuantity,
        totalQuantity: equipmentTable.totalQuantity,
        status: equipmentTable.status,
        internalCode: equipmentTable.internalCode,
      },
    })
    .from(equipmentLinksTable)
    .innerJoin(equipmentTable, eq(equipmentLinksTable.linkedEquipmentId, equipmentTable.id))
    .where(eq(equipmentLinksTable.equipmentId, equipId));

  res.json(links.map(l => ({ ...l, createdAt: l.createdAt.toISOString() })));
});

router.post("/equipment/:id/links", async (req, res): Promise<void> => {
  const equipId = parseId(req.params.id);
  if (!equipId) { res.status(400).json({ error: "ID inválido" }); return; }

  const { linkedEquipmentId, defaultQuantity, required, notes } = req.body as Record<string, unknown>;
  const linkedId = parseId(linkedEquipmentId);
  if (!linkedId) { res.status(400).json({ error: "linkedEquipmentId inválido" }); return; }
  if (linkedId === equipId) { res.status(400).json({ error: "Um equipamento não pode ser vinculado a si mesmo" }); return; }

  const qty = Number(defaultQuantity) >= 1 ? Number(defaultQuantity) : 1;
  const isRequired = Boolean(required);

  const [link] = await db
    .insert(equipmentLinksTable)
    .values({
      equipmentId: equipId,
      linkedEquipmentId: linkedId,
      defaultQuantity: qty,
      required: isRequired,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    })
    .returning();

  res.status(201).json({ ...link, createdAt: link.createdAt.toISOString(), updatedAt: link.updatedAt.toISOString() });
});

router.patch("/equipment/:id/links/:linkId", async (req, res): Promise<void> => {
  const equipId = parseId(req.params.id);
  const linkId = parseId(req.params.linkId);
  if (!equipId || !linkId) { res.status(400).json({ error: "ID inválido" }); return; }

  const body = req.body as Record<string, unknown>;
  const updateData: Record<string, unknown> = {};
  if (body.defaultQuantity !== undefined) updateData.defaultQuantity = Math.max(1, Number(body.defaultQuantity));
  if (body.required !== undefined) updateData.required = Boolean(body.required);
  if (body.notes !== undefined) updateData.notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

  const [link] = await db
    .update(equipmentLinksTable)
    .set(updateData)
    .where(and(eq(equipmentLinksTable.id, linkId), eq(equipmentLinksTable.equipmentId, equipId)))
    .returning();

  if (!link) { res.status(404).json({ error: "Vínculo não encontrado" }); return; }

  res.json({ ...link, createdAt: link.createdAt.toISOString(), updatedAt: link.updatedAt.toISOString() });
});

router.delete("/equipment/:id/links/:linkId", async (req, res): Promise<void> => {
  const equipId = parseId(req.params.id);
  const linkId = parseId(req.params.linkId);
  if (!equipId || !linkId) { res.status(400).json({ error: "ID inválido" }); return; }

  await db
    .delete(equipmentLinksTable)
    .where(and(eq(equipmentLinksTable.id, linkId), eq(equipmentLinksTable.equipmentId, equipId)));

  res.sendStatus(204);
});

export default router;
