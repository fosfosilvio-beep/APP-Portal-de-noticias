import axios from "axios";
import FormData from "form-data";

const API_KEY = process.env.TWELVE_LABS_API_KEY;
const BASE_URL = "https://api.twelvelabs.io/v1.2";

/**
 * Módulo de Integração Twelve Labs (Pegasus-1)
 * Responsável por entender vídeos e gerar matérias jornalísticas.
 */
export const twelveLabs = {
  /**
   * Obtém ou cria um Index padrão para o portal.
   */
  async getOrCreateIndex(indexName = "PortalNoticias") {
    try {
      console.log(`[TwelveLabs] Verificando existência do Index: ${indexName}`);
      const res = await axios.get(`${BASE_URL}/indexes`, {
        headers: { "x-api-key": API_KEY }
      });
      
      const existing = res.data.data.find((idx: any) => idx.index_name === indexName);
      if (existing) {
        console.log(`[TwelveLabs] Index encontrado ID: ${existing._id}`);
        return existing._id;
      }

      console.log(`[TwelveLabs] Criando novo Index: ${indexName}`);
      const createRes = await axios.post(`${BASE_URL}/indexes`, {
        index_name: indexName,
        engines: [
          { engine_name: "marengo2.6", engine_options: ["visual", "conversation"] },
          { engine_name: "pegasus1", engine_options: ["visual", "conversation"] }
        ]
      }, {
        headers: { "x-api-key": API_KEY }
      });

      console.log(`[TwelveLabs] Index criado com sucesso ID: ${createRes.data._id}`);
      return createRes.data._id;
    } catch (err: any) {
      console.error("[TwelveLabs] Erro Index (CRÍTICO):", err.response?.data || err.message);
      throw new Error(`Erro na Twelve Labs (Index): ${JSON.stringify(err.response?.data || err.message)}`);
    }
  },

  /**
   * Envia um vídeo via Multipart Form Data para indexação.
   * @param indexId ID do Index
   * @param videoBuffer Buffer do vídeo baixado
   * @param fileName Nome do arquivo
   */
  async submitTaskDirect(indexId: string, videoBuffer: Buffer, fileName: string) {
    try {
      console.log(`[TwelveLabs] Iniciando upload direto (multipart/form-data) para Index: ${indexId}`);
      const form = new FormData();
      form.append("index_id", indexId);
      form.append("video_file", videoBuffer, { filename: fileName });
      form.append("language", "pt");

      const res = await axios.post(`${BASE_URL}/tasks`, form, {
        headers: { 
          ...form.getHeaders(),
          "x-api-key": API_KEY 
        }
      });
      
      console.log(`[TwelveLabs] Task de upload criada ID: ${res.data._id}`);
      return res.data._id;
    } catch (err: any) {
      console.error("[TwelveLabs] Erro Task Upload (CRÍTICO):", err.response?.data || err.message);
      throw new Error(`Erro na Twelve Labs (Upload): ${JSON.stringify(err.response?.data || err.message)}`);
    }
  },

  /**
   * Aguarda a conclusão da indexação (Polling).
   */
  async waitForTask(taskId: string) {
    let status = "pending";
    console.log(`[TwelveLabs] Aguardando Task ${taskId}...`);
    
    while (status !== "ready" && status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const res = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
        headers: { "x-api-key": API_KEY }
      });
      status = res.data.status;
      console.log(`[TwelveLabs] Status Task ${taskId}: ${status}`);
      if (status === "failed") {
        console.error("[TwelveLabs] Task falhou:", res.data);
        throw new Error("A indexação do vídeo falhou na Twelve Labs.");
      }
    }

    const resFinal = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
      headers: { "x-api-key": API_KEY }
    });
    return resFinal.data.video_id;
  },

  /**
   * Gera o conteúdo jornalístico usando Pegasus-1.
   */
  async generateContent(videoId: string, prompt: string) {
    try {
      console.log(`[TwelveLabs] Solicitando geração de conteúdo para VideoID: ${videoId}`);
      const res = await axios.post(`${BASE_URL}/generate`, {
        video_id: videoId,
        prompt: prompt
      }, {
        headers: { "x-api-key": API_KEY }
      });
      return res.data.data;
    } catch (err: any) {
      console.error("[TwelveLabs] Erro Pegasus (CRÍTICO):", err.response?.data || err.message);
      throw new Error(`Erro na Twelve Labs (Pegasus): ${JSON.stringify(err.response?.data || err.message)}`);
    }
  }
};
