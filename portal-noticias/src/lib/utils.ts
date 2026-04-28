import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatExternalUrl(url: string | null | undefined): string {
  if (!url) return "#";
  const trimmedUrl = url.trim();
  if (!trimmedUrl || trimmedUrl === "#") return "#";
  
  // Se já tiver protocolo, retorna como está
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // Força o prefixo https:// para URLs absolutas
  return `https://${trimmedUrl}`;
}
