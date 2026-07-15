import { useState } from "react";
import { useListEquipment } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus, Camera, Printer } from "lucide-react";
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

  const handlePrint = () => {
    const list = equipment ?? [];
    if (list.length === 0) return;

    const esc = (v: unknown) =>
      String(v ?? "").replace(/[&<>"]/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c)
      );

    const catLabel = (v: string) =>
      EQUIPMENT_CATEGORIES.find((c) => c.value === v)?.label ?? v;
    const statusLabel = (v: string) => EQUIPMENT_STATUS_LABELS[v] ?? v;

    const now = new Date().toLocaleString("pt-BR");
    const filters: string[] = [];
    if (search) filters.push(`Busca: "${esc(search)}"`);
    if (category !== "all") filters.push(`Categoria: ${esc(catLabel(category))}`);
    if (status !== "all") filters.push(`Status: ${esc(statusLabel(status))}`);

    const rows = list
      .map(
        (item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td class="code">${esc(item.internalCode || "—")}</td>
            <td>${esc(item.name)}</td>
            <td>${esc(catLabel(item.category))}</td>
            <td class="num">${esc(item.availableQuantity)} / ${esc(item.totalQuantity)}</td>
            <td>${esc(statusLabel(item.status))}</td>
            <td>${esc(item.storageLocation || "—")}</td>
          </tr>`
      )
      .join("");

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relação de Equipamentos</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 32px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .meta { font-size: 12px; color: #555; margin-bottom: 16px; }
    .meta div { margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead th { background: #f2f2f2; text-align: left; border-bottom: 2px solid #999; padding: 6px 8px; }
    tbody td { border-bottom: 1px solid #ddd; padding: 6px 8px; vertical-align: top; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .num { text-align: center; white-space: nowrap; }
    .code { font-family: "Courier New", monospace; white-space: nowrap; }
    .total { margin-top: 16px; font-size: 12px; font-weight: bold; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <h1>Relação de Equipamentos</h1>
  <div class="meta">
    <div>Gerado em ${esc(now)}</div>
    ${filters.length ? `<div>Filtros — ${filters.join(" · ")}</div>` : ""}
  </div>
  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        <th>Código</th>
        <th>Nome</th>
        <th>Categoria</th>
        <th class="num">Disp. / Total</th>
        <th>Status</th>
        <th>Local</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total">Total de itens: ${list.length}</div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
            <p className="text-muted-foreground">Gerencie o acervo de equipamentos da produtora.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isLoading || (equipment?.length ?? 0) === 0}
              title="Imprimir relação de equipamentos"
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Link href="/equipment/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              <Plus className="mr-2 h-4 w-4" /> Novo Equipamento
            </Link>
          </div>
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
