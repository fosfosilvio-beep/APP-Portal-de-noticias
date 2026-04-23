#!/bin/bash

# Script para aplicar migrations Supabase
# Uso: ./scripts/apply-migrations.sh

MIGRATIONS_DIR="./supabase/migrations"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY}"

if [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "❌ Erro: SERVICE_ROLE_KEY não definida em .env.local"
  exit 1
fi

echo "🚀 Aplicando migrations Supabase..."
echo "📍 URL: $SUPABASE_URL"
echo ""

# Extrair host da URL
HOST=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|supabase.co||' | tr -d '.')
POSTGRES_HOST="${HOST}.supabase.co"

echo "📊 Migrations encontradas:"
ls -1 "$MIGRATIONS_DIR"/*.sql | sort | while read file; do
  echo "  ✓ $(basename "$file")"
done
echo ""

# Opção 1: Usar psql (se disponível)
if command -v psql &> /dev/null; then
  echo "✅ psql encontrado. Conectando ao banco..."

  # Nota: Você precisa extrair a senha do JWT SERVICE_ROLE_KEY ou usar password prompt
  # Por segurança, solicitaremos senha
  read -s -p "🔐 Digite a senha do usuário postgres (ou ENTER para pular): " PGPASSWORD
  export PGPASSWORD

  successCount=0
  failCount=0

  for file in $(ls -1 "$MIGRATIONS_DIR"/*.sql | sort); do
    echo "⏳ Executando $(basename "$file")..."

    if psql -h "$POSTGRES_HOST" -U postgres -d postgres -f "$file" 2>/dev/null; then
      echo "✅ $(basename "$file") concluído"
      ((successCount++))
    else
      echo "❌ Erro ao executar $(basename "$file")"
      ((failCount++))
    fi
  done

  echo ""
  echo "📊 Resumo: $successCount OK, $failCount falhas"

else
  echo "⚠️ psql não está instalado. Use uma das opções abaixo:"
  echo ""
  echo "📌 Opção 1: Dashboard Supabase (Recomendado)"
  echo "  1. Abra: https://supabase.com/dashboard/projects"
  echo "  2. Selecione seu project"
  echo "  3. Vá para: SQL Editor → New query"
  echo "  4. Cole o conteúdo de cada arquivo em supabase/migrations/*.sql"
  echo "  5. Clique: Run"
  echo ""
  echo "📌 Opção 2: Supabase CLI"
  echo "  npm install -g supabase"
  echo "  supabase db push"
  echo ""
  echo "📌 Opção 3: Instalar psql (PostgreSQL client)"
  echo "  macOS: brew install postgresql"
  echo "  Ubuntu: sudo apt-get install postgresql-client"
  echo "  Windows: Baixar em https://www.postgresql.org/download/windows/"
  echo ""
  echo "📂 Migrations disponíveis:"
  ls -1 "$MIGRATIONS_DIR"/*.sql | sort | nl
fi
