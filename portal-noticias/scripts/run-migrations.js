#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltam credenciais. Defina NEXT_PUBLIC_SUPABASE_URL e SERVICE_ROLE_KEY em .env.local');
  process.exit(1);
}

const projectId = SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];

async function querySupabase(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectId}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`Status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function executeSql(sql) {
  // Usar endpoint /rest/v1/ com rpc query ou POST direto
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectId}.supabase.co`,
      port: 443,
      path: '/rest/v1/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Fallback: usar Client + execQueryRaw via RPC ou usar Supabase JS SDK
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Diretório de migrations não encontrado: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('⚠️ Nenhuma migration encontrada');
    return;
  }

  console.log(`📝 Encontradas ${migrationFiles.length} migrations:`);
  migrationFiles.forEach((f) => console.log(`  - ${f}`));
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`⏳ Executando ${file}...`);

    try {
      // Executar via Supabase client.rpc() ou via raw query
      // Usar rpc('sql') se existir, senão fazer request HTTP direto
      const { error } = await supabase.rpc('sql', { query: sql }).catch(() => {
        // Fallback: tentar via query raw (não suportado direto em JS SDK)
        // Usar query HTTP direto
        return executeSql(sql);
      });

      if (error) {
        throw error;
      }

      console.log(`✅ ${file} executado com sucesso\n`);
      successCount++;
    } catch (err) {
      console.error(`❌ Erro em ${file}:`);
      console.error(`   ${err.message}\n`);
      failCount++;
    }
  }

  console.log(`\n📊 Resumo: ${successCount} sucesso, ${failCount} falhas`);

  if (failCount > 0) {
    process.exit(1);
  }
}

// Alternativa: rodar migrations via Supabase Dashboard manualmente
console.log('🚀 Iniciando execução de migrations...\n');
console.log(`Project: ${projectId}`);
console.log(`URL: ${SUPABASE_URL}\n`);

// Nota: Supabase JS SDK não suporta execução de SQL direto
// Usar Dashboard SQL Editor (manual) ou Supabase CLI
console.log('⚠️ IMPORTANTE: Supabase JS SDK não suporta execução de SQL direto.');
console.log('   Use uma das opções:');
console.log('');
console.log('Opção 1: Dashboard SQL Editor (recomendado)');
console.log('  1. Abra https://supabase.com/dashboard/projects');
console.log('  2. Selecione seu project');
console.log('  3. Vá para "SQL Editor"');
console.log('  4. Clique em "New query"');
console.log('  5. Cole o conteúdo de cada arquivo migrations/*.sql');
console.log('  6. Clique "Run"');
console.log('');
console.log('Opção 2: Supabase CLI');
console.log('  1. npm install -g supabase');
console.log('  2. supabase db push');
console.log('');
console.log('Opção 3: psql (acesso direto ao banco)');
console.log('  psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < migrations/*.sql');
console.log('');
console.log('📋 Migrations para executar:');
migrationFiles.forEach((f) => {
  const filePath = path.join(migrationsDir, f);
  console.log(`\n📄 ${f}:`);
  const content = fs.readFileSync(filePath, 'utf-8').split('\n').slice(0, 5).join('\n');
  console.log(`   ${content}...`);
});

console.log('\n✅ Pronto para executar manualmente via Dashboard ou CLI.');
