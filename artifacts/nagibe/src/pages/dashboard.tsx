import { Shell } from "@/components/layout/Shell";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Camera, Wrench, AlertCircle, Users, ActivitySquare, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShootStatusBadge, ShootPriorityBadge } from "@/components/ui/status-badge";

export default function Dashboard() {
  const { data: summary, isLoading, error } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !summary) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center text-destructive">
            <AlertCircle className="h-10 w-10 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
            <p className="text-muted-foreground">Tente novamente mais tarde.</p>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral da operação em {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Link href="/shoots/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Nova Pauta
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pautas Hoje</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.todayShoots}</div>
              <p className="text-xs text-muted-foreground">
                {summary.openShoots} pautas em andamento total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equip. em Uso</CardTitle>
              <Camera className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.equipmentInUse}</div>
              <p className="text-xs text-muted-foreground">
                Fora do acervo neste momento
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equip. em Manutenção</CardTitle>
              <Wrench className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.equipmentInMaintenance}</div>
              <p className="text-xs text-muted-foreground">
                Indisponíveis para uso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipe Ativa</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeTeamMembers}</div>
              <p className="text-xs text-muted-foreground">
                Membros disponíveis para escalação
              </p>
            </CardContent>
          </Card>
        </div>

        {summary.equipmentPendingReturn > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 p-4 rounded-lg flex items-start sm:items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 text-sm">
              <span className="font-semibold">Atenção:</span> Existem {summary.equipmentPendingReturn} equipamentos aguardando devolução no acervo.
            </div>
            <Link href="/equipment?status=pending_return" className="text-sm font-medium underline underline-offset-4 shrink-0">
              Ver equipamentos
            </Link>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pautas de Hoje</CardTitle>
              <Link href="/shoots" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {summary.todayShootsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma pauta programada para hoje.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.todayShootsList.map((shoot) => (
                    <Link key={shoot.id} href={`/shoots/${shoot.id}`} className="block group">
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium group-hover:underline">{shoot.location}</span>
                            <ShootPriorityBadge priority={shoot.priority} className="text-[10px] px-1.5 py-0 h-4" />
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{shoot.time || "Horário não definido"}</span>
                            {shoot.clientProject && (
                              <>
                                <span>•</span>
                                <span>{shoot.clientProject}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ShootStatusBadge status={shoot.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Atividades Recentes</CardTitle>
              <Link href="/activity" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {summary.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ActivitySquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma atividade recente.</p>
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[1.1rem] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
                  {summary.recentActivity.map((log) => (
                    <div key={log.id} className="relative flex items-center gap-4">
                      <div className="absolute left-0 w-2.5 h-2.5 rounded-full bg-primary ml-[1.1rem] -translate-x-1/2 ring-4 ring-background" />
                      <div className="flex-1 ml-10">
                        <p className="text-sm">{log.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "HH:mm - dd/MM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
