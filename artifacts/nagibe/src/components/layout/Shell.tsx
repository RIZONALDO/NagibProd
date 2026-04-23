import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Camera, 
  ActivitySquare,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shoots", label: "Diárias", icon: Video },
  { href: "/team", label: "Equipe", icon: Users },
  { href: "/equipment", label: "Equipamentos", icon: Camera },
  { href: "/activity", label: "Histórico", icon: ActivitySquare },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onClick} className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}>
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Video className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Nagibe Produção</span>
        </div>
        <NavLinks />
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between border-b bg-card px-4 h-14 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <Video className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight">Nagibe</span>
          </div>
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
                <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                  <Video className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg tracking-tight">Nagibe Produção</span>
              </div>
              <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
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
