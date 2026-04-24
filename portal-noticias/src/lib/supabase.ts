import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Singleton para o cliente Supabase no Browser.
 * Evita o erro "Multiple GoTrueClient instances detected".
 */
export const getSupabaseBrowser = () => {
  if (typeof window === 'undefined') return null;

  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
};

// Mantendo compatibilidade com exportação direta se necessário
export const supabase = typeof window !== 'undefined' ? getSupabaseBrowser()! : null as any;
