/**
 * Utilitários para tratamento de imagens e URLs de mídia
 */

export const getPublicUrl = (src: string | null | undefined, bucketName = "media") => {
  if (!src) return null;

  // Remove barras duplas iniciais
  let cleanSrc = src.replace(/^\/\/+/, "/");

  // Se já for uma URL completa, retorna ela mesma
  if (cleanSrc.startsWith("http://") || cleanSrc.startsWith("https://") || cleanSrc.startsWith("data:")) {
    return cleanSrc;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ywsvdgzfmvecaoejtlxo.supabase.co";
  
  // Tenta extrair o bucket se o path começar com um bucket conhecido
  const knownBuckets = ["media", "videos_biblioteca", "ads", "avatars"];
  let finalBucket = bucketName;
  let finalPath = cleanSrc.replace(/^\/+/, "");

  for (const b of knownBuckets) {
    if (finalPath.startsWith(`${b}/`)) {
      finalBucket = b;
      finalPath = finalPath.replace(`${b}/`, "");
      break;
    }
  }

  return `${supabaseUrl}/storage/v1/object/public/${finalBucket}/${finalPath}`;
};

export const getAbsoluteUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nossawebtv.com.br";
  if (!siteUrl.startsWith("http")) siteUrl = `https://${siteUrl}`;
  
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  
  return `${cleanSiteUrl}/${cleanPath}`;
};

/**
 * Retorna uma URL otimizada para OpenGraph (JPG, dimensões controladas)
 * Se for uma URL do Supabase, utiliza a API de render/image se disponível
 */
export const getOptimizedImageUrl = (src: string | null | undefined, width = 1200, height = 630) => {
  const url = getPublicUrl(src);
  if (!url) return getAbsoluteUrl("/og-default.jpg");

  // Se for uma imagem do Supabase, tenta usar o redimensionamento nativo
  if (url.includes("supabase.co/storage/v1/object/public/")) {
    return url
      .replace("/object/public/", "/render/image/public/") + 
      `?width=${width}&height=${height}&format=jpg&quality=80`;
  }

  return url;
};
