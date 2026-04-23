import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, CheckCircle2, XCircle } from "lucide-react";

const PROFILES = [
  {
    name: "Administrador",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    description: "Acesso total ao sistema, incluindo configurações e gerenciamento de usuários.",
    permissions: [
      { label: "Dashboard", allowed: true },
      { label: "Diárias (criar, editar, excluir)", allowed: true },
      { label: "Equipe (criar, editar, excluir)", allowed: true },
      { label: "Equipamentos (criar, editar, excluir)", allowed: true },
      { label: "Saída de equipamentos", allowed: true },
      { label: "Devolução de equipamentos", allowed: true },
      { label: "Histórico completo", allowed: true },
      { label: "Usuários e Configurações", allowed: true },
      { label: "Personalização do sistema", allowed: true },
      { label: "Modelos de WhatsApp", allowed: true },
    ],
  },
  {
    name: "Operador",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    description: "Gerencia equipe, equipamentos, diárias, saídas e devoluções. Sem acesso a configurações.",
    permissions: [
      { label: "Dashboard", allowed: true },
      { label: "Diárias (criar, editar, excluir)", allowed: true },
      { label: "Equipe (criar, editar, excluir)", allowed: true },
      { label: "Equipamentos (criar, editar, excluir)", allowed: true },
      { label: "Saída de equipamentos", allowed: true },
      { label: "Devolução de equipamentos", allowed: true },
      { label: "Histórico completo", allowed: true },
      { label: "Usuários e Configurações", allowed: false },
      { label: "Personalização do sistema", allowed: false },
      { label: "Modelos de WhatsApp", allowed: false },
    ],
  },
  {
    name: "Revisor",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    description: "Visualiza diárias, equipe e equipamentos. Pode revisar saídas e devoluções.",
    permissions: [
      { label: "Dashboard", allowed: true },
      { label: "Diárias (somente leitura)", allowed: true },
      { label: "Equipe (somente leitura)", allowed: true },
      { label: "Equipamentos (somente leitura)", allowed: true },
      { label: "Revisar saída/devolução", allowed: true },
      { label: "Criar/editar diárias", allowed: false },
      { label: "Criar/editar equipe ou equipamentos", allowed: false },
      { label: "Usuários e Configurações", allowed: false },
      { label: "Personalização do sistema", allowed: false },
      { label: "Modelos de WhatsApp", allowed: false },
    ],
  },
  {
    name: "Visualizador",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
    description: "Somente leitura. Pode visualizar mas não pode criar, editar nem excluir nada.",
    permissions: [
      { label: "Dashboard (somente leitura)", allowed: true },
      { label: "Diárias (somente leitura)", allowed: true },
      { label: "Equipe (somente leitura)", allowed: true },
      { label: "Equipamentos (somente leitura)", allowed: true },
      { label: "Criar ou editar qualquer dado", allowed: false },
      { label: "Saída / Devolução", allowed: false },
      { label: "Histórico", allowed: false },
      { label: "Usuários e Configurações", allowed: false },
      { label: "Personalização do sistema", allowed: false },
      { label: "Modelos de WhatsApp", allowed: false },
    ],
  },
];

export default function ProfilesTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Os perfis de acesso definem o que cada usuário pode fazer no sistema. Os perfis são fixos e não podem ser personalizados.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {PROFILES.map((profile) => (
          <Card key={profile.name} className={`border ${profile.bg}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className={`h-5 w-5 ${profile.color}`} />
                <CardTitle className={`text-base ${profile.color}`}>{profile.name}</CardTitle>
              </div>
              <CardDescription className="text-xs">{profile.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {profile.permissions.map((perm) => (
                <div key={perm.label} className="flex items-center gap-2 text-sm">
                  {perm.allowed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                  <span className={perm.allowed ? "text-foreground" : "text-muted-foreground line-through"}>
                    {perm.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
