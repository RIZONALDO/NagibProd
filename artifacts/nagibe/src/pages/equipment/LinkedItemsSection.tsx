import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useListEquipment } from "@workspace/api-client-react";
import {
  getEquipmentLinks,
  createEquipmentLink,
  updateEquipmentLink,
  deleteEquipmentLink,
  type EquipmentLink,
} from "@/lib/equipment-links-api";
import { Link2, Plus, Trash2, Pencil, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LinkedItemsSectionProps {
  equipmentId: number;
  equipmentName: string;
}

function availabilityColor(avail: number, total: number) {
  if (avail === 0) return "text-red-500";
  if (avail < total) return "text-amber-500";
  return "text-green-500";
}

export function LinkedItemsSection({ equipmentId, equipmentName }: LinkedItemsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const linksKey = ["equipment-links", equipmentId];

  const { data: links = [], isLoading } = useQuery({
    queryKey: linksKey,
    queryFn: () => getEquipmentLinks(equipmentId),
  });

  const { data: allEquipment = [] } = useListEquipment({});

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<EquipmentLink | null>(null);

  const [form, setForm] = useState({
    linkedEquipmentId: "",
    defaultQuantity: "1",
    required: false,
    notes: "",
  });

  const resetForm = () => setForm({ linkedEquipmentId: "", defaultQuantity: "1", required: false, notes: "" });

  useEffect(() => {
    if (editingLink) {
      setForm({
        linkedEquipmentId: String(editingLink.linkedEquipmentId),
        defaultQuantity: String(editingLink.defaultQuantity),
        required: editingLink.required,
        notes: editingLink.notes ?? "",
      });
    }
  }, [editingLink]);

  const createMutation = useMutation({
    mutationFn: () =>
      createEquipmentLink(equipmentId, {
        linkedEquipmentId: parseInt(form.linkedEquipmentId),
        defaultQuantity: parseInt(form.defaultQuantity),
        required: form.required,
        notes: form.notes || null,
      }),
    onSuccess: () => {
      toast({ title: "Item vinculado adicionado" });
      queryClient.invalidateQueries({ queryKey: linksKey });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateEquipmentLink(equipmentId, editingLink!.id, {
        defaultQuantity: parseInt(form.defaultQuantity),
        required: form.required,
        notes: form.notes || null,
      }),
    onSuccess: () => {
      toast({ title: "Vínculo atualizado" });
      queryClient.invalidateQueries({ queryKey: linksKey });
      setEditingLink(null);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (linkId: number) => deleteEquipmentLink(equipmentId, linkId),
    onSuccess: () => {
      toast({ title: "Vínculo removido" });
      queryClient.invalidateQueries({ queryKey: linksKey });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const alreadyLinkedIds = new Set(links.map((l) => l.linkedEquipmentId));
  const availableToLink = allEquipment.filter(
    (eq) => eq.id !== equipmentId && !alreadyLinkedIds.has(eq.id)
  );

  const handleSubmit = () => {
    if (!form.linkedEquipmentId || !form.defaultQuantity) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (editingLink) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Itens Vinculados</CardTitle>
              <CardDescription className="mt-0.5">
                Itens que normalmente acompanham <strong>{equipmentName}</strong> nas pautas
              </CardDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Vincular Item
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-4 text-center">Carregando...</div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
            <Link2 className="h-8 w-8 opacity-30" />
            <p className="text-sm">Nenhum item vinculado.</p>
            <p className="text-xs">Vincule itens que geralmente acompanham este equipamento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const avail = link.linkedEquipment.availableQuantity;
              const total = link.linkedEquipment.totalQuantity;
              const unavailable = avail === 0;

              return (
                <div
                  key={link.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                    unavailable
                      ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="mt-0.5">
                    {unavailable ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {link.linkedEquipment.name}
                      </span>
                      {link.linkedEquipment.internalCode && (
                        <span className="text-xs text-muted-foreground">
                          ({link.linkedEquipment.internalCode})
                        </span>
                      )}
                      <Badge
                        variant={link.required ? "default" : "secondary"}
                        className="text-xs h-5"
                      >
                        {link.required ? "Obrigatório" : "Opcional"}
                      </Badge>
                      <Badge variant="outline" className="text-xs h-5">
                        {link.defaultQuantity}x
                      </Badge>
                    </div>

                    <div className={`text-xs mt-0.5 ${availabilityColor(avail, total)}`}>
                      {unavailable
                        ? "Indisponível no estoque"
                        : `${avail} de ${total} disponíveis`}
                    </div>

                    {link.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{link.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingLink(link)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover vínculo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O item <strong>{link.linkedEquipment.name}</strong> não será mais sugerido automaticamente com este equipamento.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(link.id)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Add / Edit Dialog */}
      <Dialog
        open={isAddOpen || !!editingLink}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingLink(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Editar vínculo" : "Vincular item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editingLink && (
              <div className="space-y-1.5">
                <Label>Equipamento vinculado <span className="text-destructive">*</span></Label>
                <Select
                  value={form.linkedEquipmentId}
                  onValueChange={(v) => setForm((f) => ({ ...f, linkedEquipmentId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToLink.map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        <span className="flex items-center gap-2">
                          {eq.name}
                          {eq.internalCode && (
                            <span className="text-muted-foreground text-xs">({eq.internalCode})</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingLink === null && availableToLink.length === 0 && (
                  <p className="text-xs text-muted-foreground">Todos os equipamentos já estão vinculados.</p>
                )}
              </div>
            )}

            {editingLink && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span className="font-medium">{editingLink.linkedEquipment.name}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Quantidade padrão <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min="1"
                  value={form.defaultQuantity}
                  onChange={(e) => setForm((f) => ({ ...f, defaultQuantity: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Obrigatoriedade</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="required-switch"
                    checked={form.required}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, required: v }))}
                  />
                  <Label htmlFor="required-switch" className="cursor-pointer font-normal">
                    {form.required ? "Obrigatório" : "Opcional"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                placeholder="Ex: Verificar carga antes de usar..."
                className="min-h-[80px] resize-none"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            {form.required && (
              <p className="text-xs text-primary bg-primary/5 rounded-lg px-3 py-2 border border-primary/20">
                Itens obrigatórios são adicionados automaticamente quando este equipamento é incluído numa pauta.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingLink(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Salvando..." : editingLink ? "Atualizar" : "Vincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
