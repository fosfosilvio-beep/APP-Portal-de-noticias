import { getSupabaseBrowser } from './supabase';

/**
 * Wrapper para manter compatibilidade com componentes que já importam createClient de aqui.
 * Agora utiliza o Singleton unificado para evitar erro de múltiplas instâncias.
 */
export const createClient = () => {
  return getSupabaseBrowser()!;
};
