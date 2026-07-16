import { useSearch, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useListEquipment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { settingsApi } from "@/lib/auth-api";
import { Printer, ArrowLeft, Camera } from "lucide-react";
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUS_LABELS } from "@/lib/constants";

export default function EquipmentPrint() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const search = params.get("search") || undefined;
  const category = params.get("category") || undefined;
  const status = params.get("status") || undefined;

  const { data: equipment, isLoading } = useListEquipment({ search, category, status });
  const { data: appSettings } = useQuery({
    queryKey: ["app-settings"],
    queryFn: settingsApi.getApp,
    staleTime: 5 * 60 * 1000,
  });

  const companyName = appSettings?.company_name || "Nagibe Produção";
  const logoUrl = appSettings?.logo_url || appSettings?.logo_small_url || null;

  const list = equipment ?? [];

  const catLabel = (v: string) =>
    EQUIPMENT_CATEGORIES.find((c) => c.value === v)?.label ?? v;
  const statusLabel = (v: string) => EQUIPMENT_STATUS_LABELS[v] ?? v;

  // Agrupa por categoria (mantém a ordem por nome que a API já retorna dentro de cada grupo)
  const knownValues = EQUIPMENT_CATEGORIES.map((c) => c.value);
  const groups = [
    ...EQUIPMENT_CATEGORIES.map((c) => ({
      value: c.value,
      label: c.label,
      items: list.filter((i) => i.category === c.value),
    })),
    {
      value: "__outros__",
      label: "Outros",
      items: list.filter((i) => !knownValues.includes(i.category)),
    },
  ].filter((g) => g.items.length > 0);

  const now = new Date().toLocaleString("pt-BR");
  const filters: string[] = [];
  if (search) filters.push(`Busca: "${search}"`);
  if (category) filters.push(`Categoria: ${catLabel(category)}`);
  if (status) filters.push(`Status: ${statusLabel(status)}`);

  const totalAvailable = list.reduce((sum, i) => sum + i.availableQuantity, 0);
  const totalUnits = list.reduce((sum, i) => sum + i.totalQuantity, 0);

  return (
    <div className="min-h-screen bg-muted/40 print:bg-white">
      {/* Toolbar — só na tela */}
      <div className="print:hidden sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/equipment">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {list.length} {list.length === 1 ? "item" : "itens"}
            </span>
            <Button onClick={() => window.print()} disabled={isLoading || list.length === 0}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir / Salvar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Folha do relatório */}
      <div className="mx-auto max-w-4xl px-4 py-8 print:p-0">
        <div className="rounded-xl border bg-white p-10 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-6 border-b border-gray-200 pb-5">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-11 w-11 object-contain" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-900 text-white">
                  <Camera className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{companyName}</p>
                <p className="text-xs text-gray-500">Controle de acervo</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Relação de Equipamentos
              </h1>
              <p className="mt-0.5 text-xs text-gray-500">Gerado em {now}</p>
            </div>
          </div>

          {/* Resumo */}
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Itens cadastrados: </span>
              <span className="font-semibold text-gray-900">{list.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Unidades disponíveis: </span>
              <span className="font-semibold text-gray-900">
                {totalAvailable} / {totalUnits}
              </span>
            </div>
            {filters.length > 0 && (
              <div className="text-gray-500">Filtros — {filters.join(" · ")}</div>
            )}
          </div>

          {/* Conteúdo */}
          {isLoading ? (
            <p className="mt-10 text-sm text-gray-500">Carregando...</p>
          ) : list.length === 0 ? (
            <p className="mt-10 text-sm text-gray-500">Nenhum equipamento encontrado.</p>
          ) : (
            <div className="mt-6 space-y-7">
              {groups.map((group) => (
                <section key={group.value} className="break-inside-avoid">
                  <div className="mb-1 flex items-baseline justify-between border-b-2 border-gray-800 pb-1">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide text-gray-800">
                      {group.label}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {group.items.length} {group.items.length === 1 ? "item" : "itens"}
                    </span>
                  </div>
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                        <th className="w-24 py-1.5 pr-3 font-medium">Código</th>
                        <th className="py-1.5 pr-3 font-medium">Nome</th>
                        <th className="w-24 py-1.5 pr-3 text-center font-medium">Disp./Total</th>
                        <th className="w-32 py-1.5 pr-3 font-medium">Status</th>
                        <th className="w-40 py-1.5 font-medium">Local</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-1.5 pr-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                            {item.internalCode || "—"}
                          </td>
                          <td className="py-1.5 pr-3 text-gray-900">{item.name}</td>
                          <td className="py-1.5 pr-3 text-center tabular-nums whitespace-nowrap">
                            <span
                              className={
                                item.availableQuantity === 0
                                  ? "font-semibold text-gray-900"
                                  : "text-gray-700"
                              }
                            >
                              {item.availableQuantity}
                            </span>
                            <span className="text-gray-400"> / {item.totalQuantity}</span>
                          </td>
                          <td className="py-1.5 pr-3 text-gray-700">{statusLabel(item.status)}</td>
                          <td className="py-1.5 text-gray-700">{item.storageLocation || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}

              {/* Rodapé */}
              <div className="flex items-center justify-between border-t-2 border-gray-800 pt-2 text-xs text-gray-500">
                <span>{companyName} · Relação de Equipamentos</span>
                <span className="font-semibold text-gray-700">
                  Total: {list.length} {list.length === 1 ? "item" : "itens"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
