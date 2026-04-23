import { Shell } from "@/components/layout/Shell";
import { TeamMemberForm, TeamMemberFormValues } from "./form";
import { useGetTeamMember, useUpdateTeamMember, useDeleteTeamMember, getGetTeamMemberQueryKey, getListTeamMembersQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function EditTeamMember() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: member, isLoading } = useGetTeamMember(id, { query: { enabled: !!id } });
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();

  const handleSubmit = (data: TeamMemberFormValues) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast({ title: "Membro atualizado com sucesso" });
        queryClient.invalidateQueries({ queryKey: getGetTeamMemberQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
        setLocation("/team");
      },
      onError: (err) => {
        toast({ title: "Erro ao atualizar", description: String(err), variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Membro removido com sucesso" });
        queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
        setLocation("/team");
      },
      onError: (err) => {
        toast({ title: "Erro ao remover", description: String(err), variant: "destructive" });
      }
    });
  };

  if (isLoading || !member) {
    return (
      <Shell>
        <div className="space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/team" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Pessoa</h1>
              <p className="text-muted-foreground">Atualize os dados de {member.name}.</p>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso removerá permanentemente o membro da equipe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMemberForm 
              defaultValues={{
                ...member,
                secondaryRole: member.secondaryRole === null ? "none" : member.secondaryRole,
              }} 
              onSubmit={handleSubmit} 
              isSubmitting={updateMutation.isPending} 
            />
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
