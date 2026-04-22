import { z } from "zod";

export const adSlotSchema = z.object({
  nome_slot: z.string().min(1, "O nome do slot é obrigatório"),
  posicao_html: z.string().min(1, "A posição é obrigatória"),
  status_ativo: z.boolean().optional(),
  width: z.number().int().positive("Largura deve ser positiva").optional().nullable(),
  height: z.number().int().positive("Altura deve ser positiva").optional().nullable(),
  codigo_html_ou_imagem: z.string().optional().nullable(),
  is_sponsored_content: z.boolean().optional(),
  advertiser_name: z.string().optional().nullable(),
  click_url: z.string().url("URL de clique inválida").optional().nullable().or(z.literal("")),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.status_ativo) {
    if (!data.width) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["width"],
        message: "Largura é obrigatória para slots ativos",
      });
    }
    if (!data.height) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["height"],
        message: "Altura é obrigatória para slots ativos",
      });
    }
  }
});

export type AdSlotFormData = z.infer<typeof adSlotSchema>;
