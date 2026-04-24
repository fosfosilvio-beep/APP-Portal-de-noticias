import { getSupabaseBrowser } from './supabase';

/**
 * Wrapper para manter compatibilidade com componentes que já importam createClient de aqui.
 * Agora utiliza o Singleton unificado para evitar erro de múltiplas instâncias.
 */
export const createClient = () => {
  const client = getSupabaseBrowser();
  if (!client) {
    throw new Error('Supabase client não disponível - variáveis de ambiente não configuradas');
  }
  return client;
};
