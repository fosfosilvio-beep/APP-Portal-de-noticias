"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { trackImpression, trackClick } from "@/lib/ad-tracking";
import { SponsoredBadge } from "./SponsoredBadge";

interface AdSlotProps {
  id: string;
  html: string;
  width?: number;
  height?: number;
  isSponsored?: boolean;
  sanitized?: boolean;
  noticiaId?: string;
  className?: string;
}

export function AdSlot({ id, html, width, height, isSponsored, sanitized = true, noticiaId, className = "" }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [trackedView, setTrackedView] = useState(false);

  useEffect(() => {
    if (!containerRef.current || trackedView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !trackedView) {
            // Element is visible, set a timeout to check if it stays visible for 1s
            setTimeout(() => {
              if (entry.isIntersecting) {
                trackImpression(id, noticiaId);
                setTrackedView(true);
              }
            }, 1000);
          }
        });
      },
      { threshold: 0.5 } // 50% viewability required by IAB
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [id, trackedView, noticiaId]);

  const handleClick = () => {
    trackClick(id, noticiaId);
  };

  if (!html) return null;

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      className={`relative mx-auto flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ width: width || '100%', minHeight: height || 50 }}
    >
      {isSponsored && (
        <div className="w-full flex justify-end mb-1">
          <SponsoredBadge />
        </div>
      )}
      <div 
        className="w-full h-full flex items-center justify-center [&_img]:max-w-full [&_img]:max-h-full"
        dangerouslySetInnerHTML={{ __html: sanitized ? DOMPurify.sanitize(html) : html }} 
      />
    </div>
  );
}
