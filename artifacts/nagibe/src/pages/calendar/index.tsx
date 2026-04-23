import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Grid3x3,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useListTeamMembers } from "@workspace/api-client-react";
import { fetchCalendar, type CalendarShoot, type CalendarFilters, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/calendar-api";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import ShootDetailModal from "./ShootDetailModal";

type ViewMode = "month" | "week";

function getDateRange(date: Date, view: ViewMode) {
  if (view === "month") {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return {
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  } else {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
    return {
      start: format(weekStart, "yyyy-MM-dd"),
      end: format(weekEnd, "yyyy-MM-dd"),
    };
  }
}

const STATUSES = Object.entries(STATUS_LABELS);
const PRIORITIES = Object.entries(PRIORITY_LABELS);

export default function CalendarPage() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedShoot, setSelectedShoot] = useState<CalendarShoot | null>(null);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<CalendarFilters>({});

  const { start, end } = useMemo(() => getDateRange(currentDate, view), [currentDate, view]);

  const activeFilters = useMemo(() => {
    return Object.entries(filters).filter(([, v]) => v && v !== "");
  }, [filters]);

  const queryFilters = useMemo(
    () => ({ ...filters, search: search || undefined }),
    [filters, search],
  );

  const { data: shoots = [], isLoading } = useQuery({
    queryKey: ["calendar", start, end, queryFilters],
    queryFn: () => fetchCalendar(start, end, queryFilters),
    staleTime: 30_000,
  });

  const { data: teamData } = useListTeamMembers({ status: "active" });
  const teamMembers = (teamData as { id: number; name: string }[] | undefined) ?? [];

  const navigatePrev = () => {
    setCurrentDate((d) => (view === "month" ? subMonths(d, 1) : subWeeks(d, 1)));
  };
  const navigateNext = () => {
    setCurrentDate((d) => (view === "month" ? addMonths(d, 1) : addWeeks(d, 1)));
  };
  const goToday = () => setCurrentDate(new Date());

  const handleDayClick = useCallback(
    (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      navigate(`/shoots/new?date=${dateStr}`);
    },
    [navigate],
  );

  const setFilter = (key: keyof CalendarFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value || undefined }));
  };

  const clearFilters = () => setFilters({});

  const title = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const sameMonth = format(weekStart, "MM") === format(weekEnd, "MM");
    if (sameMonth) {
      return `${format(weekStart, "d")}–${format(weekEnd, "d 'de' MMMM yyyy", { locale: ptBR })}`;
    }
    return `${format(weekStart, "d MMM", { locale: ptBR })} – ${format(weekEnd, "d MMM yyyy", { locale: ptBR })}`;
  }, [currentDate, view]);

  return (
    <Shell>
      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] -mx-4 md:-mx-8 -mt-4 md:-mt-8 px-0">
        {/* Toolbar */}
        <div className="px-4 md:px-6 py-3 border-b bg-card shrink-0 space-y-2.5">
          {/* Row 1: Navigation + title + view toggle + new button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">

            {/* Left: nav arrows + today + title */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-muted rounded-xl overflow-hidden">
                <button
                  onClick={navigatePrev}
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={goToday}
                  className="h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors border-x border-border"
                >
                  Hoje
                </button>
                <button
                  onClick={navigateNext}
                  className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <h2 className="text-base md:text-lg font-bold capitalize ml-1 tracking-tight">{title}</h2>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Right: view toggle + new button */}
            <div className="flex items-center gap-2">
              {/* View Toggle — pill style */}
              <div className="flex items-center bg-muted p-0.5 rounded-xl gap-0.5">
                <button
                  onClick={() => setView("month")}
                  className={`h-7 px-3 flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                    view === "month"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mês</span>
                </button>
                <button
                  onClick={() => setView("week")}
                  className={`h-7 px-3 flex items-center gap-1.5 text-xs font-semibold rounded-lg transition-all ${
                    view === "week"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Semana</span>
                </button>
              </div>

              <Button
                size="sm"
                className="h-8 rounded-xl font-semibold shadow-sm"
                onClick={() => navigate("/shoots/new")}
              >
                + Nova Diária
              </Button>
            </div>
          </div>

          {/* Row 2: Search + Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar diária, local, cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm rounded-xl border-muted bg-muted/50 focus-visible:bg-background"
              />
              {search && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl border-muted">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filtros
                  {activeFilters.length > 0 && (
                    <Badge className="h-4.5 w-4.5 p-0 flex items-center justify-center text-[10px] rounded-full">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 space-y-3" align="end">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Filtros</p>
                  {activeFilters.length > 0 && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                      Limpar tudo
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select value={filters.status ?? "all"} onValueChange={(v) => setFilter("status", v === "all" ? "" : v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {STATUSES.map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
                  <Select value={filters.priority ?? "all"} onValueChange={(v) => setFilter("priority", v === "all" ? "" : v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todas as prioridades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as prioridades</SelectItem>
                      {PRIORITIES.map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Membro da equipe</label>
                  <Select value={filters.teamMemberId ?? "all"} onValueChange={(v) => setFilter("teamMemberId", v === "all" ? "" : v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Todos os membros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os membros</SelectItem>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Produtor(a)</label>
                  <Input
                    placeholder="Nome do produtor"
                    value={filters.producer ?? ""}
                    onChange={(e) => setFilter("producer", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Local</label>
                  <Input
                    placeholder="Local da diária"
                    value={filters.location ?? ""}
                    onChange={(e) => setFilter("location", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Projeto / Cliente</label>
                  <Input
                    placeholder="Nome do projeto"
                    value={filters.clientProject ?? ""}
                    onChange={(e) => setFilter("clientProject", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                <Button size="sm" className="w-full" onClick={() => setFilterOpen(false)}>
                  Aplicar filtros
                </Button>
              </PopoverContent>
            </Popover>

            {/* Active filter chips */}
            {activeFilters.map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
              >
                {value}
                <button
                  onClick={() => setFilter(key as keyof CalendarFilters, "")}
                  className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Calendar area */}
        <div className="flex-1 overflow-auto">
          {view === "month" ? (
            <MonthView
              currentDate={currentDate}
              shoots={shoots}
              onShootClick={setSelectedShoot}
              onDayClick={handleDayClick}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              shoots={shoots}
              onShootClick={setSelectedShoot}
              onDayClick={handleDayClick}
            />
          )}
        </div>
      </div>

      {/* Shoot detail modal */}
      <ShootDetailModal shoot={selectedShoot} onClose={() => setSelectedShoot(null)} />
    </Shell>
  );
}
