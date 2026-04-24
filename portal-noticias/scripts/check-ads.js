const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ywsvdgzfmvecaoejtlxo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3ZkZ3pmbXZlY2FvZWp0bHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTYxNzMsImV4cCI6MjA5MTkzMjE3M30.vrBqzV3IePaejWhV0vFIpymhqp_y-mHWcHTSN-fq2Qk' // ANON KEY
);

async function checkAds() {
  const { data, error } = await supabase.from("publicidade_banners").select("*").limit(1);
  if (error) {
    console.log("ERRO AO LER ADS:", error);
  } else {
    console.log("ADS DATA:", data);
  }
}

checkAds();
