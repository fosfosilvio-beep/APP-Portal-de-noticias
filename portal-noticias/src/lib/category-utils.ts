export const categoryMap: Record<string, string> = {
  "Politica": "Política",
  "Educacao": "Educação",
  "Saude": "Saúde",
  "Policia": "Polícia",
  "Entretenimento": "Entretenimento",
  "Esportes": "Esportes",
  "Geral": "Geral",
  "Arapongas": "Arapongas",
};

/**
 * Retorna o nome visual formatado (com acento) a partir do valor do banco.
 */
export function getVisualCategory(dbCategory: string | null): string {
  if (!dbCategory) return "Geral";
  
  // Tenta match exato primeiro
  if (categoryMap[dbCategory]) return categoryMap[dbCategory];
  
  // Tenta match normalizado (sem acentos e case insensitive)
  const normalizedInput = dbCategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  for (const [key, value] of Object.entries(categoryMap)) {
    const keyNormalized = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (keyNormalized === normalizedInput) return value;
  }
  
  // Se for algo não mapeado, retorna capitalizado
  return dbCategory.charAt(0).toUpperCase() + dbCategory.slice(1).toLowerCase();
}

/**
 * Normaliza uma string para comparação robusta ou query no banco.
 * Remove acentos e converte para minúsculas.
 */
export function normalizeCategory(cat: string): string {
  return cat.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
