import { z } from "zod";

export const brandingSchema = z.object({
  nome_plataforma: z.string().min(1, "Nome da plataforma é obrigatório"),
  logo_url: z.string().url("URL do logotipo inválida").optional().or(z.literal("")),
  facebook_page_url: z.string().url("URL do Facebook inválida").optional().or(z.literal("")),
  youtube_channel_url: z.string().url("URL do YouTube inválida").optional().or(z.literal("")),
  openrouter_api_key: z.string().optional().or(z.literal("")),
  alerta_urgente_ativo: z.boolean().optional(),
  alerta_urgente_texto: z.string().optional(),
  ui_settings: z.object({
    theme_color: z.string().optional(),
    header_style: z.enum(["classic", "modern", "minimal"]).optional(),
    font_family: z.string().optional(),
  }).optional()
});

export type BrandingFormData = z.infer<typeof brandingSchema>;
