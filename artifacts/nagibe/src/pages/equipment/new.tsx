import { Shell } from "@/components/layout/Shell";
import { EquipmentForm, EquipmentFormValues } from "./form";
import { useCreateEquipment, getListEquipmentQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewEquipment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateEquipment();

  const handleSubmit = (data: EquipmentFormValues) => {
    createMutation.mutate({ data: { ...data, active: true } }, {
      onSuccess: (created) => {
        toast({ title: "Equipamento criado!", description: "Adicione itens vinculados se necessário." });
        queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey() });
        setLocation(`/equipment/${created.id}`);
      },
      onError: (err) => {
        toast({ title: "Erro ao criar", description: String(err), variant: "destructive" });
      }
    });
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/equipment" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Novo Equipamento</h1>
            <p className="text-muted-foreground">Cadastre um item no acervo.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Equipamento</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
