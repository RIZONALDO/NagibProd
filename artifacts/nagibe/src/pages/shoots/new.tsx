import { Shell } from "@/components/layout/Shell";
import { ShootForm, ShootFormValues } from "./form";
import { useCreateShoot, getListShootsQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewShoot() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateShoot();

  const handleSubmit = (data: ShootFormValues) => {
    createMutation.mutate({ data }, {
      onSuccess: (newShoot) => {
        toast({ title: "Diária criada com sucesso" });
        queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() });
        setLocation(`/shoots/${newShoot.id}`);
      },
      onError: (err) => {
        toast({ title: "Erro ao criar", description: String(err), variant: "destructive" });
      }
    });
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/shoots" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Diária</h1>
            <p className="text-muted-foreground">Programe uma nova gravação.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Gravação</CardTitle>
          </CardHeader>
          <CardContent>
            <ShootForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
