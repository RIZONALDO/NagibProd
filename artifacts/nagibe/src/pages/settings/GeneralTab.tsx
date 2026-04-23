import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, type AppSettings } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function GeneralTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["app-settings"],
    queryFn: settingsApi.getApp,
  });

  const [form, setForm] = useState<Partial<AppSettings>>({});
  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: Partial<AppSettings>) => settingsApi.updateApp(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-settings"] });
      toast({ title: "Configurações salvas com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data e Região</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Formato de data</Label>
              <Select value={form.date_format ?? "DD/MM/YYYY"} onValueChange={(v) => set("date_format", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                  <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fuso horário</Label>
              <Select value={form.timezone ?? "America/Sao_Paulo"} onValueChange={(v) => set("timezone", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                  <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                  <SelectItem value="America/Noronha">Noronha (UTC-2)</SelectItem>
                  <SelectItem value="America/Belem">Belém (UTC-3)</SelectItem>
                  <SelectItem value="America/Fortaleza">Fortaleza (UTC-3)</SelectItem>
                  <SelectItem value="America/Porto_Velho">Porto Velho (UTC-4)</SelectItem>
                  <SelectItem value="America/Rio_Branco">Rio Branco (UTC-5)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tela de Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Mensagem de boas-vindas</Label>
            <Input
              value={form.login_message ?? ""}
              onChange={(e) => set("login_message", e.target.value)}
              placeholder="Bem-vindo ao sistema de gestão operacional."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Botão de WhatsApp</CardTitle>
          <CardDescription>Comportamento ao clicar nos botões de espelho.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={form.whatsapp_button ?? "open"} onValueChange={(v) => set("whatsapp_button", v)}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Abrir WhatsApp Web</SelectItem>
              <SelectItem value="copy">Apenas copiar texto</SelectItem>
              <SelectItem value="both">Copiar e abrir WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Idioma</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={form.language ?? "pt-BR"} onValueChange={(v) => set("language", v)}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-base">Modo Escuro</CardTitle>
          <CardDescription>Em breve — funcionalidade planejada para versão futura.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select disabled value="disabled">
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disabled">Desativado (padrão)</SelectItem>
              <SelectItem value="dark">Sempre escuro</SelectItem>
              <SelectItem value="system">Seguir sistema</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
        {mutation.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
        ) : (
          <><Save className="mr-2 h-4 w-4" />Salvar configurações</>
        )}
      </Button>
    </div>
  );
}
