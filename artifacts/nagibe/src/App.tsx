import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

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

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      
      <Route path="/team" component={TeamList} />
      <Route path="/team/new" component={NewTeamMember} />
      <Route path="/team/:id" component={EditTeamMember} />
      
      <Route path="/equipment" component={EquipmentList} />
      <Route path="/equipment/new" component={NewEquipment} />
      <Route path="/equipment/:id" component={EditEquipment} />
      
      <Route path="/shoots" component={ShootsList} />
      <Route path="/shoots/new" component={NewShoot} />
      <Route path="/shoots/:id" component={ShootDetail} />
      <Route path="/shoots/:id/checkout" component={CheckoutShoot} />
      <Route path="/shoots/:id/return" component={ReturnShoot} />
      
      <Route path="/activity" component={ActivityLog} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
