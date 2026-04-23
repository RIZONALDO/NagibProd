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
import { cn } from "@/lib/utils";
import type { CalendarShoot } from "@/lib/calendar-api";
import { STATUS_COLORS } from "@/lib/calendar-api";
import ShootCard from "./ShootCard";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
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
    <div className="flex-1 flex flex-col min-h-0">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr border-l">
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
                "border-b border-r min-h-[100px] md:min-h-[120px] flex flex-col",
                isCurrentMonth ? "bg-background" : "bg-muted/30",
                today && "bg-primary/5",
              )}
            >
              {/* Day number */}
              <button
                className={cn(
                  "self-start m-1 w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                  today
                    ? "bg-primary text-primary-foreground"
                    : isCurrentMonth
                    ? "text-foreground hover:bg-muted"
                    : "text-muted-foreground/50 hover:bg-muted",
                )}
                onClick={() => onDayClick(day)}
                title={`Criar diária em ${format(day, "dd/MM/yyyy")}`}
              >
                {format(day, "d")}
              </button>

              {/* Shoots */}
              <div className="flex-1 px-1 pb-1 space-y-0.5 overflow-hidden">
                {/* Desktop: card view */}
                <div className="hidden md:flex flex-col gap-0.5">
                  {visibleShoots.map((s) => (
                    <ShootCard
                      key={s.id}
                      shoot={s}
                      onClick={() => onShootClick(s)}
                      compact
                    />
                  ))}
                  {!isExpanded && extra > 0 && (
                    <button
                      className="text-xs text-primary font-medium px-1.5 py-0.5 hover:underline text-left"
                      onClick={() => setExpandedDay(dateKey)}
                    >
                      +{extra} mais
                    </button>
                  )}
                  {isExpanded && dayShoots.length > MAX_VISIBLE && (
                    <button
                      className="text-xs text-muted-foreground px-1.5 py-0.5 hover:underline text-left"
                      onClick={() => setExpandedDay(null)}
                    >
                      Ver menos
                    </button>
                  )}
                </div>

                {/* Mobile: dot indicators + count */}
                <div className="md:hidden">
                  {dayShoots.length > 0 && (
                    <button
                      onClick={() => dayShoots.length === 1 ? onShootClick(dayShoots[0]) : setExpandedDay(isExpanded ? null : dateKey)}
                      className="w-full"
                    >
                      <div className="flex flex-wrap gap-0.5 px-0.5">
                        {dayShoots.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-gray-400"}`}
                          />
                        ))}
                        {dayShoots.length > 3 && (
                          <span className="text-[10px] text-muted-foreground leading-none">+{dayShoots.length - 3}</span>
                        )}
                      </div>
                    </button>
                  )}
                  {isExpanded && (
                    <div className="mt-1 space-y-0.5">
                      {dayShoots.map((s) => (
                        <ShootCard key={s.id} shoot={s} onClick={() => { onShootClick(s); setExpandedDay(null); }} compact />
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
