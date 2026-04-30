-- 📐 Inserção da nova categoria editorial
-- Objetivo: Ativar a linha editorial de Plantão Policial

INSERT INTO public.categorias (nome, slug, cor, ativa, ordem)
VALUES ('Plantão Policial Arapongas', 'plantao-policial-arapongas', '#dc2626', true, 1)
ON CONFLICT (slug) DO UPDATE 
SET nome = EXCLUDED.nome,
    cor = EXCLUDED.cor,
    ativa = true;
