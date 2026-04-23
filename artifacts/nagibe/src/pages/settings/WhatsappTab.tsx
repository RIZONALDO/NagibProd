import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, type WhatsappTemplate } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RotateCcw, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLACEHOLDERS = [
  { key: "{data}", desc: "Data da pauta" },
  { key: "{horario}", desc: "Horário" },
  { key: "{local}", desc: "Local" },
  { key: "{resumo}", desc: "Resumo/Pauta" },
  { key: "{produtor}", desc: "Produtor(a)" },
  { key: "{equipe}", desc: "Lista da equipe" },
  { key: "{equipamentos}", desc: "Lista de equipamentos" },
  { key: "{entregue_por}", desc: "Entregue por" },
  { key: "{revisado_por}", desc: "Revisado por" },
  { key: "{recebido_por}", desc: "Recebido por" },
];

const DEFAULT_CONTENTS: Record<string, string> = {
  pauta: `*{data} - {horario}*\n📍 {local}\n\n*Projeto:* {resumo}\n*Produtor(a):* {produtor}\n\n*Equipe:*\n{equipe}`,
  equipamentos: `*Equipamentos - {data}*\n📍 {local}\n\n{equipamentos}\n\n*Entregue por:* {entregue_por}\n*Revisado por:* {revisado_por}`,
  completo: `*ESPELHO COMPLETO*\n\n*{data} - {horario}*\n📍 {local}\n\n*Projeto:* {resumo}\n*Produtor(a):* {produtor}\n\n*Equipe:*\n{equipe}\n\n*Equipamentos:*\n{equipamentos}\n\n*Entregue por:* {entregue_por}\n*Revisado por:* {revisado_por}\n*Recebido por:* {recebido_por}`,
};

function insertAtCursor(textarea: HTMLTextAreaElement, text: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  return val.substring(0, start) + text + val.substring(end);
}

function TemplateEditor({ template, onSaved }: { template: WhatsappTemplate; onSaved: () => void }) {
  const { toast } = useToast();
  const [content, setContent] = useState(template.content);
  const [showPreview, setShowPreview] = useState(false);

  const mutation = useMutation({
    mutationFn: () => settingsApi.updateTemplate(template.templateKey, content),
    onSuccess: () => {
      toast({ title: `Modelo "${template.name}" salvo` });
      onSaved();
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const previewContent = content
    .replace(/{data}/g, "23/04/2025")
    .replace(/{horario}/g, "08:00")
    .replace(/{local}/g, "Estúdio Nagibe - Pinheiros")
    .replace(/{resumo}/g, "Vídeo Institucional")
    .replace(/{produtor}/g, "Fernanda Costa")
    .replace(/{equipe}/g, "• Carlos Mendes — Diretor de Fotografia\n• Ana Lima — Assistente de Câmera")
    .replace(/{equipamentos}/g, "• Sony FX3 (1 un.) — OK\n• Lente 24-70mm (1 un.) — OK")
    .replace(/{entregue_por}/g, "Carlos Mendes")
    .replace(/{revisado_por}/g, "Fernanda Costa")
    .replace(/{recebido_por}/g, "João Silva");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {PLACEHOLDERS.map((p) => (
            <Badge
              key={p.key}
              variant="outline"
              className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground transition-colors font-mono"
              title={p.desc}
              onClick={() => {
                const el = document.getElementById(`editor-${template.templateKey}`) as HTMLTextAreaElement | null;
                if (el) {
                  const newVal = insertAtCursor(el, p.key);
                  setContent(newVal);
                  el.focus();
                }
              }}
            >
              {p.key}
            </Badge>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowPreview(!showPreview)}
          className="shrink-0"
        >
          <Eye className="h-4 w-4 mr-1" />
          {showPreview ? "Ocultar prévia" : "Ver prévia"}
        </Button>
      </div>

      {showPreview ? (
        <div className="bg-[#dcf8c6] border border-green-300 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono text-gray-800 min-h-[200px]">
          {previewContent}
        </div>
      ) : (
        <Textarea
          id={`editor-${template.templateKey}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] font-mono text-sm resize-y"
        />
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setContent(DEFAULT_CONTENTS[template.templateKey] ?? template.content)}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar padrão
        </Button>
        <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />Salvar</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function WhatsappTab() {
  const qc = useQueryClient();
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: settingsApi.getTemplates,
  });

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Edite os textos usados nos espelhos de WhatsApp. Clique nos placeholders para inseri-los no cursor.
        </p>
        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">Placeholders disponíveis:</span>
          {PLACEHOLDERS.map((p) => (
            <span key={p.key} className="font-mono text-foreground">
              {p.key} <span className="text-muted-foreground">({p.desc})</span>
            </span>
          ))}
        </div>
      </div>

      <Tabs defaultValue={templates[0]?.templateKey ?? "pauta"}>
        <TabsList>
          {templates.map((t) => (
            <TabsTrigger key={t.templateKey} value={t.templateKey}>
              {t.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {templates.map((t) => (
          <TabsContent key={t.templateKey} value={t.templateKey}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <CardDescription>
                  Última atualização: {new Date(t.updatedAt).toLocaleDateString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateEditor
                  template={t}
                  onSaved={() => qc.invalidateQueries({ queryKey: ["whatsapp-templates"] })}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
