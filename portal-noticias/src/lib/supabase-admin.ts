import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com privilégios de Admin (Service Role).
 * ATENÇÃO: Use APENAS em Server Components ou API Routes.
 * NUNCA exporte isso para o frontend.
 */
export const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
