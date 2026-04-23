import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameDay,
  parseISO,
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
    <div className="flex-1 min-h-0 overflow-auto">
      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid md:grid-cols-7 h-full min-h-[400px]">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayShoots = shootsByDay.get(dateKey) ?? [];
          const today = isToday(day);

          return (
            <div
              key={dateKey}
              className={cn(
                "border-r border-b flex flex-col min-h-[400px]",
                today && "bg-primary/5",
              )}
            >
              {/* Day header */}
              <div className={cn(
                "p-2 border-b sticky top-0 bg-card z-10",
                today && "bg-primary/10",
              )}>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <div className={cn(
                    "text-xl font-bold mx-auto w-9 h-9 flex items-center justify-center rounded-full mt-0.5",
                    today ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}>
                    {format(day, "d")}
                  </div>
                </div>
              </div>

              {/* Shoots + add button */}
              <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
                {dayShoots.map((s) => (
                  <ShootCard key={s.id} shoot={s} onClick={() => onShootClick(s)} />
                ))}
                <button
                  onClick={() => onDayClick(day)}
                  className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted rounded transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nova diária</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="md:hidden divide-y">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayShoots = shootsByDay.get(dateKey) ?? [];
          const today = isToday(day);

          return (
            <div key={dateKey} className={cn("p-3", today && "bg-primary/5")}>
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    today ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}>
                    {format(day, "d")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize">
                      {format(day, "EEEE", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(day, "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDayClick(day)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nova
                </button>
              </div>

              {dayShoots.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 pl-10">Nenhuma diária</p>
              ) : (
                <div className="pl-2 space-y-1.5">
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
