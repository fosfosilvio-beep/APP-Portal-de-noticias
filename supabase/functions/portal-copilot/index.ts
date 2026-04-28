import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0"

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
    const apiKey = Deno.env.get("GEMINI_API_KEY")
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

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

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })

    const result = await chat.sendMessage(`${systemPrompt}\n\nUsuário pergunta: ${query}`)
    const response = await result.response
    const text = response.text()

    return new Response(
      JSON.stringify({ text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
