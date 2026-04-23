# Nagibe Produção - Sistema de Gestão Operacional

## Overview

Full-stack operational management system for Nagibe Produção, a video/photography production company. Manages team members, equipment, daily shoots, equipment checkout/return, and WhatsApp mirror generation.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/nagibe)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (lib/db)
- **Validation**: Zod (zod/v4), drizzle-zod
- **UI**: Tailwind CSS + Radix UI + lucide-react
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Application Modules

1. **Dashboard** — Stats, today's shoots, equipment alerts, recent activity
2. **Equipe** — Team member management with roles, photo, status
3. **Equipamentos** — Equipment catalog with categories, status, availability
4. **Diárias** — Shoot management with team/equipment assignment
5. **Saída de Equipamentos** — Equipment checkout with checklist
6. **Devolução de Equipamentos** — Equipment return with damage tracking
7. **WhatsApp Mirror** — Generate formatted text to share via WhatsApp
8. **Histórico** — Activity log with filters
9. **Configurações** (admin only):
   - **Usuários** — CRUD with profile, status, reset password
   - **Perfis de Acesso** — Administrador, Operador, Revisor, Visualizador
   - **Personalização** — Company name, logo, colors, footer
   - **Configurações Gerais** — Date format, timezone, login message, WhatsApp button behavior
   - **Modelos de WhatsApp** — Edit templates with placeholders + live preview

## Authentication

- Session-based auth using express-session + connect-pg-simple
- Sessions stored in PostgreSQL `session` table
- Default admin: login=`admin`, password=`admin123` (change in Configurações > Usuários)
- Passwords hashed with bcrypt
- Roles: administrador (full access), operador (manage all except settings), revisor (read + review), visualizador (read-only)
- All sensitive operations logged to activity_logs

## Customization

### Identity (Logo, Name, Colors)
- **App name**: Change `"Nagibe Produção"` in `artifacts/nagibe/src/components/Shell.tsx`
- **Colors**: Modify `artifacts/nagibe/src/index.css` (amber/gold primary, slate sidebar)
- **Logo**: Replace the icon in the Shell sidebar

### WhatsApp Text Templates
- Templates are in `artifacts/nagibe/src/pages/ShootDetail.tsx`
- Look for the `generatePautaText`, `generateEquipmentText`, and `generateFullText` functions

### Default Roles
- Roles list is in `artifacts/nagibe/src/pages/TeamMemberForm.tsx`
- Look for the `TEAM_ROLES` constant

### Equipment Categories
- Categories with icons are in `artifacts/nagibe/src/components/EquipmentCategoryIcon.tsx`

## Database Schema (lib/db/src/schema/)

- `team_members.ts` — Team member records
- `equipment.ts` — Equipment catalog
- `shoots.ts` — Shoot/daily records
- `shoot_team.ts` — Team assignment to shoots
- `shoot_equipment.ts` — Equipment assignment to shoots
- `checkouts.ts` + `checkout_items.ts` — Equipment checkout records
- `returns.ts` + `return_items.ts` — Equipment return records
- `activity_logs.ts` — Audit log of all operations

## API Routes (artifacts/api-server/src/routes/)

- `dashboard.ts` — GET /dashboard/summary
- `team.ts` — CRUD for /team and /team/:id
- `equipment.ts` — CRUD for /equipment and /equipment/:id
- `shoots.ts` — CRUD for /shoots, team/equipment management, checkout/return
- `activity.ts` — GET /activity with filters

## Business Rules

- Equipment in `maintenance` status cannot be added to a shoot
- Equipment in `pending_return` status shows highlighted in dashboard
- Checkout marks equipment as `in_use`
- Return marks equipment as `available`, `damaged`, or `pending_return` based on return data
- Shoot status progresses: planned → team_defined → equipment_separated → checkout_done → in_progress → return_pending → closed
