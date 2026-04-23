import { db, usersTable, appSettingsTable, whatsappTemplatesTable } from "./index";
import bcrypt from "bcryptjs";

const DEFAULT_WHATSAPP_PAUTA = `*{data} - {horario}*
📍 {local}

*Projeto:* {resumo}
*Produtor(a):* {produtor}

*Equipe:*
{equipe}`;

const DEFAULT_WHATSAPP_EQUIPAMENTOS = `*Equipamentos - {data}*
📍 {local}

{equipamentos}

*Entregue por:* {entregue_por}
*Revisado por:* {revisado_por}`;

const DEFAULT_WHATSAPP_COMPLETO = `*ESPELHO COMPLETO*

*{data} - {horario}*
📍 {local}

*Projeto:* {resumo}
*Produtor(a):* {produtor}

*Equipe:*
{equipe}

*Equipamentos:*
{equipamentos}

*Entregue por:* {entregue_por}
*Revisado por:* {revisado_por}
*Recebido por:* {recebido_por}`;

async function seedSettings() {
  console.log("Seeding settings data...");

  const passwordHash = await bcrypt.hash("admin123", 10);
  const existing = await db.select().from(usersTable).limit(1);
  if (existing.length === 0) {
    await db.insert(usersTable).values([
      {
        name: "Administrador",
        email: "admin@nagibe.com.br",
        login: "admin",
        passwordHash,
        profile: "administrador",
        status: "active",
      },
    ]);
    console.log("Admin user created (login: admin, senha: admin123)");
  }

  const APP_SETTINGS_DEFAULTS: Array<{ key: string; value: string }> = [
    { key: "company_name", value: "Nagibe Produção" },
    { key: "system_name", value: "Nagibe Produção" },
    { key: "logo_url", value: "" },
    { key: "logo_small_url", value: "" },
    { key: "primary_color", value: "#f59e0b" },
    { key: "secondary_color", value: "#1e293b" },
    { key: "favicon_url", value: "" },
    { key: "footer_text", value: "" },
    { key: "date_format", value: "DD/MM/YYYY" },
    { key: "timezone", value: "America/Sao_Paulo" },
    { key: "login_message", value: "Bem-vindo ao sistema de gestão operacional." },
    { key: "whatsapp_button", value: "open" },
    { key: "language", value: "pt-BR" },
    { key: "dark_mode", value: "disabled" },
  ];

  for (const setting of APP_SETTINGS_DEFAULTS) {
    await db
      .insert(appSettingsTable)
      .values({ key: setting.key, value: setting.value })
      .onConflictDoNothing();
  }
  console.log("App settings seeded");

  const templates = [
    { templateKey: "pauta", name: "Espelho da Pauta", content: DEFAULT_WHATSAPP_PAUTA },
    { templateKey: "equipamentos", name: "Espelho dos Equipamentos", content: DEFAULT_WHATSAPP_EQUIPAMENTOS },
    { templateKey: "completo", name: "Espelho Completo", content: DEFAULT_WHATSAPP_COMPLETO },
  ];

  for (const tpl of templates) {
    await db
      .insert(whatsappTemplatesTable)
      .values(tpl)
      .onConflictDoNothing();
  }
  console.log("WhatsApp templates seeded");

  console.log("Done!");
  process.exit(0);
}

seedSettings().catch((err) => {
  console.error(err);
  process.exit(1);
});
