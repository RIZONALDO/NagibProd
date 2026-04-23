import { Shell } from "@/components/layout/Shell";
import { TeamMemberForm, TeamMemberFormValues } from "./form";
import { useCreateTeamMember, getListTeamMembersQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewTeamMember() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateTeamMember();

  const handleSubmit = (data: TeamMemberFormValues) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Membro criado com sucesso" });
        queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
        setLocation("/team");
      },
      onError: (err) => {
        toast({ title: "Erro ao criar membro", description: String(err), variant: "destructive" });
      }
    });
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/team" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Pessoa</h1>
            <p className="text-muted-foreground">Adicione um novo membro à equipe.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMemberForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
