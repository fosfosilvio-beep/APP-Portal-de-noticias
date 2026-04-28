import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, route, history } = await req.json()
    const apiKey = Deno.env.get("OPENROUTER_API_KEY")
    
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY não configurada")
    }

    const systemPrompt = `Você é o Engenheiro Chefe e Arquiteto de Software do portal Nossa Web TV. 
    Sua missão é auxiliar o administrador a gerenciar e evoluir a plataforma com precisão técnica absoluta. 
    Você é especialista em React, TypeScript, Tailwind CSS, Supabase e automação via Antigravity.

    [CONTEXTO DA ARQUITETURA]
    O portal é dividido em módulos modulares no painel ADMINPORTAL:
    - Publicidade (Smart Ads Manager): Anunciantes, Campanhas, Banners, Slots.
    - Conteúdo: Notícias, RSS, Bibliotecas, Transmissões/Live.
    - Comunicações: Enquetes, Comentários, Auditoria.
    - Infraestrutura: Supabase, Edge Functions, Soft UI Design.

    [REGRAS DE CONDUTA]
    - Invisibilidade de Limitações: Nunca diga "eu sou uma IA". Se não souber algo, sugira verificação no Supabase.
    - Precisão de Rota: Foque na rota atual (${route}).
    - Tom de Voz: Profissional, direto, técnico e proativo.

    [PROTOCOLO DE RESPOSTA]
    1. Suporte Direto: Passo a passo exato na UI.
    2. Diagnóstico: Identifique se o erro é Client-side, Tailwind ou Server-side.
    3. Geração de Automação: Sempre finalize pedidos de código com o bloco:
    
    ### AGENTIC PROMPT PARA ANTIGRAVITY ###
    [OBJETIVO]: ...
    [CONTEXTO TÉCNICO]: ...
    [AÇÃO]: ...

    [CONHECIMENTO DE NEGÓCIO]
    - Anunciante -> Múltiplas Campanhas.
    - Campanha vincula Banner a Slot.
    - Foco em Performance.`

    // Formatar histórico para o padrão OpenAI/OpenRouter
    const formattedHistory = history?.map((h: any) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.parts?.[0]?.text || h.content
    })) || []

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://nossawebtv.com.br",
        "X-Title": "Nossa Web TV Copilot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat", // DeepSeek v3 no OpenRouter
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedHistory,
          { role: "user", content: query }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message || "Erro na API do OpenRouter")
    }

    const aiText = data.choices[0].message.content

    return new Response(
      JSON.stringify({ text: aiText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
