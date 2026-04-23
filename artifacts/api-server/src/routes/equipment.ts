import { Router } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, equipmentTable, activityLogsTable } from "@workspace/db";
import {
  ListEquipmentQueryParams,
  CreateEquipmentBody,
  GetEquipmentParams,
  UpdateEquipmentParams,
  UpdateEquipmentBody,
  DeleteEquipmentParams,
} from "@workspace/api-zod";

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

export default router;
