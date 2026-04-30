import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, type AppSettings } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload, X, Image as ImageIcon } from "lucide-react";

function ImageUploadField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const isDataUrl = value?.startsWith("data:");
  const isUrl = value && !isDataUrl;
  const hasImage = !!value;

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>

      {/* Preview area / Drop zone */}
      <div
        className={`relative border-2 rounded-lg transition-colors ${
          isDragging
            ? "border-primary bg-primary/5 border-dashed"
            : "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {hasImage ? (
          <div className="p-3 flex items-center gap-3">
            <div className="h-14 w-32 rounded border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={value}
                alt="Logo preview"
                className="max-h-14 max-w-32 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              {isDataUrl ? (
                <p className="text-xs text-muted-foreground">Imagem carregada do computador</p>
              ) : (
                <p className="text-xs text-muted-foreground truncate">{value}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Trocar imagem
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => onChange("")}
                >
                  <X className="h-3 w-3 mr-1" />
                  Remover
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="w-full p-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <ImageIcon className="h-8 w-8 opacity-40" />
            <div className="text-center">
              <p className="text-sm font-medium">Clique para escolher uma imagem</p>
              <p className="text-xs opacity-70">ou arraste e solte aqui</p>
              <p className="text-xs opacity-50 mt-1">PNG, JPG, SVG, WEBP</p>
            </div>
          </button>
        )}
      </div>

      {/* URL fallback input */}
      <div className="flex gap-2 items-center">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou cole uma URL</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Input
        value={isDataUrl ? "" : (value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="text-sm"
      />

      <p className="text-xs text-muted-foreground">{hint}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

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

          <ImageUploadField
            label="Logo principal"
            hint="Exibida na tela de login e cabeçalho. Recomendado: 200×60px, fundo transparente."
            value={form.logo_url ?? ""}
            onChange={(v) => set("logo_url", v)}
          />

          <ImageUploadField
            label="Logo reduzida (ícone)"
            hint="Exibida na sidebar mobile. Recomendado: 40×40px quadrado."
            value={form.logo_small_url ?? ""}
            onChange={(v) => set("logo_small_url", v)}
          />

          <ImageUploadField
            label="Favicon (ícone da aba do navegador)"
            hint="Recomendado: PNG quadrado 32×32 ou 64×64 px."
            value={form.favicon_url ?? ""}
            onChange={(v) => set("favicon_url", v)}
          />
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
