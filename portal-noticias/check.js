const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';
for (let line of env) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
}
SUPABASE_URL = SUPABASE_URL.replace(/['\"]+/g, '');
SUPABASE_KEY = SUPABASE_KEY.replace(/['\"]+/g, '');

fetch(SUPABASE_URL + '/rest/v1/podcasts?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }})
  .then(res => res.json())
  .then(data => console.log('podcasts fetch:', Array.isArray(data) ? data.length + ' items' : data));

fetch(SUPABASE_URL + '/rest/v1/programas?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }})
  .then(res => res.json())
  .then(data => console.log('programas fetch:', Array.isArray(data) ? data.length + ' items' : data));
