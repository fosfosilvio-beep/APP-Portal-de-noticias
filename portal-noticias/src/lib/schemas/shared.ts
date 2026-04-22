import { z } from "zod";

const youtubeUrl = z
  .string()
  .url("URL inválida")
  .refine(
    (url) => /(?:youtube\.com|youtu\.be)/.test(url),
    "Precisa ser uma URL do YouTube"
  )
  .optional()
  .or(z.literal(""));

export const adSlotSchema = z.object({
  posicao_html: z.string().min(1, "Posição obrigatória"),
  titulo: z.string().min(2, "Título obrigatório"),
  image_url: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
  link_url: z.string().url("URL de destino inválida").optional().or(z.literal("")),
  html_embed: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  is_sponsored_content: z.boolean().default(false),
  advertiser_name: z.string().optional(),
  status_ativo: z.boolean().default(true),
  start_date: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  end_date: z.string().datetime({ offset: true }).optional().or(z.literal("")),
});

export const podcastSchema = z.object({
  titulo: z.string().min(3, "Título obrigatório"),
  descricao: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug inválido"),
  thumbnail_url: z.string().url("URL inválida").optional().or(z.literal("")),
  url: youtubeUrl,
  duracao: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const uiSettingsSchema = z.object({
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (ex: #00AEE0)"),
  font_family: z.enum(["Inter", "Anton", "Montserrat"]).default("Inter"),
  font_weight: z.enum(["400", "500", "600", "700", "800", "900"]).default("700"),
  logo_url: z.string().url().optional().or(z.literal("")),
  logo_texto_url: z.string().url().optional().or(z.literal("")),
  brand_name: z.string().max(60),
  breaking_news_alert: z
    .object({
      active: z.boolean().default(false),
      text: z.string().max(200).optional(),
      speed: z.enum(["slow", "normal", "fast"]).default("normal"),
    })
    .optional(),
  widgets_visibility: z
    .object({
      weather: z.boolean().default(true),
      giro24h: z.boolean().default(true),
      plantao: z.boolean().default(true),
      herobanner: z.boolean().default(true),
    })
    .optional(),
});

export const transmissaoSchema = z.object({
  is_live: z.boolean().optional(),
  titulo_live: z.string().max(100).optional(),
  descricao_live: z.string().max(250).optional(),
  url_live_youtube: youtubeUrl,
  url_live_facebook: z.string().url("URL do Facebook inválida").optional().or(z.literal("")),
  mostrar_live_facebook: z.boolean().optional(),
  fake_viewers_boost: z.number().int().min(0).optional(),
  organic_views_enabled: z.boolean().optional(),
});

export type AdSlotFormData = z.infer<typeof adSlotSchema>;
export type PodcastFormData = z.infer<typeof podcastSchema>;
export type UISettingsFormData = z.infer<typeof uiSettingsSchema>;
export type TransmissaoFormData = z.infer<typeof transmissaoSchema>;

