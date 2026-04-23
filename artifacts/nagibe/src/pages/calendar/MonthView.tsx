import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarShoot } from "@/lib/calendar-api";
import { STATUS_COLORS } from "@/lib/calendar-api";
import ShootCard from "./ShootCard";

const WEEKDAYS = [
  { short: "Dom", label: "Domingo" },
  { short: "Seg", label: "Segunda" },
  { short: "Ter", label: "Terça" },
  { short: "Qua", label: "Quarta" },
  { short: "Qui", label: "Quinta" },
  { short: "Sex", label: "Sexta" },
  { short: "Sáb", label: "Sábado" },
];
const MAX_VISIBLE = 3;

interface Props {
  currentDate: Date;
  shoots: CalendarShoot[];
  onShootClick: (shoot: CalendarShoot) => void;
  onDayClick: (date: Date) => void;
}

export default function MonthView({ currentDate, shoots, onShootClick, onDayClick }: Props) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const { days, shootsByDay } = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    const shootsByDay = new Map<string, CalendarShoot[]>();
    for (const shoot of shoots) {
      const d = shoot.date;
      if (!shootsByDay.has(d)) shootsByDay.set(d, []);
      shootsByDay.get(d)!.push(shoot);
    }
    return { days, shootsByDay };
  }, [currentDate, shoots]);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 md:p-4 gap-2">
      {/* Weekday header row */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map(({ short }) => (
          <div key={short} className="py-1.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span className="hidden sm:inline">{short}</span>
            <span className="sm:hidden">{short.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="flex-1 grid grid-cols-7 gap-1 auto-rows-fr">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayShoots = shootsByDay.get(dateKey) ?? [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const isExpanded = expandedDay === dateKey;
          const visibleShoots = isExpanded ? dayShoots : dayShoots.slice(0, MAX_VISIBLE);
          const extra = dayShoots.length - MAX_VISIBLE;

          return (
            <div
              key={dateKey}
              className={cn(
                "rounded-xl flex flex-col min-h-[90px] md:min-h-[110px] border transition-colors group",
                today
                  ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                  : isCurrentMonth
                  ? "border-border bg-card hover:border-primary/20"
                  : "border-transparent bg-muted/20",
              )}
            >
              {/* Day number + add button */}
              <div className="flex items-center justify-between px-1.5 pt-1.5 pb-0.5">
                <button
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    today
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCurrentMonth
                      ? "text-foreground hover:bg-primary/10 hover:text-primary"
                      : "text-muted-foreground/40",
                  )}
                  onClick={() => onDayClick(day)}
                  title={`Nova diária em ${format(day, "dd/MM/yyyy")}`}
                >
                  {format(day, "d")}
                </button>

                {/* Add icon on hover (desktop) */}
                {isCurrentMonth && (
                  <button
                    onClick={() => onDayClick(day)}
                    className="hidden md:flex opacity-0 group-hover:opacity-100 w-5 h-5 items-center justify-center rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                    title="Nova diária"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Shoots list */}
              <div className="flex-1 px-1 pb-1 space-y-0.5 overflow-hidden">
                {/* Desktop: pill cards */}
                <div className="hidden md:flex flex-col gap-0.5">
                  {visibleShoots.map((s) => (
                    <ShootCard key={s.id} shoot={s} onClick={() => onShootClick(s)} compact />
                  ))}
                  {!isExpanded && extra > 0 && (
                    <button
                      className="text-[11px] font-medium text-primary px-2 py-0.5 rounded-full hover:bg-primary/10 transition-colors text-left"
                      onClick={() => setExpandedDay(dateKey)}
                    >
                      +{extra} mais
                    </button>
                  )}
                  {isExpanded && (
                    <button
                      className="text-[11px] text-muted-foreground px-2 py-0.5 hover:underline text-left"
                      onClick={() => setExpandedDay(null)}
                    >
                      Ver menos
                    </button>
                  )}
                </div>

                {/* Mobile: colored dots */}
                <div className="md:hidden">
                  {dayShoots.length > 0 && (
                    <button
                      onClick={() =>
                        dayShoots.length === 1
                          ? onShootClick(dayShoots[0])
                          : setExpandedDay(isExpanded ? null : dateKey)
                      }
                      className="w-full"
                    >
                      <div className="flex flex-wrap gap-0.5 px-0.5 py-0.5">
                        {dayShoots.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            className={cn("w-2 h-2 rounded-full", STATUS_COLORS[s.status] ?? "bg-gray-400")}
                          />
                        ))}
                        {dayShoots.length > 3 && (
                          <span className="text-[10px] text-muted-foreground leading-none self-center">
                            +{dayShoots.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  )}
                  {isExpanded && (
                    <div className="mt-0.5 space-y-0.5">
                      {dayShoots.map((s) => (
                        <ShootCard
                          key={s.id}
                          shoot={s}
                          onClick={() => { onShootClick(s); setExpandedDay(null); }}
                          compact
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
