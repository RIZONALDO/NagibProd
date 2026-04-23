import { useState, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { getEquipmentLinks, type EquipmentLink } from "@/lib/equipment-links-api";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link2, AlertTriangle, PackageCheck, PackageX, ClipboardList, CheckCircle2 } from "lucide-react";
import { 
  useGetShoot, 
  useUpdateShoot,
  useDeleteShoot,
  useAddShootTeamMember,
  useRemoveShootTeamMember,
  useAddShootEquipment,
  useRemoveShootEquipment,
  useListTeamMembers,
  useListEquipment,
  getGetShootQueryKey, 
  getListShootsQueryKey 
} from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Trash2, Copy, Send, Edit, Plus, Users, Camera, Calendar, MapPin, Clock, Briefcase, UserCircle2, X } from "lucide-react";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-fuchsia-500", "bg-orange-500",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShootStatusBadge, ShootPriorityBadge, EquipmentStatusBadge, ShootOverdueBadge, isShootOverdue } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ShootForm, ShootFormValues } from "./form";
import { TravelSection } from "./TravelSection";
import { format, differenceInCalendarDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TEAM_ROLES, EQUIPMENT_CATEGORIES } from "@/lib/constants";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ShootDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);

  // Inline add form states
  const [teamMemberId, setTeamMemberId] = useState<string>("");
  const [teamRole, setTeamRole] = useState<string>("");
  
  const [equipmentId, setEquipmentId] = useState<string>("");
  const [equipQuantity, setEquipQuantity] = useState<string>("1");

  // Linked items suggestion state
  interface OptionalLinkItem { link: EquipmentLink; quantity: number; selected: boolean; required: boolean }
  const [linkedSuggestion, setLinkedSuggestion] = useState<{
    parentItemId: number;
    parentName: string;
    items: OptionalLinkItem[];
  } | null>(null);
  const [isAddingLinked, setIsAddingLinked] = useState(false);

  const { data: shoot, isLoading } = useGetShoot(id, { query: { enabled: !!id } });
  
  // Always load selectors — needed for inline forms
  const { data: teamMembers } = useListTeamMembers({ status: "active" }, { query: { enabled: !isEditing } });
  const { data: equipments } = useListEquipment({ status: "available" }, { query: { enabled: !isEditing } });

  const { isOperator } = useAuth();

  const updateMutation = useUpdateShoot();
  const deleteMutation = useDeleteShoot();
  const addTeamMutation = useAddShootTeamMember();
  const removeTeamMutation = useRemoveShootTeamMember();
  const addEquipMutation = useAddShootEquipment();
  const removeEquipMutation = useRemoveShootEquipment();

  const canFinalize = (s: typeof shoot) => {
    const refDate = (s as { endDate?: string | null }).endDate ?? s.date;
    try {
      return differenceInCalendarDays(new Date(), parseISO(refDate)) >= 0;
    } catch {
      return false;
    }
  };

  const handleFinalizeShoot = () => {
    updateMutation.mutate({ id, data: { status: "closed" } }, {
      onSuccess: () => {
        toast({ title: "Pauta finalizada com sucesso!" });
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Erro ao finalizar pauta", description: String(err), variant: "destructive" });
      }
    });
  };

  const handleCancelShoot = () => {
    updateMutation.mutate({ id, data: { status: "cancelled" } }, {
      onSuccess: () => {
        toast({ title: "Pauta cancelada", description: "A pauta foi marcada como cancelada." });
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Erro ao cancelar pauta", description: String(err), variant: "destructive" });
      }
    });
  };

  const handleUpdate = (data: ShootFormValues) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast({ title: "Pauta atualizada com sucesso" });
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() });
        setIsEditing(false);
      },
      onError: (err) => {
        toast({ title: "Erro ao atualizar", description: String(err), variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Pauta removida com sucesso" });
        queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() });
        setLocation("/shoots");
      },
      onError: (err) => {
        toast({ title: "Erro ao remover", description: String(err), variant: "destructive" });
      }
    });
  };

  const handleAddTeamMember = () => {
    if (!teamMemberId || !teamRole) {
      toast({ title: "Selecione o membro e a função", variant: "destructive" });
      return;
    }
    
    addTeamMutation.mutate({ 
      id, 
      data: { teamMemberId: parseInt(teamMemberId), role: teamRole } 
    }, {
      onSuccess: () => {
        toast({ title: "Membro adicionado" });
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
        setTeamMemberId("");
        setTeamRole("");
      }
    });
  };

  const handleRemoveTeamMember = (memberId: number) => {
    removeTeamMutation.mutate({ id, memberId }, {
      onSuccess: () => {
        toast({ title: "Membro removido" });
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
      }
    });
  };

  const handleAddEquipment = () => {
    if (!equipmentId || !equipQuantity) {
      toast({ title: "Selecione o equipamento e a quantidade", variant: "destructive" });
      return;
    }
    
    const eqId = parseInt(equipmentId);
    const eqName = equipments?.find(e => e.id === eqId)?.name ?? "Equipamento";

    addEquipMutation.mutate({ 
      id, 
      data: { equipmentId: eqId, quantity: parseInt(equipQuantity) } 
    }, {
      onSuccess: async (parentRow) => {
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
        setEquipmentId("");
        setEquipQuantity("1");

        // Fetch and process linked items
        try {
          const links = await getEquipmentLinks(eqId);
          toast({ title: "Equipamento adicionado" });

          if (links.length === 0) return;

          const currentEquipIds = new Set(
            shoot?.equipmentItems?.map(i => i.equipmentId) ?? []
          );

          const newLinks = links.filter(l => !currentEquipIds.has(l.linkedEquipmentId));
          if (newLinks.length === 0) return;

          // Show unified dialog for ALL linked items (required pre-checked, optional pre-checked)
          setLinkedSuggestion({
            parentItemId: (parentRow as { id: number }).id,
            parentName: eqName,
            items: newLinks.map(link => ({
              link,
              quantity: link.defaultQuantity,
              selected: true,
              required: link.required,
            })),
          });
        } catch {
          toast({ title: "Equipamento adicionado" });
        }
      }
    });
  };

  const handleConfirmOptionalLinked = useCallback(async () => {
    if (!linkedSuggestion) return;
    setIsAddingLinked(true);

    const toAdd = linkedSuggestion.items.filter(i => i.selected);
    for (const item of toAdd) {
      try {
        await fetch(
          `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api/shoots/${id}/equipment`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              equipmentId: item.link.linkedEquipmentId,
              quantity: item.quantity,
              isLinkedItem: true,
              parentShootEquipmentId: linkedSuggestion.parentItemId,
            }),
          }
        );
      } catch { /* silently continue */ }
    }

    queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
    setIsAddingLinked(false);
    setLinkedSuggestion(null);
    if (toAdd.length > 0) toast({ title: `${toAdd.length} item(s) vinculado(s) adicionado(s)` });
  }, [linkedSuggestion, id, queryClient]);

  const handleRemoveEquipment = (itemId: number) => {
    removeEquipMutation.mutate({ id, itemId }, {
      onSuccess: () => {
        toast({ title: "Equipamento removido" });
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Texto copiado!" });
    });
  };

  const getPautaText = () => {
    if (!shoot) return "";
    const formattedDate = format(new Date(shoot.date), "dd/MM/yyyy");
    
    let text = `🎬 *Espelho da Pauta*\n`;
    text += `📅 Data: ${formattedDate}\n`;
    text += `⏰ Horário: ${shoot.time || 'A definir'}\n`;
    text += `📍 Local: ${shoot.location}\n`;
    if (shoot.whatsappSummary) text += `📝 Pauta: ${shoot.whatsappSummary}\n`;
    if (shoot.producerName) text += `👤 Produtor: ${shoot.producerName}\n\n`;
    
    if (shoot.team && shoot.team.length > 0) {
      text += `👥 *Equipe*\n`;
      shoot.team.forEach(m => {
        text += `${m.role}: ${m.teamMember.name}\n`;
      });
    }
    
    return text;
  };

  const getEquipmentText = () => {
    if (!shoot) return "";
    let text = `📦 *Espelho de Equipamentos*\n\n`;
    
    if (shoot.equipmentItems && shoot.equipmentItems.length > 0) {
      shoot.equipmentItems.forEach(item => {
        text += `- ${item.equipment.name} (${item.quantity}x)\n`;
      });
      text += `\n✅ Saída registrada`;
    } else {
      text += `Nenhum equipamento listado.`;
    }
    
    return text;
  };

  const openWhatsApp = (text: string) => {
    copyToClipboard(text);
    window.open('https://web.whatsapp.com', '_blank');
  };

  if (isLoading || !shoot) {
    return (
      <Shell>
        <div className="space-y-6 max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (isEditing) {
    return (
      <Shell>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Pauta</h1>
              <p className="text-muted-foreground">{shoot.location}</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ShootForm defaultValues={shoot} onSubmit={handleUpdate} isSubmitting={updateMutation.isPending} />
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  const shootEndDate = (shoot as { endDate?: string | null }).endDate;
  const formattedDate = format(new Date(shoot.date + "T12:00:00"), "dd 'de' MMMM, yyyy", { locale: ptBR });
  const formattedEndDate = shootEndDate
    ? format(new Date(shootEndDate + "T12:00:00"), "dd 'de' MMMM, yyyy", { locale: ptBR })
    : null;

  return (
    <Shell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/shoots" className="text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShootPriorityBadge priority={shoot.priority} />
                <ShootStatusBadge status={shoot.status} />
                {isShootOverdue({ status: shoot.status, date: shoot.date, endDate: (shoot as { endDate?: string | null }).endDate }) && (
                  <ShootOverdueBadge />
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {(shoot as { title?: string | null }).title || shoot.clientProject || shoot.location}
              </h1>
              {(shoot as { title?: string | null }).title && (
                <p className="text-sm text-muted-foreground mt-0.5">{shoot.clientProject || shoot.location}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Finalizar — só disponível após o dia da pauta */}
            {isOperator && shoot.status !== "closed" && shoot.status !== "cancelled" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleFinalizeShoot}
                disabled={updateMutation.isPending || !canFinalize(shoot)}
                title={!canFinalize(shoot) ? "Só é possível finalizar após o término da pauta" : undefined}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Pauta Finalizada
              </Button>
            )}

            {/* Cancelar */}
            {shoot.status !== "closed" && shoot.status !== "cancelled" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30">
                    <X className="h-4 w-4 mr-2" /> Cancelar Pauta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar esta pauta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A pauta será marcada como cancelada. Esta ação pode ser desfeita editando o status da pauta manualmente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelShoot}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Confirmar Cancelamento
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação removerá a pauta permanentemente. Os equipamentos voltarão ao status disponível se não houver checkout ativo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{formattedEndDate ? "Período" : "Data"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedDate}
                      {formattedEndDate && (
                        <span> → {formattedEndDate}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Horário</p>
                    <p className="text-sm text-muted-foreground">{shoot.time || "A definir"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Local</p>
                    <p className="text-sm text-muted-foreground">{shoot.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Produtor</p>
                    <p className="text-sm text-muted-foreground">{shoot.producerName || "Não especificado"}</p>
                  </div>
                </div>
                {shoot.briefing && (
                  <div className="sm:col-span-2 mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-1">Briefing</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{shoot.briefing}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {(shoot as { scheduleChangedAt?: string | null }).scheduleChangedAt && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 px-3 py-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Data ou horário alterado</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-snug">
                    Os dias ou horário desta pauta foram modificados. Verifique se a equipe e os equipamentos estão cientes da mudança.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
                    await fetch(`${base}/api/shoots/${id}`, {
                      method: "PATCH",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ scheduleChangedAt: null }),
                    });
                    queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
                  }}
                  className="shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                  title="Dispensar aviso"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Equipe Escalada</CardTitle>
              </CardHeader>
              <CardContent>
                {!shoot.team || shoot.team.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg mb-3">
                    <Users className="h-7 w-7 mx-auto mb-1.5 opacity-20" />
                    <p className="text-sm">Nenhum membro escalado</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-3">
                    {shoot.team.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-xl bg-card">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(member.teamMember.name)}`}>
                            {getInitials(member.teamMember.name)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.teamMember.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive h-8 w-8"
                          onClick={() => handleRemoveTeamMember(member.teamMemberId)}
                          disabled={removeTeamMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline quick-add form */}
                <div className="flex gap-2 items-center">
                  <Select value={teamMemberId} onValueChange={setTeamMemberId}>
                    <SelectTrigger className="flex-1 h-9 text-sm">
                      <SelectValue placeholder="Membro..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(teamMembers ?? [])
                        .filter(tm => !shoot.team?.some(t => t.teamMemberId === tm.id))
                        .map(tm => (
                          <SelectItem key={tm.id} value={tm.id.toString()}>
                            {tm.name} <span className="text-muted-foreground text-xs">({tm.primaryRole})</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select value={teamRole} onValueChange={setTeamRole}>
                    <SelectTrigger className="w-36 h-9 text-sm">
                      <SelectValue placeholder="Função..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="h-9 px-3 shrink-0"
                    onClick={handleAddTeamMember}
                    disabled={addTeamMutation.isPending || !teamMemberId || !teamRole}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <TravelSection
                    shootId={id}
                    hasTravel={!!(shoot as { hasTravel?: boolean }).hasTravel}
                    shootDate={shoot.date}
                    shootEndDate={(shoot as { endDate?: string | null }).endDate ?? null}
                    team={(shoot.team ?? []).map(m => ({
                      id: m.id,
                      teamMemberId: m.teamMemberId,
                      role: m.role,
                      travelDiarias: (m as { travelDiarias?: number }).travelDiarias ?? 0,
                      teamMember: m.teamMember,
                    }))}
                    onRefresh={() => queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Equipamentos Solicitados</CardTitle>
              </CardHeader>
              <CardContent>
                {!shoot.equipmentItems || shoot.equipmentItems.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nenhum equipamento solicitado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const items = shoot.equipmentItems ?? [];
                      const parentItems = items.filter(i => !i.isLinkedItem);
                      const linkedByParent = new Map<number, typeof items>();
                      items.filter(i => i.isLinkedItem && i.parentShootEquipmentId).forEach(i => {
                        const arr = linkedByParent.get(i.parentShootEquipmentId!) ?? [];
                        arr.push(i);
                        linkedByParent.set(i.parentShootEquipmentId!, arr);
                      });
                      // Orphaned linked items (parent removed)
                      const orphaned = items.filter(i => i.isLinkedItem && !i.parentShootEquipmentId);
                      const allParents = [...parentItems, ...orphaned];

                      return allParents.map(item => {
                        const CatIcon = EQUIPMENT_CATEGORIES.find(c => c.value === item.equipment?.category)?.icon || Camera;
                        return (
                        <div key={item.id}>
                          {/* Parent row */}
                          <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <CatIcon className="h-4 w-4 text-primary" />
                              </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <p className="font-medium text-sm">{item.equipment?.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">Quantidade: {item.quantity}</p>
                                {shoot.checkout && (
                                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                    <PackageCheck className="h-3 w-3" /> Saída
                                  </span>
                                )}
                              </div>
                            </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive h-8 w-8"
                              onClick={() => handleRemoveEquipment(item.id)}
                              disabled={removeEquipMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Linked children */}
                          {(linkedByParent.get(item.id) ?? []).map(child => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between ml-6 mt-1 p-2.5 border border-dashed rounded-xl bg-muted/40"
                            >
                              <div className="flex items-center gap-2">
                                <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div>
                                  <p className="text-sm text-muted-foreground">{child.equipment?.name}</p>
                                  <p className="text-xs text-muted-foreground/70">{child.quantity}x · vinculado</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-7 w-7"
                                onClick={() => handleRemoveEquipment(child.id)}
                                disabled={removeEquipMutation.isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                      });
                    })()}
                  </div>
                )}
                
                {/* Inline quick-add equipment */}
                <div className="mt-3 flex gap-2 items-center">
                  <Select value={equipmentId} onValueChange={setEquipmentId}>
                    <SelectTrigger className="flex-1 h-9 text-sm">
                      <SelectValue placeholder="Equipamento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(equipments ?? [])
                        .filter(eq => !shoot.equipmentItems?.some(i => i.equipmentId === eq.id && !i.isLinkedItem))
                        .map(eq => (
                          <SelectItem key={eq.id} value={eq.id.toString()}>
                            {eq.name} <span className="text-muted-foreground text-xs">({eq.availableQuantity} disp.)</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={equipQuantity}
                    onChange={e => setEquipQuantity(e.target.value)}
                    className="w-16 h-9 text-center text-sm"
                    placeholder="Qtd"
                  />
                  <Button
                    size="sm"
                    className="h-9 px-3 shrink-0"
                    onClick={handleAddEquipment}
                    disabled={addEquipMutation.isPending || !equipmentId}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Inline linked items suggestion */}
                {linkedSuggestion && (
                  <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Link2 className="h-4 w-4 text-primary" />
                        Itens vinculados a <span className="text-primary">{linkedSuggestion.parentName}</span>
                      </p>
                      <button onClick={() => setLinkedSuggestion(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Deseja adicionar junto?</p>

                    <div className="space-y-1.5">
                      {linkedSuggestion.items.map((optItem) => {
                        const avail = optItem.link.linkedEquipment.availableQuantity;
                        const unavailable = avail === 0;
                        return (
                          <div key={optItem.link.id} className={`flex items-center gap-2 ${unavailable ? "opacity-50" : ""}`}>
                            <Checkbox
                              checked={optItem.selected && !unavailable}
                              disabled={unavailable}
                              onCheckedChange={(checked) =>
                                setLinkedSuggestion(prev => prev ? {
                                  ...prev,
                                  items: prev.items.map(it => it.link.id === optItem.link.id ? { ...it, selected: Boolean(checked) } : it)
                                } : prev)
                              }
                            />
                            <span className="text-sm flex-1 truncate">{optItem.link.linkedEquipment.name}</span>
                            {optItem.required && (
                              <span className="text-[10px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full shrink-0">Obrigatório</span>
                            )}
                            {unavailable ? (
                              <span className="text-xs text-red-500 shrink-0">Indisponível</span>
                            ) : (
                              <Input
                                type="number"
                                min="1"
                                max={avail}
                                disabled={!optItem.selected}
                                value={optItem.quantity}
                                onChange={(e) =>
                                  setLinkedSuggestion(prev => prev ? {
                                    ...prev,
                                    items: prev.items.map(it =>
                                      it.link.id === optItem.link.id ? { ...it, quantity: Math.max(1, parseInt(e.target.value) || 1) } : it
                                    )
                                  } : prev)
                                }
                                className="w-14 h-7 text-center text-xs shrink-0"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={handleConfirmOptionalLinked}
                        disabled={isAddingLinked || !linkedSuggestion.items.some(i => i.selected)}
                      >
                        {isAddingLinked ? "Adicionando..." : "Adicionar selecionados"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-muted-foreground"
                        onClick={() => setLinkedSuggestion(null)}
                      >
                        Pular
                      </Button>
                    </div>
                  </div>
                )}

                {shoot.equipmentItems && shoot.equipmentItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-3">
                    <Link href={`/shoots/${shoot.id}/checkout`} className="flex-1">
                      <Button className="w-full" variant="outline">
                        Registrar Saída (Checkout)
                      </Button>
                    </Link>
                    <Link href={`/shoots/${shoot.id}/return`} className="flex-1">
                      <Button className="w-full" variant="outline">
                        Registrar Devolução
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Espelho WhatsApp</CardTitle>
                <CardDescription>Gere os textos formatados para envio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(getPautaText())}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copiar Pauta
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(getEquipmentText())}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copiar Equipamentos
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(`${getPautaText()}\n\n${getEquipmentText()}`)}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copiar Tudo
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full"
                    onClick={() => openWhatsApp(`${getPautaText()}\n\n${getEquipmentText()}`)}
                  >
                    <Send className="h-4 w-4 mr-2" /> Abrir WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Planejado card — always visible */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Planejado</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <ShootStatusBadge status={shoot.status} />
                  <ShootPriorityBadge priority={shoot.priority} />
                </div>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
                <p className="text-xs text-muted-foreground truncate">{shoot.location}</p>
              </CardContent>
            </Card>

            {/* Saída card — always visible */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Saída</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {shoot.checkout ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Checkout realizado
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(shoot.checkout.checkoutAt), "dd/MM/yyyy HH:mm")}
                    </p>
                    <p className="text-xs">Entregue por: <span className="font-medium">{shoot.checkout.deliveredBy}</span></p>
                    <p className="text-xs">Recebido por: <span className="font-medium">{shoot.checkout.receivedBy}</span></p>
                    {shoot.return && (
                      <div className="mt-2 border-t pt-2 space-y-1">
                        <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Devolução realizada
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(shoot.return.returnAt), "dd/MM/yyyy HH:mm")}
                        </p>
                        <p className="text-xs">Devolvido por: <span className="font-medium">{shoot.return.returnedBy}</span></p>
                        <p className="text-xs">Recebido por: <span className="font-medium">{shoot.return.receivedBy}</span></p>
                        {shoot.return.hasPendencies && (
                          <p className="text-xs font-medium text-destructive">Com pendências/danos</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <PackageX className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">Aguardando saída</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </Shell>
  );
}
