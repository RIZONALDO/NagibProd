const API_BASE = "/api";

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as T;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  login: string;
  profile: string;
  avatarUrl: string | null;
  isProducer: boolean;
}

export interface SystemUser extends AuthUser {
  phone: string | null;
  notes: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  company_name?: string;
  system_name?: string;
  logo_url?: string;
  logo_small_url?: string;
  primary_color?: string;
  secondary_color?: string;
  favicon_url?: string;
  footer_text?: string;
  date_format?: string;
  timezone?: string;
  login_message?: string;
  whatsapp_button?: string;
  language?: string;
  dark_mode?: string;
  [key: string]: string | undefined;
}

export interface WhatsappTemplate {
  id: number;
  templateKey: string;
  name: string;
  content: string;
  updatedAt: string;
}

export const authApi = {
  login: (login: string, password: string) =>
    apiFetch<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    }),

  logout: () =>
    apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  me: () => apiFetch<AuthUser>("/auth/me"),
};

export const usersApi = {
  list: (params?: { search?: string; profile?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.profile) qs.set("profile", params.profile);
    if (params?.status) qs.set("status", params.status);
    return apiFetch<SystemUser[]>(`/settings/users?${qs.toString()}`);
  },

  create: (data: {
    name: string;
    email: string;
    login: string;
    password: string;
    profile: string;
    phone?: string;
    notes?: string;
    avatarUrl?: string;
    status?: string;
  }) => apiFetch<SystemUser>("/settings/users", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<Omit<SystemUser, "id" | "createdAt" | "updatedAt" | "lastLoginAt"> & { password?: string }>) =>
    apiFetch<SystemUser>(`/settings/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  resetPassword: (id: number, password: string) =>
    apiFetch<{ ok: boolean }>(`/settings/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ password }) }),

  delete: (id: number) =>
    apiFetch<void>(`/settings/users/${id}`, { method: "DELETE" }),
};

export const settingsApi = {
  getApp: () => apiFetch<AppSettings>("/settings/app"),
  updateApp: (data: Partial<AppSettings>) =>
    apiFetch<AppSettings>("/settings/app", { method: "PATCH", body: JSON.stringify(data) }),

  getTemplates: () => apiFetch<WhatsappTemplate[]>("/settings/whatsapp-templates"),
  updateTemplate: (key: string, content: string) =>
    apiFetch<WhatsappTemplate>(`/settings/whatsapp-templates/${key}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),
};
