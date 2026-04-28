# [0215] Tela de Exclusão de Dados

**Caminho:** `/src/app/exclusao-de-dados/page.tsx`  
**Rota Web:** `/exclusao-de-dados`  
**Acesso:** Link disponível no rodapé (Footer) sob a seção "Institucional".  
**Responsabilidade Única:** Fornecer instruções claras para os usuários e para o Facebook (Meta) sobre como os dados de usuário podem ser solicitados para exclusão da plataforma.

## Propósito
Esta página é um requisito obrigatório para o cadastro e aprovação do aplicativo na plataforma do Facebook for Developers. Ela serve como a "URL de instruções de exclusão de dados" exigida nas configurações do app.

## Componentes Utilizados
- `lucide-react`: Ícones (`ShieldCheck`, `ArrowLeft`, `Trash2`)
- **Estilização**: TailwindCSS (classes tipográficas e containers similares à página de Privacidade)

## Contrato de Dados
A página faz uma única chamada ao Supabase no cliente (`useEffect`) para buscar a tabela `configuracao_portal` visando resgatar o `email_contato` dinâmico do sistema.

```typescript
const { data } = await supabase.from("configuracao_portal").select("*").single();
// Usa config.email_contato
```

## Estrutura da Página
1. **Cabeçalho (Header)**: Minimalista, contendo apenas um botão de "Voltar para o Portal" e um título "Privacidade".
2. **Main Content**:
   - Título principal e subtítulo de orientação.
   - **Instruções Facebook**: Passo-a-passo numerado indicando como o usuário deve acessar as configurações do Facebook -> Apps e Sites -> Remover o aplicativo.
   - **Instruções Manuais (Email)**: Alternativa de exclusão manual via email para o administrador, exibindo dinamicamente o e-mail de contato cadastrado na área administrativa.

## Histórico de Modificações
- **Criada em**: 2026-04-27
- **Motivo**: Exigência de URL de exclusão de dados no painel Facebook for Developers.
