/**
 * Utilitários de Vídeo e Tempo para o Sistema de Podcasts (V7)
 */

/**
 * Extrai o ID do vídeo do YouTube de URLs diversas
 */
export function getYouTubeID(url: string): string | null {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Converte string de tempo (HH:MM:SS ou MM:SS) para total de segundos
 */
export function timeToSeconds(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  
  const parts = timeStr.split(':').map(Number);
  let seconds = 0;

  if (parts.length === 3) {
    // HH:MM:SS
    seconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    seconds = (parts[0] * 60) + parts[1];
  }

  return isNaN(seconds) ? 0 : seconds;
}

/**
 * Converte segundos para string formatada HH:MM:SS
 */
export function secondsToTime(totalSeconds: number): string {
  if (!totalSeconds) return "00:00:00";
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map(v => v < 10 ? "0" + v : v)
    .join(":");
}
