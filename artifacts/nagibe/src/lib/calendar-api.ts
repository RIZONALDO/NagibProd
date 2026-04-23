const API_BASE = "/api";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json() as T;
}

export interface CalendarShoot {
  id: number;
  date: string;
  time: string | null;
  location: string;
  briefing: string | null;
  whatsappSummary: string | null;
  producerName: string | null;
  clientProject: string | null;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  teamCount: number;
  teamConfirmed: boolean;
  teamSummary: { id: number; name: string; role: string; confirmed: boolean }[];
  equipmentCount: number;
  checkoutDone: boolean;
  returnDone: boolean;
  returnPending: boolean;
}

export interface CalendarFilters {
  search?: string;
  producer?: string;
  status?: string;
  priority?: string;
  location?: string;
  teamMemberId?: string;
  clientProject?: string;
}

export function fetchCalendar(
  start: string,
  end: string,
  filters: CalendarFilters = {},
): Promise<CalendarShoot[]> {
  const qs = new URLSearchParams({ start, end });
  if (filters.search) qs.set("search", filters.search);
  if (filters.producer) qs.set("producer", filters.producer);
  if (filters.status) qs.set("status", filters.status);
  if (filters.priority) qs.set("priority", filters.priority);
  if (filters.location) qs.set("location", filters.location);
  if (filters.teamMemberId) qs.set("teamMemberId", filters.teamMemberId);
  if (filters.clientProject) qs.set("clientProject", filters.clientProject);
  return apiFetch<CalendarShoot[]>(`/calendar?${qs.toString()}`);
}

export const STATUS_LABELS: Record<string, string> = {
  planned: "Planejado",
  team_defined: "Equipe Definida",
  equipment_separated: "Equip. Separado",
  checkout_done: "Saída Feita",
  in_progress: "Em Andamento",
  return_pending: "Dev. Pendente",
  closed: "Finalizada",
};

/* Solid dot color (for small indicators) */
export const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-500",
  team_defined: "bg-violet-500",
  equipment_separated: "bg-indigo-500",
  checkout_done: "bg-amber-500",
  in_progress: "bg-emerald-500",
  return_pending: "bg-orange-500",
  closed: "bg-green-500",
};

/* Card tint: background + border + text */
export const STATUS_CARD: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  planned:            { bg: "bg-blue-50 dark:bg-blue-950/40",     border: "border-blue-200 dark:border-blue-800",    text: "text-blue-800 dark:text-blue-200",    dot: "bg-blue-500"    },
  team_defined:       { bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800",text: "text-violet-800 dark:text-violet-200", dot: "bg-violet-500"  },
  equipment_separated:{ bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200 dark:border-indigo-800",text: "text-indigo-800 dark:text-indigo-200", dot: "bg-indigo-500"  },
  checkout_done:      { bg: "bg-amber-50 dark:bg-amber-950/40",   border: "border-amber-200 dark:border-amber-800",  text: "text-amber-800 dark:text-amber-200",  dot: "bg-amber-500"   },
  in_progress:        { bg: "bg-emerald-50 dark:bg-emerald-950/40",border: "border-emerald-200 dark:border-emerald-800",text: "text-emerald-800 dark:text-emerald-200",dot: "bg-emerald-500"},
  return_pending:     { bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-800",text: "text-orange-800 dark:text-orange-200", dot: "bg-orange-500"  },
  closed:             { bg: "bg-green-50 dark:bg-green-950/40",   border: "border-green-200 dark:border-green-800",  text: "text-green-800 dark:text-green-200",  dot: "bg-green-500"   },
};

export const STATUS_BG: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_CARD).map(([k, v]) => [k, `${v.bg} border ${v.border}`]),
);
export const STATUS_TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_CARD).map(([k, v]) => [k, v.text]),
);

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low:    "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-800",
  medium: "text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-300 dark:bg-blue-900/40 dark:border-blue-800",
  high:   "text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-300 dark:bg-amber-900/40 dark:border-amber-800",
  urgent: "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/40 dark:border-red-800",
};
