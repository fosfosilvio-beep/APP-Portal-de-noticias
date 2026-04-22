import { z } from "zod";

export const newsSchema = z.object({
  titulo: z.string().min(5, "Título precisa de pelo menos 5 caracteres").max(200),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  conteudo: z.string().min(20, "Conteúdo muito curto").optional(),
  resumo: z.string().max(300, "Resumo máximo de 300 caracteres").optional(),
  categoria: z.string().min(1, "Selecione uma categoria"),
  imagem_capa: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
  video_url: z.string().url("URL de vídeo inválida").optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  mostrar_na_home_recentes: z.boolean().default(true),
  is_sponsored: z.boolean().default(false),
  ordem_prioridade: z.number().int().min(0).max(100).default(0),
  tags: z.array(z.string()).optional(),
});

export type NewsFormData = z.infer<typeof newsSchema>;
