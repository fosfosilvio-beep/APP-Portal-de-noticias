const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const sql = `
    ALTER TABLE ad_slots
      ADD COLUMN IF NOT EXISTS width INT,
      ADD COLUMN IF NOT EXISTS height INT,
      ADD COLUMN IF NOT EXISTS is_sponsored_content BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS advertiser_name TEXT,
      ADD COLUMN IF NOT EXISTS click_url TEXT,
      ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
  `;
  
  // No Supabase, se você não habilitou RPC custom para exec SQL, o rpc não funciona.
  // Vamos usar o PostgREST direto pra ver. 
  // Na verdade, tabelas e colunas novas geralmente precisam ser feitas no painel se não houver acesso psql ou cli configurado corretamente.
  // Tentando via RPC exec_sql se existir:
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  console.log("RPC Error:", error?.message);
}

run();
