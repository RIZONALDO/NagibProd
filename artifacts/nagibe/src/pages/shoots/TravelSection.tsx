import { useState } from "react";
import { Car, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  team: TeamMemberEntry[];
  onRefresh: () => void;
}

const DIARIAS_OPTIONS = [0, 1, 2, 3];

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

export function TravelSection({ shootId, hasTravel, team, onRefresh }: TravelSectionProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function setHasTravel(value: boolean) {
    setBusy(true);
    try {
      await patchShoot(shootId, { hasTravel: value });
      if (!value) {
        // reset all travel diárias to 0 when disabling
        await applyTravelToAll(shootId, 0);
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
      toast({ title: `${count === 1 ? "1 diária" : `${count} diárias`} aplicada(s) a toda a equipe` });
    } finally {
      setBusy(false);
    }
  }

  async function handleMemberDiarias(entry: TeamMemberEntry, count: number) {
    setBusy(true);
    try {
      await patchTeamMember(shootId, entry.id, count);
      onRefresh();
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
          <span>Houve deslocamento?</span>
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
          {/* Question 2: Apply 1 to all? */}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">Aplicar 1 diária a toda a equipe?</span>
            <div className="flex gap-2">
              <button
                disabled={busy}
                onClick={() => handleApplyAll(1)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                <Check className="h-3 w-3" /> Sim
              </button>
              <button
                disabled={busy}
                onClick={() => handleApplyAll(0)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3" /> Não
              </button>
            </div>
          </div>

          {/* Per-member quick selector */}
          <div className="space-y-2 pt-1">
            {team.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between">
                <span className="text-sm truncate max-w-[60%]">{entry.teamMember?.name ?? "—"}</span>
                <div className="flex gap-1">
                  {DIARIAS_OPTIONS.map((n) => (
                    <button
                      key={n}
                      disabled={busy}
                      onClick={() => handleMemberDiarias(entry, n)}
                      className={cn(
                        "h-7 w-7 rounded-md text-xs font-semibold border transition-colors",
                        entry.travelDiarias === n
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
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
