import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SHOOT_PRIORITY_LABELS, SHOOT_STATUS_LABELS } from "@/lib/constants";

const shootSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  date: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
  location: z.string().min(2, "Local é obrigatório"),
  briefing: z.string().optional().nullable(),
  whatsappSummary: z.string().optional().nullable(),
  producerName: z.string().optional().nullable(),
  clientProject: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["planned", "team_defined", "equipment_separated", "checkout_done", "in_progress", "return_pending", "closed"]),
});

export type ShootFormValues = z.infer<typeof shootSchema>;

interface ShootFormProps {
  defaultValues?: Partial<ShootFormValues>;
  onSubmit: (data: ShootFormValues) => void;
  isSubmitting?: boolean;
}

export function ShootForm({ defaultValues, onSubmit, isSubmitting }: ShootFormProps) {
  const formattedDate = defaultValues?.date
    ? defaultValues.date.split('T')[0]
    : new Date().toISOString().split('T')[0];

  const formattedEndDate = defaultValues?.endDate
    ? defaultValues.endDate.split('T')[0]
    : "";

  const form = useForm<ShootFormValues>({
    resolver: zodResolver(shootSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      date: formattedDate,
      endDate: formattedEndDate || "",
      time: defaultValues?.time || "",
      location: defaultValues?.location || "",
      briefing: defaultValues?.briefing || "",
      whatsappSummary: defaultValues?.whatsappSummary || "",
      producerName: defaultValues?.producerName || "",
      clientProject: defaultValues?.clientProject || "",
      priority: defaultValues?.priority || "medium",
      status: defaultValues?.status || "planned",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Título — campo principal, full width */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Título da Pauta</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Gravação Comercial Banco XYZ – São Paulo"
                  className="text-base"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Período */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Término <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} min={form.watch("date") || undefined} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local da Gravação</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço ou local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientProject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente / Projeto <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Comercial Banco XYZ" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="producerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produtor Responsável</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do produtor" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(SHOOT_PRIORITY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(SHOOT_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="whatsappSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resumo para WhatsApp (Pauta)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Este texto aparecerá no espelho da pauta enviado no WhatsApp..."
                  className="min-h-[80px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="briefing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Briefing Interno / Detalhes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações completas de produção, referências, etc..."
                  className="min-h-[120px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
