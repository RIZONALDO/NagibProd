import { useState, useRef, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useGetShoot, useCheckoutEquipment, getGetShootQueryKey, getListShootsQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, User, Camera } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/lib/constants";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamMemberOption {
  name: string;
  role: string;
}

function TeamMemberCombobox({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: TeamMemberOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(o =>
    o.name.toLowerCase().includes(value.toLowerCase())
  );
  const showDropdown = open && value.length > 0 && filtered.length > 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-lg shadow-lg overflow-hidden">
          {filtered.map((o, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
              onMouseDown={e => { e.preventDefault(); onChange(o.name); setOpen(false); }}
            >
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium">{o.name}</span>
              <span className="text-muted-foreground text-xs ml-auto">{o.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CheckoutShoot() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: shoot, isLoading } = useGetShoot(id, { query: { enabled: !!id } });
  const checkoutMutation = useCheckoutEquipment();

  const [deliveredBy, setDeliveredBy] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  
  const [itemConditions, setItemConditions] = useState<Record<number, { conditionOut: string, notes: string }>>({});

  const teamOptions: TeamMemberOption[] = (shoot?.team ?? []).map(m => ({
    name: m.teamMember.name,
    role: m.role,
  }));

  const handleConditionChange = (equipId: number, field: 'conditionOut' | 'notes', value: string) => {
    setItemConditions(prev => ({
      ...prev,
      [equipId]: {
        ...prev[equipId],
        [field]: value
      }
    }));
  };

  const handleCheckout = () => {
    if (!deliveredBy || !receivedBy) {
      toast({ title: "Preencha quem entregou e quem recebeu", variant: "destructive" });
      return;
    }

    if (!shoot?.equipmentItems) return;

    const items = shoot.equipmentItems.map(item => ({
      equipmentId: item.equipmentId,
      quantity: item.quantity,
      conditionOut: itemConditions[item.equipmentId]?.conditionOut || "",
      notes: itemConditions[item.equipmentId]?.notes || ""
    }));

    checkoutMutation.mutate({
      id,
      data: {
        deliveredBy,
        reviewedBy: deliveredBy,
        receivedBy,
        items
      }
    }, {
      onSuccess: () => {
        toast({ title: "Saída registrada!" });
        queryClient.invalidateQueries({ queryKey: getGetShootQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() });
        setLocation(`/shoots/${id}`);
      },
      onError: (err) => {
        toast({ title: "Erro ao registrar checkout", description: String(err), variant: "destructive" });
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
            <h1 className="text-2xl font-bold">Saída de Equipamentos</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Checkout: Saída</h1>
            <p className="text-muted-foreground">{shoot.location}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
            {teamOptions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Digite para buscar na equipe escalada para esta pauta.
              </p>
            )}
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <TeamMemberCombobox
              label="Entregue por (Acervo)"
              value={deliveredBy}
              onChange={setDeliveredBy}
              options={teamOptions}
              placeholder="Nome do conferente"
            />
            <TeamMemberCombobox
              label="Recebido por (Equipe)"
              value={receivedBy}
              onChange={setReceivedBy}
              options={teamOptions}
              placeholder="Nome de quem retirou"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist de Equipamentos</CardTitle>
            <CardDescription>Verifique o estado de cada item antes da saída.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {shoot.equipmentItems.map((item) => {
              const CatIcon = EQUIPMENT_CATEGORIES.find(c => c.value === item.equipment?.category)?.icon || Camera;
              return (
              <div key={item.id} className="border rounded-lg p-4 bg-muted/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CatIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">{item.equipment.name}</p>
                      <p className="text-sm text-muted-foreground">Código: {item.equipment.internalCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded font-medium text-sm shrink-0">
                    Qtd: {item.quantity}
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Condição de Saída</Label>
                    <Input 
                      placeholder="Ex: OK, com marca de uso..."
                      value={itemConditions[item.equipmentId]?.conditionOut || ""}
                      onChange={e => handleConditionChange(item.equipmentId, 'conditionOut', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Observações</Label>
                    <Input 
                      placeholder="Acessórios inclusos..."
                      value={itemConditions[item.equipmentId]?.notes || ""}
                      onChange={e => handleConditionChange(item.equipmentId, 'notes', e.target.value)}
                    />
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
          <Button onClick={handleCheckout} disabled={checkoutMutation.isPending}>
            {checkoutMutation.isPending ? "Registrando..." : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Saída
              </>
            )}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
