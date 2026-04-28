const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://ywsvdgzfmvecaoejtlxo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3ZkZ3pmbXZlY2FvZWp0bHhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM1NjE3MywiZXhwIjoyMDkxOTMyMTczfQ.s9dI6pP8O_sVRYCo6MQW5JKLlW_WYLg6y1r2s4osiQI"
);

async function checkSlug() {
  const slug = "desenvolvedor-de-jogos-e-professor-premiado-cole-tomas-allen-detido-apos-tentativa-de-tiroteio-contra-trump";
  const { data, error } = await supabase
    .from('noticias')
    .select('id, titulo, slug')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
  }
}

checkSlug();
