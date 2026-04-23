import { Clock, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarShoot } from "@/lib/calendar-api";
import { STATUS_CARD, STATUS_LABELS } from "@/lib/calendar-api";

interface Props {
  shoot: CalendarShoot;
  onClick: () => void;
  compact?: boolean;
}

const PRIORITY_RING: Record<string, string> = {
  urgent: "ring-1 ring-red-400",
  high:   "ring-1 ring-amber-400",
  medium: "",
  low:    "",
};

const PRIORITY_LABEL_COLOR: Record<string, string> = {
  urgent: "text-red-600 dark:text-red-400",
  high:   "text-amber-600 dark:text-amber-400",
  medium: "",
  low:    "",
};

export default function ShootCard({ shoot, onClick, compact = false }: Props) {
  const card = STATUS_CARD[shoot.status] ?? STATUS_CARD.planned;
  const title = shoot.whatsappSummary || shoot.location;

  /* ── Compact pill (Month view) ─────────────────────────── */
  if (compact) {
    const shortTitle = title.length > 26 ? title.slice(0, 24) + "…" : title;
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight truncate border",
          "hover:brightness-95 active:scale-[0.98] transition-all duration-100 cursor-pointer",
          card.bg, card.text, card.border,
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", card.dot)} />
        <span className="truncate">{shortTitle}</span>
      </button>
    );
  }

  /* ── Full card (Week view) ─────────────────────────────── */
  const shortTitle = title.length > 40 ? title.slice(0, 38) + "…" : title;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-2.5 space-y-1.5 cursor-pointer",
        "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
        "transition-all duration-150",
        card.bg, card.border,
        PRIORITY_RING[shoot.priority],
      )}
    >
      {/* Title row */}
      <div className="flex items-start gap-2">
        <span className={cn("mt-1 w-2 h-2 rounded-full shrink-0", card.dot)} />
        <span className={cn("text-xs font-bold leading-snug line-clamp-2 flex-1", card.text)}>
          {shortTitle}
        </span>
      </div>

      {/* Meta row */}
      <div className={cn("flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] pl-4", card.text, "opacity-80")}>
        {shoot.time && (
          <span className="flex items-center gap-0.5 font-medium">
            <Clock className="h-2.5 w-2.5" />
            {shoot.time}
          </span>
        )}
        {shoot.location && (
          <span className="flex items-center gap-0.5 truncate max-w-[9rem]">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{shoot.location}</span>
          </span>
        )}
        {shoot.producerName && (
          <span className="flex items-center gap-0.5">
            <User className="h-2.5 w-2.5 shrink-0" />
            {shoot.producerName.split(" ")[0]}
          </span>
        )}
      </div>

      {/* Status label */}
      <div className="pl-4">
        <span className={cn(
          "inline-block text-[10px] font-semibold uppercase tracking-wide",
          card.text, "opacity-70",
        )}>
          {STATUS_LABELS[shoot.status] ?? shoot.status}
        </span>
      </div>
    </button>
  );
}
