import { z } from "zod";

export const newsSchema = z.object({
  titulo: z.string().min(5, "Título precisa de pelo menos 5 caracteres").max(200),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  conteudo: z.string().min(20, "Conteúdo muito curto"),
  subtitulo: z.string().max(300, "Subtítulo muito longo").optional(),
  categoria: z.string().optional(),
  categoria_id: z.string().uuid("Categoria inválida").optional().or(z.literal("")),
  imagem_capa: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
  video_url: z.string().url("URL de vídeo inválida").optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).optional(),
  mostrar_na_home_recentes: z.boolean().optional(),
  is_sponsored: z.boolean().optional(),
  ordem_prioridade: z.number().int().min(0).max(100).optional(),
  seo_tags: z.string().optional(),
  galeria_urls: z.array(z.string().url()).optional(),
  ad_id: z.string().uuid().optional().or(z.literal("")),
  titulo_config: z.any().optional(),
  subtitulo_config: z.any().optional(),
});

export type NewsFormData = z.infer<typeof newsSchema>;
