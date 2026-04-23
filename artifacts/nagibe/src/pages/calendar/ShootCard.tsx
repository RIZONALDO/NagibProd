import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarShoot } from "@/lib/calendar-api";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/calendar-api";

interface Props {
  shoot: CalendarShoot;
  onClick: () => void;
  compact?: boolean;
}

const PRIORITY_DOT: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-blue-400",
  low: "bg-green-400",
};

export default function ShootCard({ shoot, onClick, compact = false }: Props) {
  const color = STATUS_COLORS[shoot.status] ?? "bg-gray-400";
  const priorityDot = PRIORITY_DOT[shoot.priority] ?? PRIORITY_DOT.medium;
  const title = shoot.whatsappSummary || shoot.location;
  const shortTitle = title.length > 28 ? title.slice(0, 26) + "…" : title;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left group"
      >
        <div className={cn(
          "flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs cursor-pointer",
          "hover:opacity-80 transition-opacity bg-card border",
          "border-l-[3px]",
        )}
          style={{ borderLeftColor: color.replace("bg-", "").includes("-") ? undefined : undefined }}
        >
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
          <span className="font-medium truncate leading-tight">{shortTitle}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left group rounded border overflow-hidden",
        "hover:shadow-sm transition-all duration-150",
        "bg-card cursor-pointer",
      )}
    >
      {/* Status color bar */}
      <div className={`h-0.5 w-full ${color}`} />
      <div className="px-2 py-1.5 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot}`} />
          <span className="text-xs font-semibold leading-tight line-clamp-1 flex-1">{shortTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {shoot.time && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {shoot.time}
            </span>
          )}
          {shoot.producerName && (
            <span className="flex items-center gap-0.5 truncate">
              <User className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{shoot.producerName.split(" ")[0]}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
