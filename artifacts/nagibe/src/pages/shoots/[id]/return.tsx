import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useGetShoot, useReturnEquipment, getGetShootQueryKey, getListShootsQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ReturnShoot() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: shoot, isLoading } = useGetShoot(id, { query: { enabled: !!id } });
  const returnMutation = useReturnEquipment();

  const [returnedBy, setReturnedBy] = useState("");
  const [reviewedBy, setReviewedBy] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  
  const [itemReturns, setItemReturns] = useState<Record<number, { 
    quantityReturned: string, 
    conditionReturn: string, 
    notes: string,
    hasDamage: boolean
  }>>({});

  // Initialize form state once data is loaded
  if (shoot && shoot.equipmentItems && Object.keys(itemReturns).length === 0) {
    const initData: Record<number, any> = {};
    shoot.equipmentItems.forEach(item => {
      initData[item.equipmentId] = {
        quantityReturned: item.quantity.toString(),
        conditionReturn: "",
        notes: "",
        hasDamage: false
      };
    });
    setItemReturns(initData);
  }

  const handleItemChange = (equipId: number, field: string, value: any) => {
    setItemReturns(prev => ({
      ...prev,
      [equipId]: {
        ...prev[equipId],
        [field]: value
      }
    }));
  };

  const handleReturn = () => {
    if (!returnedBy || !receivedBy) {
      toast({ title: "Preencha quem devolveu e quem recebeu", variant: "destructive" });
      return;
    }

    if (!shoot?.equipmentItems) return;

    const items = shoot.equipmentItems.map(item => {
      const returnData = itemReturns[item.equipmentId] || {};
      return {
        equipmentId: item.equipmentId,
        quantitySent: item.quantity,
        quantityReturned: parseInt(returnData.quantityReturned) || 0,
        conditionReturn: returnData.conditionReturn || "",
        notes: returnData.notes || "",
        hasDamage: returnData.hasDamage || false
      };
    });

    returnMutation.mutate({
      id,
      data: {
        returnedBy,
        reviewedBy: reviewedBy || receivedBy,
        receivedBy,
        items
      }
    }, {
      onSuccess: () => {
        toast({ title: "Devolução registrada!" });
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() });
        setLocation(`/shoots/${id}`);
      },
      onError: (err) => {
        toast({ title: "Erro ao registrar devolução", description: String(err), variant: "destructive" });
      }
    });
  };

  if (isLoading || !shoot) {
    return (
      <Shell>
        <div className="space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Shell>
    );
  }

  if (!shoot.equipmentItems || shoot.equipmentItems.length === 0) {
    return (
      <Shell>
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href={`/shoots/${id}`} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Devolução de Equipamentos</h1>
          </div>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Nenhum equipamento listado para esta diária.</p>
              <Link href={`/shoots/${id}`}>
                <Button className="mt-4" variant="outline">Voltar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-3xl mx-auto pb-12">
        <div className="flex items-center gap-4">
          <Link href={`/shoots/${id}`} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Devolução</h1>
            <p className="text-muted-foreground">{shoot.location}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Devolvido por (Equipe)</Label>
              <Input value={returnedBy} onChange={e => setReturnedBy(e.target.value)} placeholder="Nome de quem trouxe" />
            </div>
            <div className="space-y-2">
              <Label>Revisado por</Label>
              <Input value={reviewedBy} onChange={e => setReviewedBy(e.target.value)} placeholder="Opcional" />
            </div>
            <div className="space-y-2">
              <Label>Recebido por (Acervo)</Label>
              <Input value={receivedBy} onChange={e => setReceivedBy(e.target.value)} placeholder="Nome do conferente" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conferência de Equipamentos</CardTitle>
            <CardDescription>Verifique as quantidades e o estado físico no retorno.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {shoot.equipmentItems.map((item) => {
              const returnData = itemReturns[item.equipmentId] || { quantityReturned: item.quantity.toString(), hasDamage: false };
              const isMissing = parseInt(returnData.quantityReturned) < item.quantity;
              
              return (
                <div key={item.id} className={`border rounded-lg p-4 transition-colors ${
                  isMissing || returnData.hasDamage ? 'border-destructive/50 bg-destructive/5' : 'bg-muted/20'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg">{item.equipment.name}</p>
                      <p className="text-sm text-muted-foreground">Código: {item.equipment.internalCode || 'N/A'}</p>
                    </div>
                    <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded font-medium text-sm border">
                      Enviado: {item.quantity}
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-3 space-y-2">
                      <Label className="text-xs font-semibold">Qtd. Devolvida</Label>
                      <Input 
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={returnData.quantityReturned}
                        onChange={e => handleItemChange(item.equipmentId, 'quantityReturned', e.target.value)}
                        className={isMissing ? "border-destructive text-destructive" : ""}
                      />
                      {isMissing && (
                        <p className="text-[10px] text-destructive font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Falta {item.quantity - parseInt(returnData.quantityReturned)}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-5 space-y-2">
                      <Label className="text-xs">Condição / Observações</Label>
                      <Input 
                        placeholder="Detalhes sobre o estado..."
                        value={returnData.notes || ""}
                        onChange={e => handleItemChange(item.equipmentId, 'notes', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-4 space-y-2">
                      <Label className="text-xs">Apresenta Danos?</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch 
                          checked={returnData.hasDamage}
                          onCheckedChange={checked => handleItemChange(item.equipmentId, 'hasDamage', checked)}
                        />
                        <span className="text-sm">{returnData.hasDamage ? "Sim (Danificado)" : "Não"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/shoots/${id}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button onClick={handleReturn} disabled={returnMutation.isPending}>
            {returnMutation.isPending ? "Registrando..." : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Devolução
              </>
            )}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
