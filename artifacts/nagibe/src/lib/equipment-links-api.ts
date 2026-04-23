const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

export interface LinkedEquipmentInfo {
  id: number;
  name: string;
  category: string;
  availableQuantity: number;
  totalQuantity: number;
  status: string;
  internalCode: string | null;
}

export interface EquipmentLink {
  id: number;
  equipmentId: number;
  linkedEquipmentId: number;
  defaultQuantity: number;
  required: boolean;
  notes: string | null;
  createdAt: string;
  linkedEquipment: LinkedEquipmentInfo;
}

export async function getEquipmentLinks(equipmentId: number): Promise<EquipmentLink[]> {
  const res = await fetch(`${API_BASE}/equipment/${equipmentId}/links`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao carregar itens vinculados");
  return res.json();
}

export async function createEquipmentLink(
  equipmentId: number,
  data: { linkedEquipmentId: number; defaultQuantity: number; required: boolean; notes?: string | null }
): Promise<EquipmentLink> {
  const res = await fetch(`${API_BASE}/equipment/${equipmentId}/links`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao criar vínculo");
  }
  return res.json();
}

export async function updateEquipmentLink(
  equipmentId: number,
  linkId: number,
  data: { defaultQuantity?: number; required?: boolean; notes?: string | null }
): Promise<EquipmentLink> {
  const res = await fetch(`${API_BASE}/equipment/${equipmentId}/links/${linkId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erro ao atualizar vínculo");
  }
  return res.json();
}

export async function deleteEquipmentLink(equipmentId: number, linkId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/equipment/${equipmentId}/links/${linkId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao remover vínculo");
}
