const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: 'portal-noticias/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY
);

async function testSql() {
  const sql = "SELECT 1;";
  try {
    const { data, error } = await supabase.rpc('sql', { query: sql });
    if (error) {
        console.log("RPC 'sql' failed:", error.message);
        const { data: d2, error: e2 } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (e2) {
            console.log("RPC 'exec_sql' failed:", e2.message);
        } else {
            console.log("RPC 'exec_sql' worked!");
        }
    } else {
        console.log("RPC 'sql' worked!");
    }
  } catch (err) {
    console.log("Fetch error:", err.message);
  }
}

testSql();
