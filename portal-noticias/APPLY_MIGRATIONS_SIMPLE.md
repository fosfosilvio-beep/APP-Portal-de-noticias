# 🚀 Aplicar Migrations — Método Simples

## ✅ Passo 1: Abrir Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/projects
2. Selecione seu project ("Nossa Web TV")
3. Vá para: **SQL Editor** (lado esquerdo)

## ✅ Passo 2: Criar Novo Query

Clique em: **+ New query** (canto superior direito)

## ✅ Passo 3: Copiar e Colar

1. Abra arquivo: `supabase/migrations/00_RUN_ALL.sql`
2. **Selecione todo o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)
4. Cole no editor do Supabase (Ctrl+V)

## ✅ Passo 4: Executar

Clique em botão azul: **RUN** (ou `Ctrl+Enter`)

**Esperado**: ✅ Sucesso! (sem erros vermelhos)

---

## ✅ Passo 5: Seed Admin Role (OBRIGATÓRIO)

Crie um **novo query**:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('[SUBSTITUA_AQUI_COM_SEU_USER_ID]', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

**Como achar seu USER_ID**:
1. Supabase Dashboard → **Authentication** → **Users**
2. Procure seu usuário
3. Copie o valor da coluna **ID** (UUID)
4. Substitua `[SUBSTITUA_AQUI_COM_SEU_USER_ID]` no query acima
5. Execute (click **RUN**)

---

## ✅ Passo 6: Ativar Feature Flags (opcional)

Novo query:

```sql
UPDATE public.configuracao_portal
SET ui_settings = COALESCE(ui_settings, '{}'::jsonb) || '{"use_puck_home": false}'::jsonb
WHERE id = 1;
```

Click **RUN**

---

## ✅ Passo 7: Validar

Volte ao terminal e rode:

```bash
npm run dev
```

Acesse: http://localhost:3000/admin

**Esperado**: Dashboard carrega sem erros ✅

---

## ❌ Se Algo Der Erro

### Erro: "Permission denied"
- **Causa**: Chave errada
- **Solução**: Verificar que está usando **Service Role Key** (não Anon Key)
  - Dashboard → Settings → API → copiar "Service Role Key"
  - Não compartilhar essa chave

### Erro: "Table already exists"
- **Causa**: Migrations já foram executadas
- **Solução**: Ignorar erro ou limpar banco (Reset Database em Settings)

### Erro: "Foreign key constraint failed"
- **Causa**: Ordem das migrations
- **Solução**: Executar `00_RUN_ALL.sql` que tem tudo na ordem certa

### Erro de sintaxe SQL
- **Causa**: Arquivo corrompido
- **Solução**: Redownload do arquivo: `supabase/migrations/00_RUN_ALL.sql`

---

**Pronto!** 🎉 Migrations aplicadas com sucesso.
