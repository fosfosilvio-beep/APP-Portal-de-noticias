"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
}

// Função helper solicitada pela Tarefa Técnica
export const getPublicUrl = (src: string | null | undefined, bucketName = "media") => {
  if (!src) return null;
  
  // Se já for HTTP(S) completo ou data URI, mantemos.
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  
  const cleanPath = src.replace(/^\/+/, '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ywsvdgzfmvecaoejtlxo.supabase.co";
  
  // Constrói OBRIGATORIAMENTE no padrão especificado
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`;
};

export default function FallbackImage({ src, alt, ...props }: FallbackImageProps) {
  const fallbackSrc = "/images/fallback.jpg";
  const [imgSrc, setImgSrc] = useState<string>(getPublicUrl(src) || fallbackSrc);

  // Re-avaliação se o path mudar via state lifting no parent
  useEffect(() => {
    const newUrl = getPublicUrl(src) || fallbackSrc;
    setImgSrc(newUrl);
  }, [src]);

  // Adicionamos o tracker log conforme solicitado
  useEffect(() => {
     console.log("URL da Imagem Gerada:", imgSrc);
  }, [imgSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Imagem de Capa Indisponível"}
      crossOrigin="anonymous"
      unoptimized={true}
      onError={(e) => {
        console.error("400/404 Detectado ao puxar midia de:", imgSrc);
        setImgSrc(fallbackSrc);
      }}
    />
  );
}
