import { useState, useRef, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useGetShoot, useReturnEquipment, getGetShootQueryKey, getListShootsQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, AlertTriangle, User, ChevronDown, ChevronRight, Camera } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/lib/constants";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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

export default function ReturnShoot() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: shoot, isLoading } = useGetShoot(id, { query: { enabled: !!id } });
  const returnMutation = useReturnEquipment();

  const [returnedBy, setReturnedBy] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (equipId: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(equipId)) next.delete(equipId);
      else next.add(equipId);
      return next;
    });
  };

  const teamOptions: TeamMemberOption[] = (shoot?.team ?? []).map(m => ({
    name: m.teamMember.name,
    role: m.role,
  }));
  
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
        reviewedBy: receivedBy,
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
            {teamOptions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Digite para buscar na equipe escalada para esta pauta.
              </p>
            )}
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <TeamMemberCombobox
              label="Devolvido por (Equipe)"
              value={returnedBy}
              onChange={setReturnedBy}
              options={teamOptions}
              placeholder="Nome de quem trouxe"
            />
            <TeamMemberCombobox
              label="Recebido por (Acervo)"
              value={receivedBy}
              onChange={setReceivedBy}
              options={teamOptions}
              placeholder="Nome do conferente"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conferência de Equipamentos</CardTitle>
            <CardDescription>
              Clique em um item para registrar quantidade, condição e danos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {shoot.equipmentItems.map((item) => {
                const returnData = itemReturns[item.equipmentId] || { quantityReturned: item.quantity.toString(), hasDamage: false, notes: "" };
                const isMissing = parseInt(returnData.quantityReturned || "0") < item.quantity;
                const hasProblem = isMissing || returnData.hasDamage;
                const isExpanded = expandedItems.has(item.equipmentId);
                const CatIcon = EQUIPMENT_CATEGORIES.find(c => c.value === item.equipment?.category)?.icon || Camera;

                return (
                  <div key={item.id}>
                    {/* Collapsed row — always visible */}
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.equipmentId)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                        hasProblem ? 'bg-destructive/5' : ''
                      }`}
                    >
                      {isExpanded
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      }
                      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <CatIcon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="flex-1 font-medium text-sm">{item.equipment.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {returnData.quantityReturned || item.quantity}/{item.quantity}
                      </span>
                      {hasProblem && (
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      {returnData.hasDamage && (
                        <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded shrink-0">
                          DANO
                        </span>
                      )}
                      {isMissing && !returnData.hasDamage && (
                        <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded shrink-0">
                          FALTA {item.quantity - parseInt(returnData.quantityReturned || "0")}
                        </span>
                      )}
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className={`px-4 pb-4 pt-2 border-t bg-muted/20 ${hasProblem ? 'bg-destructive/5' : ''}`}>
                        <div className="grid sm:grid-cols-12 gap-4">
                          <div className="sm:col-span-3 space-y-1.5">
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
                                <AlertTriangle className="h-3 w-3" /> Falta {item.quantity - parseInt(returnData.quantityReturned || "0")}
                              </p>
                            )}
                          </div>
                          <div className="sm:col-span-5 space-y-1.5">
                            <Label className="text-xs">Condição / Observações</Label>
                            <Input
                              placeholder="Detalhes sobre o estado..."
                              value={returnData.notes || ""}
                              onChange={e => handleItemChange(item.equipmentId, 'notes', e.target.value)}
                            />
                          </div>
                          <div className="sm:col-span-4 space-y-1.5">
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
                    )}
                  </div>
                );
              })}
            </div>
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
