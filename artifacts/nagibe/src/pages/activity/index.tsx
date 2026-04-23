import { Shell } from "@/components/layout/Shell";
import { useListActivity } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivitySquare, Video, Camera, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLog() {
  const { data: logs, isLoading } = useListActivity({ limit: 100 });

  const getIcon = (type: string) => {
    if (type.startsWith('shoot')) return <Video className="h-4 w-4" />;
    if (type.startsWith('equipment')) return <Camera className="h-4 w-4" />;
    if (type.startsWith('team')) return <Users className="h-4 w-4" />;
    return <ActivitySquare className="h-4 w-4" />;
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
          <p className="text-muted-foreground">Registro de atividades e alterações no sistema.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : logs?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ActivitySquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma atividade registrada.</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[1.1rem] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
                {logs?.map((log) => (
                  <div key={log.id} className="relative flex items-start gap-4">
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-background border flex items-center justify-center ml-1 md:ml-[0.1rem] -translate-x-1/2 ring-4 ring-background">
                      {getIcon(log.type)}
                    </div>
                    <div className="flex-1 ml-10 border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <p className="font-medium text-sm leading-none mb-1">{log.description}</p>
                          <p className="text-xs text-muted-foreground font-mono">{log.type}</p>
                        </div>
                        <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
