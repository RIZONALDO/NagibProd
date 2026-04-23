import { Router } from "express";
import { eq, ilike, or, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, appSettingsTable, whatsappTemplatesTable, activityLogsTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../lib/auth-middleware";

const router = Router();

router.get("/settings/app", requireAuth, async (req, res): Promise<void> => {
  const rows = await db.select().from(appSettingsTable);
  const settings: Record<string, string | null> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

router.patch("/settings/app", requireAdmin, async (req, res): Promise<void> => {
  const updates = req.body as Record<string, string>;
  if (!updates || typeof updates !== "object") {
    res.status(400).json({ error: "Body inválido" });
    return;
  }

  const sensitiveKeys = ["company_name", "system_name", "primary_color", "secondary_color", "logo_url"];
  const changedSensitive = Object.keys(updates).filter(k => sensitiveKeys.includes(k));

  for (const [key, value] of Object.entries(updates)) {
    await db
      .update(appSettingsTable)
      .set({ value: String(value) })
      .where(eq(appSettingsTable.key, key));
  }

  if (changedSensitive.length > 0) {
    await db.insert(activityLogsTable).values({
      type: "settings_updated",
      description: `Configurações do sistema atualizadas: ${changedSensitive.join(", ")}`,
    });
  }

  const rows = await db.select().from(appSettingsTable);
  const settings: Record<string, string | null> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

router.get("/settings/whatsapp-templates", requireAuth, async (req, res): Promise<void> => {
  const templates = await db.select().from(whatsappTemplatesTable);
  res.json(templates.map(t => ({ ...t, updatedAt: t.updatedAt.toISOString() })));
});

router.patch("/settings/whatsapp-templates/:key", requireAdmin, async (req, res): Promise<void> => {
  const { key } = req.params;
  const { content } = req.body ?? {};
  if (!content) {
    res.status(400).json({ error: "content é obrigatório" });
    return;
  }

  const [tpl] = await db
    .update(whatsappTemplatesTable)
    .set({ content: String(content) })
    .where(eq(whatsappTemplatesTable.templateKey, key))
    .returning();

  if (!tpl) {
    res.status(404).json({ error: "Template não encontrado" });
    return;
  }

  await db.insert(activityLogsTable).values({
    type: "whatsapp_template_updated",
    description: `Modelo de WhatsApp "${tpl.name}" atualizado`,
  });

  res.json({ ...tpl, updatedAt: tpl.updatedAt.toISOString() });
});

router.get("/settings/users", requireAdmin, async (req, res): Promise<void> => {
  const { search, profile, status } = req.query;

  const conditions = [];
  if (search) {
    conditions.push(or(
      ilike(usersTable.name, `%${search}%`),
      ilike(usersTable.email, `%${search}%`),
      ilike(usersTable.login, `%${search}%`),
    ));
  }
  if (profile) conditions.push(eq(usersTable.profile, String(profile)));
  if (status) conditions.push(eq(usersTable.status, String(status)));

  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      login: usersTable.login,
      profile: usersTable.profile,
      avatarUrl: usersTable.avatarUrl,
      phone: usersTable.phone,
      notes: usersTable.notes,
      status: usersTable.status,
      isProducer: usersTable.isProducer,
      lastLoginAt: usersTable.lastLoginAt,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(usersTable.name);

  res.json(users.map(u => ({
    ...u,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  })));
});

router.post("/settings/users", requireAdmin, async (req, res): Promise<void> => {
  const { name, email, login, password, profile, phone, notes, avatarUrl, status, isProducer } = req.body ?? {};
  if (!name || !email || !login || !password || !profile) {
    res.status(400).json({ error: "name, email, login, password e profile são obrigatórios" });
    return;
  }

  const existingEmail = await db.select().from(usersTable).where(eq(usersTable.email, String(email)));
  if (existingEmail.length > 0) {
    res.status(409).json({ error: "E-mail já cadastrado" });
    return;
  }

  const existingLogin = await db.select().from(usersTable).where(eq(usersTable.login, String(login)));
  if (existingLogin.length > 0) {
    res.status(409).json({ error: "Login já cadastrado" });
    return;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const [user] = await db.insert(usersTable).values({
    name: String(name),
    email: String(email),
    login: String(login),
    passwordHash,
    profile: String(profile),
    phone: phone ? String(phone) : null,
    notes: notes ? String(notes) : null,
    avatarUrl: avatarUrl ? String(avatarUrl) : null,
    status: status ?? "active",
    isProducer: isProducer === true || isProducer === "true",
  }).returning();

  await db.insert(activityLogsTable).values({
    type: "user_created",
    description: `Usuário ${user.name} (${user.login}) criado com perfil ${user.profile}`,
  });

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    login: user.login,
    profile: user.profile,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    notes: user.notes,
    status: user.status,
    isProducer: user.isProducer,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
});

router.patch("/settings/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const { name, email, login, profile, phone, notes, avatarUrl, status, isProducer } = req.body ?? {};

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Usuário não encontrado" }); return; }

  if (email && email !== existing.email) {
    const dup = await db.select().from(usersTable).where(eq(usersTable.email, String(email)));
    if (dup.length > 0) { res.status(409).json({ error: "E-mail já cadastrado" }); return; }
  }
  if (login && login !== existing.login) {
    const dup = await db.select().from(usersTable).where(eq(usersTable.login, String(login)));
    if (dup.length > 0) { res.status(409).json({ error: "Login já cadastrado" }); return; }
  }

  if (profile && profile !== existing.profile) {
    if (existing.profile === "administrador") {
      const admins = await db.select().from(usersTable)
        .where(and(eq(usersTable.profile, "administrador"), eq(usersTable.status, "active")));
      if (admins.length <= 1) {
        res.status(400).json({ error: "Não é possível remover o último administrador ativo" });
        return;
      }
    }
  }

  const update: Record<string, unknown> = {};
  if (name) update.name = String(name);
  if (email) update.email = String(email);
  if (login) update.login = String(login);
  if (profile) update.profile = String(profile);
  if (phone !== undefined) update.phone = phone ? String(phone) : null;
  if (notes !== undefined) update.notes = notes ? String(notes) : null;
  if (avatarUrl !== undefined) update.avatarUrl = avatarUrl ? String(avatarUrl) : null;
  if (status !== undefined) update.status = String(status);
  if (isProducer !== undefined) update.isProducer = isProducer === true || isProducer === "true";

  const [user] = await db.update(usersTable).set(update).where(eq(usersTable.id, id)).returning();

  const sensitiveChanges = [];
  if (profile && profile !== existing.profile) sensitiveChanges.push(`perfil alterado para ${profile}`);
  if (status && status !== existing.status) sensitiveChanges.push(`status alterado para ${status}`);

  if (sensitiveChanges.length > 0) {
    await db.insert(activityLogsTable).values({
      type: "user_updated",
      description: `Usuário ${user.name}: ${sensitiveChanges.join("; ")}`,
    });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    login: user.login,
    profile: user.profile,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    notes: user.notes,
    status: user.status,
    isProducer: user.isProducer,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
});

router.post("/settings/users/:id/reset-password", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const { password } = req.body ?? {};
  if (!password) { res.status(400).json({ error: "Nova senha é obrigatória" }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Usuário não encontrado" }); return; }

  const passwordHash = await bcrypt.hash(String(password), 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, id));

  await db.insert(activityLogsTable).values({
    type: "user_password_reset",
    description: `Senha do usuário ${existing.name} redefinida`,
  });

  res.json({ ok: true });
});

router.delete("/settings/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Usuário não encontrado" }); return; }

  if (existing.profile === "administrador") {
    const admins = await db.select().from(usersTable)
      .where(and(eq(usersTable.profile, "administrador"), eq(usersTable.status, "active")));
    if (admins.length <= 1) {
      res.status(400).json({ error: "Não é possível excluir o último administrador ativo" });
      return;
    }
  }

  await db.delete(usersTable).where(eq(usersTable.id, id));

  await db.insert(activityLogsTable).values({
    type: "user_deleted",
    description: `Usuário ${existing.name} (${existing.login}) excluído`,
  });

  res.sendStatus(204);
});

export default router;
