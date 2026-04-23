import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, type AppSettings } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function PersonalizationTab() {
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
      toast({ title: "Personalização salva com sucesso" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identidade da Empresa</CardTitle>
          <CardDescription>Nome e identidade visual exibidos em todo o sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nome da empresa</Label>
              <Input
                value={form.company_name ?? ""}
                onChange={(e) => set("company_name", e.target.value)}
                placeholder="Nagibe Produção"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nome do sistema</Label>
              <Input
                value={form.system_name ?? ""}
                onChange={(e) => set("system_name", e.target.value)}
                placeholder="Nagibe Produção"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>URL da logo principal</Label>
            <Input
              value={form.logo_url ?? ""}
              onChange={(e) => set("logo_url", e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">Cole uma URL de imagem (PNG, SVG, WEBP). Recomendado: 200×60px.</p>
          </div>
          <div className="space-y-1.5">
            <Label>URL da logo reduzida (ícone)</Label>
            <Input
              value={form.logo_small_url ?? ""}
              onChange={(e) => set("logo_small_url", e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">Exibida na sidebar mobile. Recomendado: 40×40px.</p>
          </div>
          <div className="space-y-1.5">
            <Label>URL do favicon</Label>
            <Input
              value={form.favicon_url ?? ""}
              onChange={(e) => set("favicon_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cores do Sistema</CardTitle>
          <CardDescription>Cores exibidas no cabeçalho, sidebar e botões.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cor principal</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.primary_color ?? "#f59e0b"}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="h-9 w-12 rounded border border-input cursor-pointer p-0.5"
                />
                <Input
                  value={form.primary_color ?? "#f59e0b"}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cor secundária</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.secondary_color ?? "#1e293b"}
                  onChange={(e) => set("secondary_color", e.target.value)}
                  className="h-9 w-12 rounded border border-input cursor-pointer p-0.5"
                />
                <Input
                  value={form.secondary_color ?? "#1e293b"}
                  onChange={(e) => set("secondary_color", e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rodapé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Texto do rodapé (opcional)</Label>
            <Input
              value={form.footer_text ?? ""}
              onChange={(e) => set("footer_text", e.target.value)}
              placeholder="© 2024 Nagibe Produção. Todos os direitos reservados."
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
        {mutation.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
        ) : (
          <><Save className="mr-2 h-4 w-4" />Salvar personalização</>
        )}
      </Button>
    </div>
  );
}
