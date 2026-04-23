import { Shell } from "@/components/layout/Shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import UsersTab from "./UsersTab";
import ProfilesTab from "./ProfilesTab";
import PersonalizationTab from "./PersonalizationTab";
import GeneralTab from "./GeneralTab";
import WhatsappTab from "./WhatsappTab";

export default function SettingsPage() {
  const { user, isAdmin, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [loading, isAdmin, navigate]);

  if (loading || !user) return null;
  if (!isAdmin) return null;

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, perfis de acesso e personalizações do sistema.
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="profiles">Perfis de Acesso</TabsTrigger>
            <TabsTrigger value="personalization">Personalização</TabsTrigger>
            <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
            <TabsTrigger value="whatsapp">Modelos de WhatsApp</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="profiles">
            <ProfilesTab />
          </TabsContent>
          <TabsContent value="personalization">
            <PersonalizationTab />
          </TabsContent>
          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="whatsapp">
            <WhatsappTab />
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
