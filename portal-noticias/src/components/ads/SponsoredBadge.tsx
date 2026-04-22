import { ShieldCheck } from "lucide-react";

interface SponsoredBadgeProps {
  className?: string;
}

export function SponsoredBadge({ className = "" }: SponsoredBadgeProps) {
  return (
    <div className={`flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-amber-500 w-fit ${className}`}>
      <ShieldCheck size={12} />
      Patrocinado
    </div>
  );
}
