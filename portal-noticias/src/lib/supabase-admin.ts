import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com privilégios de Admin (Service Role).
 * ATENÇÃO: Use APENAS em Server Components ou API Routes.
 * NUNCA exporte isso para o frontend.
 */
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL não está configurado');
  }

  if (!serviceRoleKey) {
    throw new Error('SERVICE_ROLE_KEY não está configurado');
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
