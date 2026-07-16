import { useSearch } from "wouter";
import { Link } from "wouter";
import { useListEquipment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUS_LABELS } from "@/lib/constants";

export default function EquipmentPrint() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const search = params.get("search") || undefined;
  const category = params.get("category") || undefined;
  const status = params.get("status") || undefined;

  const { data: equipment, isLoading } = useListEquipment({
    search,
    category,
    status,
  });

  const list = equipment ?? [];

  const catLabel = (v: string) =>
    EQUIPMENT_CATEGORIES.find((c) => c.value === v)?.label ?? v;
  const statusLabel = (v: string) => EQUIPMENT_STATUS_LABELS[v] ?? v;

  const now = new Date().toLocaleString("pt-BR");
  const filters: string[] = [];
  if (search) filters.push(`Busca: "${search}"`);
  if (category) filters.push(`Categoria: ${catLabel(category)}`);
  if (status) filters.push(`Status: ${statusLabel(status)}`);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Toolbar — visível só na tela, escondida na impressão */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white px-6 py-3">
        <Link
          href="/equipment"
          className="inline-flex items-center text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
        <Button onClick={() => window.print()} disabled={isLoading || list.length === 0}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir / Salvar PDF
        </Button>
      </div>

      {/* Documento */}
      <div className="mx-auto max-w-4xl px-8 py-8 print:px-0 print:py-0">
        <h1 className="text-2xl font-bold">Relação de Equipamentos</h1>
        <div className="mt-1 text-sm text-gray-600">
          <div>Gerado em {now}</div>
          {filters.length > 0 && <div>Filtros — {filters.join(" · ")}</div>}
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-gray-500">Carregando...</p>
        ) : list.length === 0 ? (
          <p className="mt-8 text-sm text-gray-500">Nenhum equipamento encontrado.</p>
        ) : (
          <>
            <table className="mt-6 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-400 text-left">
                  <th className="py-2 pr-2 text-center">#</th>
                  <th className="py-2 pr-2">Código</th>
                  <th className="py-2 pr-2">Nome</th>
                  <th className="py-2 pr-2">Categoria</th>
                  <th className="py-2 pr-2 text-center">Disp. / Total</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Local</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-1.5 pr-2 text-center">{i + 1}</td>
                    <td className="py-1.5 pr-2 font-mono whitespace-nowrap">
                      {item.internalCode || "—"}
                    </td>
                    <td className="py-1.5 pr-2">{item.name}</td>
                    <td className="py-1.5 pr-2">{catLabel(item.category)}</td>
                    <td className="py-1.5 pr-2 text-center whitespace-nowrap">
                      {item.availableQuantity} / {item.totalQuantity}
                    </td>
                    <td className="py-1.5 pr-2">{statusLabel(item.status)}</td>
                    <td className="py-1.5 pr-2">{item.storageLocation || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-sm font-semibold">
              Total de itens: {list.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
