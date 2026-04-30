import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Camera, 
  ActivitySquare,
  CalendarDays,
  Settings,
  Menu,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { settingsApi } from "@/lib/auth-api";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shoots", label: "Pautas", icon: Video },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/team", label: "Equipe", icon: Users },
  { href: "/equipment", label: "Equipamentos", icon: Camera },
  { href: "/activity", label: "Histórico", icon: ActivitySquare },
];

function ThemeToggleButton({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={resolvedTheme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className={cn(
        "flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
        className,
      )}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try { return localStorage.getItem("nagibe-sidebar-collapsed") === "true"; } catch { return false; }
  });
  const { user, isAdmin, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const { data: appSettings } = useQuery({
    queryKey: ["app-settings"],
    queryFn: settingsApi.getApp,
    staleTime: 1000 * 60 * 5,
  });

  const companyName = appSettings?.company_name || "Nagibe Produção";
  const systemName = appSettings?.system_name || "Sistema de Gestão";
  const logoUrl = appSettings?.logo_small_url || appSettings?.logo_url || null;

  useEffect(() => {
    try { localStorage.setItem("nagibe-sidebar-collapsed", String(isCollapsed)); } catch { /* ignore */ }
  }, [isCollapsed]);

  const isDark = resolvedTheme === "dark";

  const NavLinks = ({ onClick, collapsed = false }: { onClick?: () => void; collapsed?: boolean }) => (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              collapsed && "justify-center px-2",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && item.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/settings"
          onClick={onClick}
          title={collapsed ? "Configurações" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-2 border-t pt-4",
            collapsed && "justify-center px-2",
            location.startsWith("/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && "Configurações"}
        </Link>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card px-3 py-6 transition-all duration-200",
          isCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "mb-8",
          isCollapsed ? "flex justify-center px-1" : "px-2"
        )}>
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className={cn("shrink-0 flex items-center justify-center", logoUrl ? "h-9 w-9" : "bg-primary text-primary-foreground p-2 rounded-lg")}>
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-9 w-9 object-contain" />
              ) : (
                <Video className="h-7 w-7" />
              )}
            </div>
            {!isCollapsed && (
              <p className="font-bold text-xl tracking-tight leading-tight truncate">{companyName}</p>
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-[10px] font-light text-muted-foreground tracking-wide">{systemName}&nbsp;&nbsp;v1.0</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <NavLinks collapsed={isCollapsed} />

        {/* Bottom: theme + collapse + user */}
        {user && (
          <div className="mt-auto pt-3 border-t space-y-1">

            {/* Dark mode switch */}
            <div
              className={cn(
                "flex items-center px-3 py-2 rounded-md",
                isCollapsed ? "justify-center" : "justify-between gap-2"
              )}
              title={isCollapsed ? (isDark ? "Modo escuro ativo" : "Modo claro ativo") : undefined}
            >
              {!isCollapsed && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  <span>{isDark ? "Modo escuro" : "Modo claro"}</span>
                </div>
              )}
              {isCollapsed ? (
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
                  className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
              ) : (
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Alternar modo escuro"
                />
              )}
            </div>

            {/* Collapse button — below a separator */}
            <div className="border-t pt-2">
              <button
                onClick={() => setIsCollapsed(v => !v)}
                title={isCollapsed ? "Expandir menu" : "Recolher menu"}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                  isCollapsed && "justify-center"
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 shrink-0" />
                    <span>Recolher menu</span>
                  </>
                )}
              </button>
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  title={isCollapsed ? user.name : undefined}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-foreground truncate text-xs">{user.name}</p>
                        <p className="text-muted-foreground truncate text-xs capitalize">{user.profile}</p>
                      </div>
                      <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-48">
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between border-b bg-card px-4 h-14 shrink-0">
          <div className="flex items-center gap-2">
            <div className={cn("shrink-0 flex items-center justify-center", logoUrl ? "h-7 w-7" : "bg-primary text-primary-foreground p-1.5 rounded-md")}>
              {logoUrl ? (
                <img src={logoUrl} alt={companyName} className="h-7 w-7 object-contain" />
              ) : (
                <Video className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-bold tracking-tight text-base leading-tight">{companyName}</p>
              <div className="border-t border-border mt-1 pt-1">
                <p className="text-[9px] font-light text-muted-foreground tracking-wide leading-none">{systemName}&nbsp;&nbsp;v1.0</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggleButton />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[280px]">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="flex items-center gap-2 mb-8 mt-2">
                  <div className={cn("shrink-0 flex items-center justify-center", logoUrl ? "h-7 w-7" : "bg-primary text-primary-foreground p-1.5 rounded-md")}>
                    {logoUrl ? (
                      <img src={logoUrl} alt={companyName} className="h-7 w-7 object-contain" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-xl tracking-tight leading-tight">{companyName}</p>
                    <div className="border-t border-border mt-2 pt-2">
                      <p className="text-[10px] font-light text-muted-foreground tracking-wide leading-none">{systemName}&nbsp;&nbsp;v1.0</p>
                    </div>
                  </div>
                </div>
                <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
                {user && (
                  <div className="mt-6 pt-4 border-t space-y-1">
                    {/* Theme selector mobile */}
                    <div className="px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-2">Aparência</p>
                      <div className="flex gap-1">
                        {([
                          { value: "light", label: "Claro", icon: Sun },
                          { value: "system", label: "Auto", icon: Monitor },
                          { value: "dark", label: "Escuro", icon: Moon },
                        ] as const).map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-1 py-2 rounded-md text-xs border transition-colors",
                              theme === value
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "border-border text-muted-foreground hover:bg-muted",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 mt-1">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.profile}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card flex justify-around p-2 pb-safe z-50">
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-[4rem] text-xs font-medium rounded-lg transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
