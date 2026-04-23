import {
  Camera,
  Aperture,
  Mic,
  Sun,
  AlignCenter,
  Battery,
  MemoryStick,
  Wind,
  Cog,
  Package,
} from "lucide-react";

export const TEAM_ROLES = [
  "Diretor",
  "Produtor",
  "Cinegrafista",
  "2º Cinegrafista",
  "Fotógrafo",
  "Assistente",
  "Assistente de Maquinaria",
  "Assistente de Câmera",
  "Operador de Drone",
  "Editor",
  "Social Media",
  "Motorista",
  "Apoio de Produção",
];

export const EQUIPMENT_CATEGORIES = [
  { value: "câmera", label: "Câmera", icon: Camera },
  { value: "lente", label: "Lente", icon: Aperture },
  { value: "áudio", label: "Áudio", icon: Mic },
  { value: "luz", label: "Luz", icon: Sun },
  { value: "tripé", label: "Tripé", icon: AlignCenter },
  { value: "bateria", label: "Bateria", icon: Battery },
  { value: "cartão de memória", label: "Cartão de Memória", icon: MemoryStick },
  { value: "drone", label: "Drone", icon: Wind },
  { value: "maquinaria", label: "Maquinaria", icon: Cog },
  { value: "acessórios", label: "Acessórios", icon: Package },
];

export const EQUIPMENT_STATUS_COLORS: Record<string, "success" | "warning" | "info" | "destructive" | "default"> = {
  available: "success",
  reserved: "warning",
  in_use: "info",
  maintenance: "warning", // will override to orange in component
  damaged: "destructive",
  pending_return: "warning", // will override to amber
};

export const EQUIPMENT_STATUS_LABELS: Record<string, string> = {
  available: "Disponível",
  reserved: "Reservado",
  in_use: "Em Uso",
  maintenance: "Manutenção",
  damaged: "Danificado",
  pending_return: "Pendente Devolução",
};

export const SHOOT_STATUS_COLORS: Record<string, string> = {
  planned: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  team_defined: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  equipment_separated: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  checkout_done: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  in_progress: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  return_pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  closed: "bg-green-600 text-white dark:bg-green-700 dark:text-white",
};

export const SHOOT_STATUS_LABELS: Record<string, string> = {
  planned: "Planejado",
  team_defined: "Equipe Definida",
  equipment_separated: "Equip. Separado",
  checkout_done: "Saída Registrada",
  in_progress: "Em Andamento",
  return_pending: "Retorno Pendente",
  closed: "Finalizada",
};

export const SHOOT_PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300",
};

export const SHOOT_PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};
