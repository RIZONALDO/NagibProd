import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type SystemUser } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, KeyRound, UserCheck, UserX, Clapperboard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PROFILES = [
  { value: "administrador", label: "Administrador" },
  { value: "operador", label: "Operador" },
  { value: "revisor", label: "Revisor" },
  { value: "visualizador", label: "Visualizador" },
];

function profileBadge(profile: string) {
  const colors: Record<string, string> = {
    administrador: "bg-red-100 text-red-800 border-red-200",
    operador: "bg-blue-100 text-blue-800 border-blue-200",
    revisor: "bg-purple-100 text-purple-800 border-purple-200",
    visualizador: "bg-gray-100 text-gray-700 border-gray-200",
  };
  const labels: Record<string, string> = {
    administrador: "Administrador",
    operador: "Operador",
    revisor: "Revisor",
    visualizador: "Visualizador",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[profile] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {labels[profile] ?? profile}
    </span>
  );
}

interface UserForm {
  name: string;
  email: string;
  login: string;
  password: string;
  profile: string;
  phone: string;
  notes: string;
  status: string;
  isProducer: boolean;
}

const emptyForm: UserForm = {
  name: "",
  email: "",
  login: "",
  password: "",
  profile: "operador",
  phone: "",
  notes: "",
  status: "active",
  isProducer: false,
};

export default function UsersTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<SystemUser | null>(null);
  const [resetTarget, setResetTarget] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["settings-users", search, filterProfile, filterStatus],
    queryFn: () =>
      usersApi.list({
        search: search || undefined,
        profile: filterProfile !== "all" ? filterProfile : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-users"] });
      setDialogOpen(false);
      toast({ title: "Usuário criado com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserForm> }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-users"] });
      setDialogOpen(false);
      toast({ title: "Usuário atualizado" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-users"] });
      setDeleteTarget(null);
      toast({ title: "Usuário excluído" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      usersApi.resetPassword(id, password),
    onSuccess: () => {
      setResetTarget(null);
      setNewPassword("");
      toast({ title: "Senha redefinida com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const toggleStatus = (user: SystemUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    updateMutation.mutate({ id: user.id, data: { status: newStatus } });
  };

  const openCreate = () => {
    setEditUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: SystemUser) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      login: user.login,
      password: "",
      profile: user.profile,
      phone: user.phone ?? "",
      notes: user.notes ?? "",
      status: user.status,
      isProducer: user.isProducer ?? false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editUser) {
      const data: Partial<UserForm> = { ...form };
      if (!data.password) delete data.password;
      updateMutation.mutate({ id: editUser.id, data });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou login..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterProfile} onValueChange={setFilterProfile}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Perfis</SelectItem>
              {PROFILES.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Carregando...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">Nenhum usuário encontrado</div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{user.name}</span>
                        {profileBadge(user.profile)}
                        {user.isProducer && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-amber-50 text-amber-800 border-amber-200">
                            <Clapperboard className="h-3 w-3" />
                            Produtor
                          </span>
                        )}
                        <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                          {user.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 space-x-2">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>@{user.login}</span>
                        {user.lastLoginAt && (
                          <>
                            <span>•</span>
                            <span>
                              Último acesso: {format(new Date(user.lastLoginAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title={user.status === "active" ? "Desativar" : "Ativar"}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === "active" ? (
                        <UserX className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title="Redefinir senha"
                      onClick={() => { setResetTarget(user); setNewPassword(""); }}
                    >
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title="Editar"
                      onClick={() => openEdit(user)}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title="Excluir"
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Nome completo *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Login *</Label>
                <Input value={form.login} onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>{editUser ? "Nova senha (deixe em branco para manter)" : "Senha *"}</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Perfil de acesso *</Label>
                <Select value={form.profile} onValueChange={(v) => setForm((f) => ({ ...f, profile: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Observações</Label>
                <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-lg border p-3 bg-amber-50/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clapperboard className="h-4 w-4 text-amber-600" />
                    É Produtor
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permite criar e gerenciar pautas. Seu nome aparece como responsável.
                  </p>
                </div>
                <Switch
                  checked={form.isProducer}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isProducer: v }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editUser ? "Salvar alterações" : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{deleteTarget?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Definindo nova senha para <strong>{resetTarget?.name}</strong>.
            </p>
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>Cancelar</Button>
            <Button
              onClick={() => resetTarget && resetPasswordMutation.mutate({ id: resetTarget.id, password: newPassword })}
              disabled={newPassword.length < 6 || resetPasswordMutation.isPending}
            >
              Redefinir senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
