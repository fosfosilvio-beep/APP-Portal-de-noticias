import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com privilégios de Admin (Service Role).
 * ATENÇÃO: Use APENAS em Server Components ou API Routes.
 * NUNCA exporte isso para o frontend.
 */
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase Admin: variáveis de ambiente não configuradas. Usando configuração padrão.');
  }

  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    serviceRoleKey || 'placeholder-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
