import axios from "axios";

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
  async getOrCreateIndex(indexName = "nossa-web-tv-index") {
    try {
      const res = await axios.get(`${BASE_URL}/indexes`, {
        headers: { "x-api-key": API_KEY }
      });
      
      const existing = res.data.data.find((idx: any) => idx.index_name === indexName);
      if (existing) return existing._id;

      const createRes = await axios.post(`${BASE_URL}/indexes`, {
        index_name: indexName,
        engines: [{ engine_name: "pegasus", engine_options: ["visual", "conversation"] }]
      }, {
        headers: { "x-api-key": API_KEY }
      });

      return createRes.data._id;
    } catch (err: any) {
      console.error("[TwelveLabs] Erro Index:", err.response?.data || err.message);
      throw new Error("Falha ao configurar Index na Twelve Labs.");
    }
  },

  /**
   * Envia um vídeo via URL para indexação.
   */
  async submitTask(indexId: string, videoUrl: string) {
    try {
      const res = await axios.post(`${BASE_URL}/tasks/external-provider`, {
        index_id: indexId,
        url: videoUrl
      }, {
        headers: { "x-api-key": API_KEY }
      });
      return res.data._id;
    } catch (err: any) {
      console.error("[TwelveLabs] Erro Task:", err.response?.data || err.message);
      throw new Error("Falha ao enviar vídeo para a Twelve Labs.");
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
      console.log(`[TwelveLabs] Status Task: ${status}`);
      if (status === "failed") throw new Error("A indexação do vídeo falhou na Twelve Labs.");
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
      const res = await axios.post(`${BASE_URL}/generate`, {
        video_id: videoId,
        prompt: prompt
      }, {
        headers: { "x-api-key": API_KEY }
      });
      return res.data.data;
    } catch (err: any) {
      console.error("[TwelveLabs] Erro Generate:", err.response?.data || err.message);
      throw new Error("Falha ao gerar matéria com Pegasus-1.");
    }
  }
};
