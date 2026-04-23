import { useState, Fragment } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileBarChart2, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const BASE = () => import.meta.env.BASE_URL.replace(/\/$/, "");

interface ShootDetail {
  id: number;
  date: string;
  location: string;
  travelDiarias: number;
}

interface MemberReport {
  teamMemberId: number;
  memberName: string;
  primaryRole: string;
  shoots: number;
  totalTravelDiarias: number;
  shootDetails: ShootDetail[];
}

function today() {
  return format(new Date(), "yyyy-MM-dd");
}
function firstOfMonth() {
  return format(startOfMonth(new Date()), "yyyy-MM-dd");
}

export default function DiariasReport() {
  const now = new Date();
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState<MemberReport[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  async function fetchReport() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`${BASE()}/api/reports/diarias?${params}`, { credentials: "include" });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totals = data
    ? { shoots: data.reduce((a, r) => a + r.shoots, 0), diarias: data.reduce((a, r) => a + r.totalTravelDiarias, 0) }
    : null;

  return (
    <Shell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/shoots">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileBarChart2 className="h-6 w-6 text-primary" />
              Relatório de Diárias
            </h1>
            <p className="text-muted-foreground text-sm">Diárias trabalhadas e de deslocamento por período</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs">De</Label>
                <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Até</Label>
                <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-40" />
              </div>
              <Button onClick={fetchReport} disabled={loading} className="shrink-0">
                {loading ? "Gerando..." : "Gerar relatório"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {data && (
          <>
            {data.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileBarChart2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhum dado encontrado para o período selecionado.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {format(new Date(from + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                      {" — "}
                      {format(new Date(to + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                    </CardTitle>
                    {totals && (
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span><strong className="text-foreground">{totals.shoots}</strong> presença(s)</span>
                        <span><strong className="text-foreground">{totals.diarias}</strong> diária(s) de deslocamento</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Membro</th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground w-28">Gravações</th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground w-32">Diárias deslocamento</th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground w-24">Total</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row) => {
                        const isOpen = expanded.has(row.teamMemberId);
                        const total = row.shoots + row.totalTravelDiarias;
                        return (
                          <Fragment key={row.teamMemberId}>
                            <tr
                              className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                              onClick={() => toggleExpand(row.teamMemberId)}
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium">{row.memberName}</p>
                                {row.primaryRole && (
                                  <p className="text-xs text-muted-foreground">{row.primaryRole}</p>
                                )}
                              </td>
                              <td className="text-center px-3 py-3">
                                <Badge variant="outline" className="text-xs">{row.shoots}</Badge>
                              </td>
                              <td className="text-center px-3 py-3">
                                <Badge variant="outline" className={cn("text-xs", row.totalTravelDiarias > 0 && "border-primary/40 text-primary bg-primary/5")}>
                                  {row.totalTravelDiarias}
                                </Badge>
                              </td>
                              <td className="text-center px-3 py-3">
                                <span className="font-semibold text-foreground">{total}</span>
                              </td>
                              <td className="pr-3 text-muted-foreground">
                                {isOpen ? <ChevronDown className="h-4 w-4 mx-auto" /> : <ChevronRight className="h-4 w-4 mx-auto" />}
                              </td>
                            </tr>
                            {isOpen && row.shootDetails.map(sd => (
                              <tr key={sd.id} className="bg-muted/20 border-b text-xs text-muted-foreground">
                                <td className="px-8 py-2 pl-10" colSpan={2}>
                                  <span className="font-medium text-foreground">
                                    {format(new Date(sd.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                                  </span>
                                  {" — "}{sd.location}
                                </td>
                                <td className="text-center px-3 py-2">
                                  {sd.travelDiarias > 0 ? (
                                    <Badge variant="outline" className="text-xs border-primary/40 text-primary bg-primary/5">{sd.travelDiarias}</Badge>
                                  ) : (
                                    <span className="text-muted-foreground/50">—</span>
                                  )}
                                </td>
                                <td className="text-center px-3 py-2">{1 + sd.travelDiarias}</td>
                                <td />
                              </tr>
                            ))}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
