const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ywsvdgzfmvecaoejtlxo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3ZkZ3pmbXZlY2FvZWp0bHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTYxNzMsImV4cCI6MjA5MTkzMjE3M30.vrBqzV3IePaejWhV0vFIpymhqp_y-mHWcHTSN-fq2Qk'
);

async function run() {
  const { data, error } = await supabase.from('configuracao_portal').select('*').single();
  console.log(data, error);
}

run();
