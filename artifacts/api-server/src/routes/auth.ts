import { Router } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../lib/auth-middleware";

const router = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { login, password } = req.body ?? {};
  if (!login || !password) {
    res.status(400).json({ error: "Login e senha são obrigatórios" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.login, String(login)));

  if (!user) {
    res.status(401).json({ error: "Usuário ou senha inválidos" });
    return;
  }

  if (user.status !== "active") {
    res.status(403).json({ error: "Usuário inativo. Contate o administrador." });
    return;
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Usuário ou senha inválidos" });
    return;
  }

  await db
    .update(usersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(usersTable.id, user.id));

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    login: user.login,
    profile: user.profile,
    avatarUrl: user.avatarUrl,
  };

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    login: user.login,
    profile: user.profile,
    avatarUrl: user.avatarUrl,
  });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", requireAuth, (req, res): void => {
  res.json(req.session.user);
});

export default router;
