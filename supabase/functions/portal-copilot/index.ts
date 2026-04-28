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

    const systemPrompt = `Você é o Engenheiro Chefe do portal Nossa Web TV. 
    Você é onisciente sobre o sistema. 
    Contexto Atual: O usuário está na rota ${route}.
    
    Conhecimento Técnico:
    - Módulo Publicidade: Tabelas (anunciantes, campanhas, banners, slots_publicitarios, banners_slots). Lógica: Slots são âncoras, Campanhas vinculam banners.
    - Módulo Notícias: Tabelas (noticias, categorias). FeedNews RSS ativo.
    - Módulo Transmissão: Player SmartPlayer com fallback RTMP.
    
    Instruções:
    1. Responda de forma técnica, porém direta.
    2. Se detectar um erro ou pedido de mudança, sugira um comando para o "Antigravity" (seu braço executor).
    3. Mantenha o tom profissional e prestativo.`

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
