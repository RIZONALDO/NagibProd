import { useState } from "react";
import { useListShoots } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus, Video, Calendar as CalendarIcon, MapPin, FileBarChart2 } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShootStatusBadge, ShootPriorityBadge } from "@/components/ui/status-badge";
import { SHOOT_STATUS_LABELS } from "@/lib/constants";

export default function ShootsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data: shoots, isLoading } = useListShoots({
    search: search || undefined,
    status: status !== "all" ? status : undefined,
  });

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Diárias</h1>
            <p className="text-muted-foreground">Gerencie as gravações e produções.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/reports/diarias">
              <Button variant="outline" size="sm">
                <FileBarChart2 className="h-4 w-4 mr-1" /> Relatório
              </Button>
            </Link>
            <Link href="/shoots/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              <Plus className="mr-2 h-4 w-4" /> Nova Diária
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por local ou cliente..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(SHOOT_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <h3 className="text-lg font-medium">Nenhuma diária encontrada</h3>
            <p>Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shoots?.map((shoot) => (
              <Link key={shoot.id} href={`/shoots/${shoot.id}`} className="block group">
                <Card className="hover:border-primary/50 transition-colors h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <ShootPriorityBadge priority={shoot.priority} className="shrink-0" />
                      <ShootStatusBadge status={shoot.status} className="shrink-0" />
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {shoot.location}
                    </CardTitle>
                    {shoot.clientProject && (
                      <p className="text-sm font-medium text-muted-foreground">
                        {shoot.clientProject}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto space-y-2.5">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span>
                        {format(new Date(shoot.date), "dd 'de' MMMM", { locale: ptBR })}
                        {shoot.time ? ` às ${shoot.time}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{shoot.location}</span>
                    </div>
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
