import { useState } from "react";
import { useListEquipment } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus, Camera } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { EquipmentStatusBadge } from "@/components/ui/status-badge";
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUS_LABELS } from "@/lib/constants";

export default function EquipmentList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data: equipment, isLoading } = useListEquipment({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    status: status !== "all" ? status : undefined,
  });

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
            <p className="text-muted-foreground">Gerencie o acervo de equipamentos da produtora.</p>
          </div>
          <Link href="/equipment/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" /> Novo Equipamento
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {EQUIPMENT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(EQUIPMENT_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : equipment?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">Nenhum equipamento encontrado</h3>
            <p>Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {equipment?.map((item) => {
              const CatIcon = EQUIPMENT_CATEGORIES.find(c => c.value === item.category)?.icon || Camera;
              
              return (
                <Link key={item.id} href={`/equipment/${item.id}`} className="block group">
                  <Card className="hover:border-primary/50 transition-colors h-full">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors leading-tight">
                          {item.name}
                        </CardTitle>
                        {item.internalCode && (
                          <div className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-sm inline-block">
                            {item.internalCode}
                          </div>
                        )}
                      </div>
                      <div className="bg-muted p-1.5 rounded-md shrink-0">
                        <CatIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-semibold">{item.availableQuantity}</span>
                          <span className="text-muted-foreground"> / {item.totalQuantity} disp.</span>
                        </div>
                        <EquipmentStatusBadge status={item.status} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
