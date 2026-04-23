import { useState, useEffect } from "react";
import { Car, Check, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { differenceInCalendarDays, parseISO } from "date-fns";

const BASE = () => import.meta.env.BASE_URL.replace(/\/$/, "");

interface TeamMemberEntry {
  id: number;
  teamMemberId: number;
  role: string;
  travelDiarias: number;
  teamMember: { name: string } | null;
}

interface TravelSectionProps {
  shootId: number;
  hasTravel: boolean;
  shootDate: string;
  shootEndDate: string | null;
  team: TeamMemberEntry[];
  onRefresh: () => void;
}

function calcSuggestedDiarias(date: string, endDate: string | null): number {
  if (!endDate) return 1;
  try {
    const diff = differenceInCalendarDays(parseISO(endDate), parseISO(date));
    return Math.max(1, diff + 1);
  } catch {
    return 1;
  }
}

async function patchShoot(id: number, body: object) {
  await fetch(`${BASE()}/api/shoots/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function applyTravelToAll(shootId: number, count: number) {
  await fetch(`${BASE()}/api/shoots/${shootId}/team/apply-travel`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });
}

async function patchTeamMember(shootId: number, memberId: number, travelDiarias: number) {
  await fetch(`${BASE()}/api/shoots/${shootId}/team/${memberId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ travelDiarias }),
  });
}

function MemberDiariasInput({
  entry,
  shootId,
  busy,
  onSaved,
}: {
  entry: TeamMemberEntry;
  shootId: number;
  busy: boolean;
  onSaved: () => void;
}) {
  const [localValue, setLocalValue] = useState(String(entry.travelDiarias));

  useEffect(() => {
    setLocalValue(String(entry.travelDiarias));
  }, [entry.travelDiarias]);

  async function save() {
    const parsed = parseInt(localValue, 10);
    if (isNaN(parsed) || parsed < 0) {
      setLocalValue(String(entry.travelDiarias));
      return;
    }
    if (parsed === entry.travelDiarias) return;
    await patchTeamMember(shootId, entry.id, parsed);
    onSaved();
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <input
        type="number"
        min={0}
        max={99}
        disabled={busy}
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        className="w-16 h-7 rounded-md border border-border bg-background px-2 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      />
      <span className="text-xs text-muted-foreground">diária(s)</span>
    </div>
  );
}

export function TravelSection({ shootId, hasTravel, shootDate, shootEndDate, team, onRefresh }: TravelSectionProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const suggested = calcSuggestedDiarias(shootDate, shootEndDate);

  async function setHasTravel(value: boolean) {
    setBusy(true);
    try {
      await patchShoot(shootId, { hasTravel: value });
      if (!value) {
        await applyTravelToAll(shootId, 0);
      } else if (team.length > 0) {
        await applyTravelToAll(shootId, suggested);
        toast({ title: `${suggested} diária(s) aplicadas automaticamente com base na duração da pauta` });
      }
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleApplyAll(count: number) {
    setBusy(true);
    try {
      await applyTravelToAll(shootId, count);
      onRefresh();
      toast({ title: `${count} diária(s) aplicada(s) a toda a equipe` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Question 1: Travel? */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span>Houve viagem?</span>
        </div>
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => setHasTravel(true)}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              hasTravel
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <Check className="h-3 w-3" /> Sim
          </button>
          <button
            disabled={busy}
            onClick={() => setHasTravel(false)}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              !hasTravel
                ? "bg-muted text-foreground border-border"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <X className="h-3 w-3" /> Não
          </button>
        </div>
      </div>

      {hasTravel && team.length > 0 && (
        <>
          {/* Sugestão + aplicar em lote */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground">Aplicar a toda equipe:</span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-primary font-semibold">{suggested} diária(s)</span>
                <span className="text-muted-foreground">calculado pela duração</span>
              </div>
            </div>
            <button
              disabled={busy}
              onClick={() => handleApplyAll(suggested)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Aplicar {suggested}d. a todos
            </button>
          </div>

          {/* Per-member editable input */}
          <div className="space-y-2 pt-1">
            {team.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3">
                <span className="text-sm truncate flex-1">{entry.teamMember?.name ?? "—"}</span>
                <MemberDiariasInput
                  entry={entry}
                  shootId={shootId}
                  busy={busy}
                  onSaved={onRefresh}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {hasTravel && team.length === 0 && (
        <p className="text-xs text-muted-foreground pt-1">Adicione membros à equipe para configurar as diárias.</p>
      )}
    </div>
  );
}
