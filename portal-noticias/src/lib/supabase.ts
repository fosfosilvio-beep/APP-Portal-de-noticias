import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Singleton para o cliente Supabase no Browser.
 * Evita o erro "Multiple GoTrueClient instances detected".
 */
export const getSupabaseBrowser = () => {
  if (typeof window === 'undefined') return null;

  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase: variáveis de ambiente não configuradas');
    return null;
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);

  return client;
};

// Export seguro que verifica se o cliente existe
export const supabase = typeof window !== 'undefined' ? getSupabaseBrowser() : null;
