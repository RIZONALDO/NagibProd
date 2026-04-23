import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarShoot } from "@/lib/calendar-api";
import ShootCard from "./ShootCard";

interface Props {
  currentDate: Date;
  shoots: CalendarShoot[];
  onShootClick: (shoot: CalendarShoot) => void;
  onDayClick: (date: Date) => void;
}

export default function WeekView({ currentDate, shoots, onShootClick, onDayClick }: Props) {
  const { days, shootsByDay } = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const shootsByDay = new Map<string, CalendarShoot[]>();
    for (const shoot of shoots) {
      const d = shoot.date;
      if (!shootsByDay.has(d)) shootsByDay.set(d, []);
      shootsByDay.get(d)!.push(shoot);
    }
    return { days, shootsByDay };
  }, [currentDate, shoots]);

  return (
    <div className="flex-1 min-h-0 overflow-auto p-3 md:p-4">
      {/* Desktop: 7-column card grid */}
      <div className="hidden md:grid md:grid-cols-7 gap-2 h-full min-h-[500px]">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayShoots = shootsByDay.get(dateKey) ?? [];
          const today = isToday(day);

          return (
            <div
              key={dateKey}
              className={cn(
                "rounded-2xl border flex flex-col min-h-[500px] overflow-hidden transition-colors",
                today
                  ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                  : "border-border bg-card",
              )}
            >
              {/* Day header */}
              <div className={cn(
                "px-3 py-3 text-center border-b",
                today ? "border-primary/20 bg-primary/10" : "border-border",
              )}>
                <p className={cn(
                  "text-xs font-semibold uppercase tracking-widest mb-1",
                  today ? "text-primary" : "text-muted-foreground",
                )}>
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <div className={cn(
                  "text-2xl font-bold mx-auto w-10 h-10 flex items-center justify-center rounded-full",
                  today
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted cursor-default",
                )}>
                  {format(day, "d")}
                </div>
                {dayShoots.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {dayShoots.length} diária{dayShoots.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Shoots */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {dayShoots.map((s) => (
                  <ShootCard key={s.id} shoot={s} onClick={() => onShootClick(s)} />
                ))}
                {dayShoots.length === 0 && (
                  <div className="h-full flex items-center justify-center py-8">
                    <p className="text-xs text-muted-foreground/40 text-center">Sem diárias</p>
                  </div>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => onDayClick(day)}
                className="shrink-0 flex items-center justify-center gap-1.5 py-2.5 border-t text-xs text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Nova diária
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="md:hidden space-y-3">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayShoots = shootsByDay.get(dateKey) ?? [];
          const today = isToday(day);

          return (
            <div
              key={dateKey}
              className={cn(
                "rounded-2xl border overflow-hidden",
                today ? "border-primary/40" : "border-border",
              )}
            >
              {/* Day header */}
              <div className={cn(
                "flex items-center justify-between px-4 py-3",
                today ? "bg-primary/10" : "bg-card",
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0",
                    today ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}>
                    {format(day, "d")}
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold capitalize", today && "text-primary")}>
                      {format(day, "EEEE", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dayShoots.length > 0
                        ? `${dayShoots.length} diária${dayShoots.length !== 1 ? "s" : ""}`
                        : "Sem diárias"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDayClick(day)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-full transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nova
                </button>
              </div>

              {dayShoots.length > 0 && (
                <div className="p-3 space-y-2 bg-background/50">
                  {dayShoots.map((s) => (
                    <ShootCard key={s.id} shoot={s} onClick={() => onShootClick(s)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
