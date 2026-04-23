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
  closed: "Fechado",
};

export const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-500",
  team_defined: "bg-purple-500",
  equipment_separated: "bg-indigo-500",
  checkout_done: "bg-amber-500",
  in_progress: "bg-green-500",
  return_pending: "bg-orange-500",
  closed: "bg-gray-400",
};

export const STATUS_BG: Record<string, string> = {
  planned: "bg-blue-50 border-blue-200",
  team_defined: "bg-purple-50 border-purple-200",
  equipment_separated: "bg-indigo-50 border-indigo-200",
  checkout_done: "bg-amber-50 border-amber-200",
  in_progress: "bg-green-50 border-green-200",
  return_pending: "bg-orange-50 border-orange-200",
  closed: "bg-gray-50 border-gray-200",
};

export const STATUS_TEXT: Record<string, string> = {
  planned: "text-blue-700",
  team_defined: "text-purple-700",
  equipment_separated: "text-indigo-700",
  checkout_done: "text-amber-700",
  in_progress: "text-green-700",
  return_pending: "text-orange-700",
  closed: "text-gray-600",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "text-green-700 bg-green-100 border-green-200",
  medium: "text-blue-700 bg-blue-100 border-blue-200",
  high: "text-amber-700 bg-amber-100 border-amber-200",
  urgent: "text-red-700 bg-red-100 border-red-200",
};
