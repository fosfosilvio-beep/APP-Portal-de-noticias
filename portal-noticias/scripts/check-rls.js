const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ywsvdgzfmvecaoejtlxo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3ZkZ3pmbXZlY2FvZWp0bHhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM1NjE3MywiZXhwIjoyMDkxOTMyMTczfQ.s9dI6pP8O_sVRYCo6MQW5JKLlW_WYLg6y1r2s4osiQI' // SERVICE ROLE
);

async function checkRLS() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: "SELECT * FROM pg_policies WHERE tablename = 'configuracao_portal'" });
  if (error) {
    console.log("RPC falhou, tentando consultar via anon key se eu consigo ler");
  } else {
    console.log(data);
  }
}

checkRLS();
