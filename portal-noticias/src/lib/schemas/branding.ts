import { z } from "zod";

export const brandingSchema = z.object({
  nome_plataforma: z.string().min(1, "Nome da plataforma é obrigatório"),
  logo_url: z.string().optional().or(z.literal("")),
  logo_texto_url: z.string().optional().or(z.literal("")),
  instagram_url: z.string().optional().or(z.literal("")),
  whatsapp_number: z.string().optional().or(z.literal("")),
  ticker_speed: z.number().optional().or(z.literal("")),
  ticker_font_size: z.number().optional().or(z.literal("")),
  ticker_font_color: z.string().optional().or(z.literal("")),
  facebook_page_url: z.string().optional().or(z.literal("")),
  youtube_channel_url: z.string().optional().or(z.literal("")),
  openrouter_api_key: z.string().optional().or(z.literal("")),
  alerta_urgente_ativo: z.boolean().optional(),
  alerta_urgente_texto: z.string().optional(),
  
  // Institucional & Rodapé
  endereco_rodape: z.string().optional().or(z.literal("")),
  email_contato: z.string().optional().or(z.literal("")),
  telefone_contato: z.string().optional().or(z.literal("")),
  copyright_texto: z.string().optional().or(z.literal("")),
  texto_quem_somos: z.string().optional().or(z.literal("")),
  texto_termos_uso: z.string().optional().or(z.literal("")),
  texto_privacidade: z.string().optional().or(z.literal("")),
  
  ui_settings: z.any().optional()
});

export type BrandingFormData = z.infer<typeof brandingSchema>;
