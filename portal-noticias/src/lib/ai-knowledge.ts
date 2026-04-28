export const AI_KNOWLEDGE = {
  modules: {
    publicidade: {
      logic: "Os 'Slots' são os espaços físicos/âncoras no código do site. As 'Campanhas' são agrupadores de banners vinculados a um Anunciante. Um Banner pode estar em múltiplos Slots simultaneamente através da tabela pivô 'banners_slots'.",
      tables: ["anunciantes", "campanhas", "banners", "slots_publicitarios", "banners_slots", "logs_publicidade"],
      tracking: "Cliques são rastreados via /api/click/[id] com filtro de bots. Impressões são registradas via RPC 'registrar_impressao'.",
    },
    noticias: {
      logic: "CRUD completo de matérias com suporte a RSS FeedNews. As notícias são exibidas dinamicamente na Home via componentes 'NewsGrid' e 'AutomatedNewsFeed'.",
      tables: ["noticias", "categorias"],
      ia_features: "Geração de texto e resumo via integração com Gemini/DeepSeek no editor Tiptap.",
    },
    transmissao: {
      logic: "Gerenciamento de lives via RTMP. O player 'SmartPlayer' suporta fallback automático e chat híbrido do YouTube.",
      config: "As chaves de stream e status da live são salvos na tabela de configurações globais.",
    }
  },
  database_rules: [
    "RLS (Row Level Security) deve estar sempre ativo.",
    "Acesso administrativo restrito à role 'authenticated' com check de user_roles.",
    "Métricas de performance devem usar funções atômicas (RPC) para evitar concorrência."
  ],
  design_system: "Shadcn UI + Tailwind CSS com foco em Soft UI e Glassmorphism."
};
