import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  User,
  Users,
  Camera,
  CheckCircle2,
  AlertCircle,
  Circle,
  ArrowRight,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarShoot } from "@/lib/calendar-api";
import {
  STATUS_LABELS,
  STATUS_BG,
  STATUS_TEXT,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/calendar-api";

const MAX_TEAM_SHOWN = 5;

interface Props {
  shoot: CalendarShoot | null;
  onClose: () => void;
}

export default function ShootDetailModal({ shoot, onClose }: Props) {
  const [, navigate] = useLocation();

  if (!shoot) return null;

  const shownTeam = shoot.teamSummary.slice(0, MAX_TEAM_SHOWN);
  const extraTeam = shoot.teamSummary.length - MAX_TEAM_SHOWN;

  const statusBar = STATUS_COLORS[shoot.status] ?? "bg-gray-400";
  const statusBg = STATUS_BG[shoot.status] ?? "bg-gray-50 border-gray-200";
  const statusTxt = STATUS_TEXT[shoot.status] ?? "text-gray-600";
  const priorityColors = PRIORITY_COLORS[shoot.priority] ?? PRIORITY_COLORS.medium;

  const dateStr = (() => {
    try {
      return format(parseISO(shoot.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return shoot.date;
    }
  })();

  return (
    <Dialog open={!!shoot} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Color bar + header */}
        <div className={`h-1.5 w-full ${statusBar} rounded-t-lg`} />
        <div className="px-6 pt-4 pb-0">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold leading-snug">
              {shoot.whatsappSummary || shoot.location}
            </DialogTitle>
          </DialogHeader>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusBg} ${statusTxt}`}>
              {STATUS_LABELS[shoot.status] ?? shoot.status}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityColors}`}>
              {PRIORITY_LABELS[shoot.priority] ?? shoot.priority}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Date, time, location, producer */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="capitalize">{dateStr}</span>
            </div>
            {shoot.time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{shoot.time}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span>{shoot.location}</span>
            </div>
            {shoot.producerName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{shoot.producerName}</span>
              </div>
            )}
            {shoot.clientProject && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium text-foreground">Projeto:</span>
                <span>{shoot.clientProject}</span>
              </div>
            )}
          </div>

          {/* Briefing */}
          {(shoot.briefing || shoot.whatsappSummary) && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Briefing</p>
                <p className="text-sm leading-relaxed text-foreground">
                  {shoot.briefing || shoot.whatsappSummary}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Operational indicators */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Status Operacional</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                {shoot.teamCount === 0 ? (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                ) : shoot.teamConfirmed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span>
                  {shoot.teamCount === 0
                    ? "Sem equipe"
                    : shoot.teamConfirmed
                    ? `Equipe confirmada (${shoot.teamCount})`
                    : `Equipe pendente (${shoot.teamCount})`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {shoot.equipmentCount === 0 ? (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Camera className="h-4 w-4 text-blue-500" />
                )}
                <span>
                  {shoot.equipmentCount === 0
                    ? "Sem equipamentos"
                    : `${shoot.equipmentCount} equipamento${shoot.equipmentCount !== 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {shoot.checkoutDone ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={shoot.checkoutDone ? "text-green-700" : "text-muted-foreground"}>
                  Saída {shoot.checkoutDone ? "realizada" : "pendente"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {shoot.returnPending ? (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                ) : shoot.returnDone ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={shoot.returnPending ? "text-orange-700" : shoot.returnDone ? "text-green-700" : "text-muted-foreground"}>
                  {shoot.returnPending ? "Devolução pendente" : shoot.returnDone ? "Devolução feita" : "Devolução —"}
                </span>
              </div>
            </div>
          </div>

          {/* Team */}
          {shoot.teamSummary.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipe</p>
                </div>
                <div className="space-y-1.5">
                  {shownTeam.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-muted-foreground">{member.role}</span>
                        {member.confirmed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-amber-400" />
                        )}
                      </div>
                    </div>
                  ))}
                  {extraTeam > 0 && (
                    <p className="text-xs text-muted-foreground pl-8">+{extraTeam} membro{extraTeam !== 1 ? "s" : ""}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={() => { onClose(); navigate(`/shoots/${shoot.id}`); }}>
            Abrir Diária
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
