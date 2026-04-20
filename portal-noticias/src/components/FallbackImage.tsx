"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
}

export default function FallbackImage({ src, alt, ...props }: FallbackImageProps) {
  const fallbackSrc = "/images/fallback.jpg";
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  // Se a prop src mudar, tentamos a nova
  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Imagem indisponível"}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
}
