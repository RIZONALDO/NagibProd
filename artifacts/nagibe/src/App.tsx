import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NotFound from "@/pages/not-found";

import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import TeamList from "@/pages/team/index";
import NewTeamMember from "@/pages/team/new";
import EditTeamMember from "@/pages/team/[id]";
import EquipmentList from "@/pages/equipment/index";
import NewEquipment from "@/pages/equipment/new";
import EditEquipment from "@/pages/equipment/[id]";
import ShootsList from "@/pages/shoots/index";
import NewShoot from "@/pages/shoots/new";
import ShootDetail from "@/pages/shoots/[id]";
import CheckoutShoot from "@/pages/shoots/[id]/checkout";
import ReturnShoot from "@/pages/shoots/[id]/return";
import ActivityLog from "@/pages/activity/index";
import CalendarPage from "@/pages/calendar/index";
import SettingsPage from "@/pages/settings/index";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />

      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>

      <Route path="/team">
        {() => <ProtectedRoute component={TeamList} />}
      </Route>
      <Route path="/team/new">
        {() => <ProtectedRoute component={NewTeamMember} />}
      </Route>
      <Route path="/team/:id">
        {() => <ProtectedRoute component={EditTeamMember} />}
      </Route>

      <Route path="/equipment">
        {() => <ProtectedRoute component={EquipmentList} />}
      </Route>
      <Route path="/equipment/new">
        {() => <ProtectedRoute component={NewEquipment} />}
      </Route>
      <Route path="/equipment/:id">
        {() => <ProtectedRoute component={EditEquipment} />}
      </Route>

      <Route path="/shoots">
        {() => <ProtectedRoute component={ShootsList} />}
      </Route>
      <Route path="/shoots/new">
        {() => <ProtectedRoute component={NewShoot} />}
      </Route>
      <Route path="/shoots/:id">
        {() => <ProtectedRoute component={ShootDetail} />}
      </Route>
      <Route path="/shoots/:id/checkout">
        {() => <ProtectedRoute component={CheckoutShoot} />}
      </Route>
      <Route path="/shoots/:id/return">
        {() => <ProtectedRoute component={ReturnShoot} />}
      </Route>

      <Route path="/calendar">
        {() => <ProtectedRoute component={CalendarPage} />}
      </Route>

      <Route path="/activity">
        {() => <ProtectedRoute component={ActivityLog} />}
      </Route>

      <Route path="/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
