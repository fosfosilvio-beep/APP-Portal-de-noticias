/**
 * Utilitários para tratamento de imagens e URLs de mídia
 */

export const getPublicUrl = (src: string | null | undefined, bucketName = "media") => {
  if (!src) return null;

  // Remove barras duplas iniciais (bug comum de paths relativos)
  let cleanSrc = src.replace(/^\/\/+/, "/");

  // Se já for HTTP(S) completo ou data URI, mantemos.
  if (cleanSrc.startsWith("http://") || cleanSrc.startsWith("https://") || cleanSrc.startsWith("data:")) {
    return cleanSrc;
  }

  const cleanPath = cleanSrc.replace(/^\/+/, "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ywsvdgzfmvecaoejtlxo.supabase.co";

  // Se for o bucket default 'media', usamos a estrutura padrão. 
  // Caso contrário, usamos o bucket informado (ex: 'videos_biblioteca')
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`;
};

export const getAbsoluteUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nossawebtv.com.br";
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const cleanUrl = url.replace(/^\//, "");
  
  return `${cleanSiteUrl}/${cleanUrl}`;
};
