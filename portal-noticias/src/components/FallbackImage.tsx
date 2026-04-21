"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
}

// Função helper: constrói URL pública do Supabase Storage
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

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`;
};

export default function FallbackImage({ src, alt, ...props }: FallbackImageProps) {
  const fallbackSrc = "/images/fallback.jpg";
  const [imgSrc, setImgSrc] = useState<string>(getPublicUrl(src) || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const newUrl = getPublicUrl(src) || fallbackSrc;
    setImgSrc(newUrl);
    setHasError(false);
  }, [src]);

  // Se a URL já falhou antes, usa fallback nativo <img> sem Next Image optimization
  if (hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt || "Imagem Indisponível"}
        className={(props.className as string) || "w-full h-full object-cover"}
      />
    );
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Imagem de Capa Indisponível"}
      unoptimized={true}
      onError={() => {
        setHasError(true);
        setImgSrc(fallbackSrc);
      }}
    />
  );
}
