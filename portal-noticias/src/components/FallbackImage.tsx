"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
}

import { getPublicUrl } from "@/lib/image-utils";

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
      onError={() => {
        setHasError(true);
        setImgSrc(fallbackSrc);
      }}
    />
  );
}
