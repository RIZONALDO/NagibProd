import type { Request, Response, NextFunction } from "express";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  login: string;
  profile: string;
  avatarUrl: string | null;
  isProducer: boolean;
}

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  if (req.session.user.profile !== "administrador") {
    res.status(403).json({ error: "Acesso restrito a administradores" });
    return;
  }
  next();
}
