import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus, Video, Calendar as CalendarIcon, MapPin, FileBarChart2, Clapperboard } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShootStatusBadge, ShootPriorityBadge, ShootOverdueBadge, isShootOverdue } from "@/components/ui/status-badge";
import { SHOOT_PRIORITY_LABELS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const BASE = () => import.meta.env.BASE_URL.replace(/\/$/, "");

type GroupTab = "active" | "closed" | "cancelled" | "all";

const GROUP_TABS: { key: GroupTab; label: string }[] = [
  { key: "active",    label: "Ativas" },
  { key: "closed",    label: "Finalizadas" },
  { key: "cancelled", label: "Canceladas" },
  { key: "all",       label: "Todas" },
];

async function fetchShoots(params: Record<string, string>) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${BASE()}/api/shoots?${qs.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao buscar pautas");
  return res.json();
}

const ACTIVE_STATUS_OPTIONS = [
  { value: "all",                  label: "Todos os Status" },
  { value: "planned",              label: "Planejado" },
  { value: "team_defined",         label: "Equipe Definida" },
  { value: "equipment_separated",  label: "Equip. Separado" },
  { value: "checkout_done",        label: "Saída Registrada" },
  { value: "in_progress",          label: "Em Andamento" },
  { value: "return_pending",       label: "Retorno Pendente" },
];

export default function ShootsList() {
  const [search, setSearch]       = useState("");
  const [group, setGroup]         = useState<GroupTab>("active");
  const [priority, setPriority]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isProducer } = useAuth();

  const params: Record<string, string> = {};
  if (group !== "all")       params.group    = group;
  if (search)                params.search   = search;
  if (priority !== "all")    params.priority = priority;
  if (statusFilter !== "all") params.status  = statusFilter;

  const { data: shoots, isLoading } = useQuery({
    queryKey: ["shoots-list", params],
    queryFn: () => fetchShoots(params),
  });

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pautas</h1>
            <p className="text-muted-foreground">Gerencie as pautas e produções.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/reports/diarias">
              <Button variant="outline" size="sm">
                <FileBarChart2 className="h-4 w-4 mr-1" /> Relatório
              </Button>
            </Link>
            {isProducer && (
              <Link
                href="/shoots/new"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                <Plus className="mr-2 h-4 w-4" /> Nova Diária
              </Link>
            )}
          </div>
        </div>

        {/* Tabs de grupo */}
        <div className="flex gap-0 border-b">
          {GROUP_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setGroup(tab.key); setStatusFilter("all"); }}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                group === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, local ou cliente..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              {Object.entries(SHOOT_PRIORITY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(group === "active" || group === "all") && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVE_STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : shoots?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">Nenhuma pauta encontrada</h3>
            <p>Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shoots?.map((shoot: any) => (
              <Link key={shoot.id} href={`/shoots/${shoot.id}`} className="block group">
                <Card className={cn(
                  "hover:border-primary/50 transition-colors h-full flex flex-col",
                  shoot.status === "cancelled" && "opacity-70 border-red-200 dark:border-red-900"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <ShootPriorityBadge priority={shoot.priority} className="shrink-0" />
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {isShootOverdue(shoot) && <ShootOverdueBadge />}
                        <ShootStatusBadge status={shoot.status} />
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {shoot.title || shoot.clientProject || shoot.location}
                    </CardTitle>
                    {shoot.title && shoot.clientProject && (
                      <p className="text-sm font-medium text-muted-foreground">{shoot.clientProject}</p>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto space-y-2.5">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span>
                        {format(new Date(shoot.date + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                        {shoot.endDate && (
                          <> → {format(new Date(shoot.endDate + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}</>
                        )}
                        {shoot.time ? ` às ${shoot.time}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{shoot.location}</span>
                    </div>
                    {shoot.producerName && (
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Clapperboard className="h-4 w-4 shrink-0" />
                        <span className="truncate">{shoot.producerName}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
